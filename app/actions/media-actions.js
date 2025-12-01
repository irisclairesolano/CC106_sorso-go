"use server"

import { supabase } from "@/lib/supabaseClient"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

const BUCKET_NAME = "spots"
const MEDIA_FOLDER = "uploads/media"
const STORIES_FOLDER = "stories"
const STORIES_GALLERY_FOLDER = "stories/gallery"

/**
 * Helper function to list files from a specific folder
 */
async function listFilesFromFolder(folder) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .list(folder, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.warn(`Error listing files from ${folder}:`, error.message)
      return []
    }

    // Filter out folders and map to include full URLs
    return (data || [])
      .filter(file => file.name && !file.name.endsWith('/'))
      .map(file => {
        const path = `${folder}/${file.name}`
        const { data: urlData } = supabaseAdmin.storage
          .from(BUCKET_NAME)
          .getPublicUrl(path)
        
        return {
          id: `${folder}-${file.id || file.name}`, // Unique ID with folder prefix
          name: file.name,
          path: path,
          url: urlData?.publicUrl || '',
          size: formatFileSize(file.metadata?.size || 0),
          type: file.metadata?.mimetype || 'image/jpeg',
          created_at: file.created_at,
          source: folder // Track which folder the file came from
        }
      })
  } catch (error) {
    console.warn(`Error processing files from ${folder}:`, error.message)
    return []
  }
}

/**
 * Get all media files from the storage bucket
 * Now includes files from uploads/media, stories, and stories/gallery folders
 */
export async function getMediaFiles() {
  try {
    // Fetch files from all folders in parallel
    const [mediaFiles, storiesFiles, galleryFiles] = await Promise.all([
      listFilesFromFolder(MEDIA_FOLDER),
      listFilesFromFolder(STORIES_FOLDER),
      listFilesFromFolder(STORIES_GALLERY_FOLDER)
    ])

    // Combine all files
    const allFiles = [...mediaFiles, ...storiesFiles, ...galleryFiles]

    // Remove duplicates based on URL (same image might exist in multiple folders)
    const uniqueFiles = []
    const seenUrls = new Set()
    
    for (const file of allFiles) {
      if (file.url && !seenUrls.has(file.url)) {
        seenUrls.add(file.url)
        uniqueFiles.push(file)
      }
    }

    // Sort by created_at descending (newest first)
    uniqueFiles.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })

    return { success: true, data: uniqueFiles }
  } catch (error) {
    console.error("Error in getMediaFiles:", error)
    return { success: false, error: error.message || "Failed to fetch media files" }
  }
}

/**
 * Upload a file to the media library
 */
export async function uploadMediaFile(formData) {
  try {
    const file = formData.get('file')
    
    if (!file || typeof file !== 'object' || !file.size) {
      return { success: false, error: "No valid file provided" }
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." }
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File too large. Maximum size is 5MB." }
    }

    // Generate unique filename
    const extension = file.name?.split('.').pop() || 'jpg'
    const fileName = `${randomUUID()}.${extension}`
    const filePath = `${MEDIA_FOLDER}/${fileName}`

    console.log("Uploading media file:", { fileName, size: file.size, type: file.type })

    // Upload to Supabase storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    const mediaItem = {
      id: fileName,
      name: file.name || fileName,
      path: filePath,
      url: urlData?.publicUrl || '',
      size: formatFileSize(file.size),
      type: file.type
    }

    console.log("Media file uploaded successfully:", mediaItem.url)

    return { success: true, data: mediaItem }
  } catch (error) {
    console.error("Error in uploadMediaFile:", error)
    return { success: false, error: error.message || "Failed to upload file" }
  }
}

/**
 * Delete a file from the media library
 */
export async function deleteMediaFile(path) {
  try {
    if (!path) {
      return { success: false, error: "No file path provided" }
    }

    console.log("Deleting media file:", path)

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error("Delete error:", error)
      return { success: false, error: error.message }
    }

    console.log("Media file deleted successfully")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteMediaFile:", error)
    return { success: false, error: error.message || "Failed to delete file" }
  }
}

/**
 * Format file size to human readable string
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// ============================================
// Legacy functions for story-specific media
// ============================================

export async function getMediaForStory(storyId) {
  const { data, error } = await supabase.from("media").select("*").eq("story_id", storyId)

  if (error) return []
  return data
}

export async function uploadMedia(formData) {
  const story_id = formData.get("story_id")
  const url = formData.get("url")
  const type = formData.get("type") || "image"
  const caption = formData.get("caption")

  const { data, error } = await supabase.from("media").insert([{ story_id, url, type, caption }]).select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/stories/${story_id}`)
  return { success: true, data }
}

export async function updateMedia(id, formData) {
  const caption = formData.get("caption")

  const { data, error } = await supabase.from("media").update({ caption }).eq("id", id).select()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function deleteMedia(id) {
  const { error } = await supabase.from("media").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
