"use server"

import { uploadFilesToStorage, deleteFilesFromStorage } from "@/lib/storage"
import { supabase } from "@/lib/supabaseClient"
import { revalidatePath } from "next/cache"

export async function getStories() {
  const { data, error } = await supabase
    .from("story")
    .select(`
      *,
      story_tag (
        tag (
          id,
          name
        )
      )
    `)
    .eq('approved', true)
    .order("created_at", { ascending: false })

  if (error) {
    const errorInfo = {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      ...(error.stack && { stack: error.stack })
    }
    console.error("Error fetching stories:", JSON.stringify(errorInfo, null, 2))
    return []
  }

  // Transform data to flatten tags and normalize image fields
  return data.map((story) => ({
    ...story,
    tags: story.story_tag?.map((st) => st.tag) || [],
    image_url: story.image_url || story.cover_image_url || null,
    image_gallery: story.image_gallery || story.article_images || [],
  }))
}

export async function getStoryById(id) {
  const { data, error } = await supabase
    .from("story")
    .select(`
      *,
      story_tag (
        tag (
          id,
          name
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    const errorInfo = {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      ...(error.stack && { stack: error.stack })
    }
    console.error("Error fetching story:", JSON.stringify(errorInfo, null, 2))
    return null
  }

  return {
    ...data,
    tags: data.story_tag?.map((st) => st.tag) || [],
    image_url: data.image_url || data.cover_image_url || null,
    image_gallery: data.image_gallery || data.article_images || [],
  }
}

export async function getStoriesByDestination(destinationId) {
  const { data, error } = await supabase
    .from("story")
    .select(`
      *,
      story_tag (
        tag (
          id,
          name
        )
      )
    `)
    .eq("destination_id", destinationId)
    .order("created_at", { ascending: false })

  if (error) return []

  return data.map((story) => ({
    ...story,
    tags: story.story_tag?.map((st) => st.tag) || [],
    image_url: story.image_url || story.cover_image_url || null,
    image_gallery: story.image_gallery || story.article_images || [],
  }))
}

/**
 * Helper function to sync story tags
 * Creates new tags if they don't exist, then links them to the story
 */
async function syncStoryTags(storyId, tagNames) {
  if (!storyId || !tagNames || tagNames.length === 0) {
    // Remove all existing tags if no new tags provided
    await supabase.from("story_tag").delete().eq("story_id", storyId)
    return { success: true }
  }

  try {
    // First, remove all existing story_tag entries for this story
    await supabase.from("story_tag").delete().eq("story_id", storyId)

    // Get or create tags
    const tagIds = []
    for (const tagName of tagNames) {
      const normalizedName = tagName.trim().toLowerCase()
      if (!normalizedName) continue

      // Check if tag exists
      let { data: existingTag } = await supabase
        .from("tag")
        .select("id")
        .eq("name", normalizedName)
        .single()

      if (existingTag) {
        tagIds.push(existingTag.id)
      } else {
        // Create new tag
        const { data: newTag, error: createError } = await supabase
          .from("tag")
          .insert({ name: normalizedName })
          .select("id")
          .single()

        if (newTag && !createError) {
          tagIds.push(newTag.id)
        }
      }
    }

    // Create story_tag relationships
    if (tagIds.length > 0) {
      const storyTagEntries = tagIds.map(tagId => ({
        story_id: storyId,
        tag_id: tagId
      }))

      await supabase.from("story_tag").insert(storyTagEntries)
    }

    return { success: true }
  } catch (error) {
    console.error("Error syncing story tags:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Helper function to reconcile gallery images
 * Merges existing images with new ones, removing deleted ones
 */
function reconcileGalleryImages(existingGallery, newGallery, deletedImages) {
  // Parse inputs
  const existing = parseJsonSafe(existingGallery, [])
  const newImages = parseJsonSafe(newGallery, [])
  const deleted = parseJsonSafe(deletedImages, [])

  // Start with existing images, filter out deleted ones
  let result = existing.filter(url => !deleted.includes(url))

  // Add new images
  result = [...result, ...newImages]

  // Remove duplicates
  result = [...new Set(result)]

  return result
}

function parseJsonSafe(value, defaultValue = []) {
  if (!value) return defaultValue
  if (Array.isArray(value)) return value
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : defaultValue
  } catch {
    return defaultValue
  }
}

export async function createStory(formData) {
  try {
    // Extract form data
    const title = formData.get('title')
    const content = formData.get('content')
    const author_name = formData.get('author_name') || null
    
    // Handle destination_id
    let destination_id = formData.get('destination_id')
    destination_id = destination_id && !isNaN(parseInt(destination_id)) ? parseInt(destination_id) : null

    // Handle tags - parse JSON array or comma-separated string
    let tags = []
    const tagsValue = formData.get('tags')
    if (tagsValue) {
      tags = parseJsonSafe(tagsValue, [])
      if (tags.length === 0 && typeof tagsValue === 'string') {
        // Try comma-separated parsing
        tags = tagsValue.split(',').map(t => t.trim()).filter(Boolean)
      }
    }

    // Handle images - support both 'images' (public form) and 'image_url'/'gallery_images' (admin form)
    let image_url = null
    let image_gallery = []
    
    // Check for cover image from admin form
    const coverImageValue = formData.get('image_url')
    if (coverImageValue) {
      if (typeof coverImageValue === 'string' && coverImageValue.startsWith('http')) {
        image_url = coverImageValue
      } else if (coverImageValue.size > 0) {
        const [uploadedCover] = await uploadFilesToStorage([coverImageValue], 'stories')
        if (uploadedCover) image_url = uploadedCover
      }
    }

    // Handle images from public submission form (field name: 'images')
    const publicImages = formData.getAll('images').filter(f => f && f.size > 0)
    if (publicImages.length > 0) {
      const uploadedPublicImages = await uploadFilesToStorage(publicImages, 'stories')
      if (uploadedPublicImages.length > 0) {
        // First image becomes cover, rest go to gallery
        if (!image_url) {
          image_url = uploadedPublicImages[0]
          image_gallery = uploadedPublicImages.slice(1)
        } else {
          image_gallery = [...image_gallery, ...uploadedPublicImages]
        }
      }
    }

    // Handle gallery images from admin form
    const existingGallery = parseJsonSafe(formData.get('existing_gallery'), [])
    const newGallery = parseJsonSafe(formData.get('new_gallery'), [])
    const galleryFiles = formData.getAll('gallery_images').filter(f => f && f.size > 0)
    
    if (galleryFiles.length > 0) {
      const uploadedGalleryUrls = await uploadFilesToStorage(galleryFiles, 'stories/gallery')
      image_gallery = [...image_gallery, ...uploadedGalleryUrls]
    }

    // Combine all gallery sources
    image_gallery = [...existingGallery, ...newGallery, ...image_gallery]

    // Determine if this is an admin submission (status = 'published' means auto-approve)
    const status = formData.get('status')
    const isAdminSubmission = status === 'published'
    
    const { data, error } = await supabase
      .from('story')
      .insert([{
        title,
        content,
        author_name,
        destination_id,
        image_url,
        image_gallery: image_gallery.length > 0 ? image_gallery : null,
        approved: isAdminSubmission // Public submissions are NOT approved, admin can approve directly
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // Sync tags
    if (tags.length > 0) {
      await syncStoryTags(data.id, tags)
    }

    revalidatePath("/stories")
    revalidatePath("/admin")
    
    return { 
      success: true, 
      data: {
        ...data,
        tags,
        image_gallery
      } 
    }
  } catch (error) {
    console.error('Error in createStory:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to create story. Please try again.' 
    }
  }
}

export async function updateStory(id, formData) {
  try {
    console.log("Updating story with id:", id)
    
    // Get existing story data
    const { data: existingStory, error: fetchError } = await supabase
      .from('story')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingStory) {
      throw new Error('Story not found')
    }

    // Build update payload
    const payload = {
      title: formData.get('title') || existingStory.title,
      content: formData.get('content') || existingStory.content,
      author_name: formData.get('author_name') || existingStory.author_name,
    }

    // Handle approved status
    const status = formData.get('status')
    if (status) {
      payload.approved = status === 'published' || formData.get('approved') === 'true'
    } else if (formData.get('approved') !== null) {
      payload.approved = formData.get('approved') === 'true'
    }

    // Handle destination_id
    const destination_id = formData.get('destination_id')
    if (destination_id !== null && destination_id !== undefined) {
      payload.destination_id = destination_id === 'none' || destination_id === '' 
        ? null 
        : parseInt(destination_id)
    }

    // Handle cover image
    const coverImageValue = formData.get('image_url')
    if (coverImageValue !== null && coverImageValue !== undefined) {
      if (typeof coverImageValue === 'string') {
        payload.image_url = coverImageValue || null
      } else if (coverImageValue.size > 0) {
        const [uploadedCover] = await uploadFilesToStorage([coverImageValue], 'stories')
        if (uploadedCover) payload.image_url = uploadedCover
      }
    }

    // ===== Gallery Images Handling =====
    // Parse all gallery-related data
    const existingGalleryRaw = formData.get('existing_gallery')
    const newGalleryRaw = formData.get('new_gallery')
    const deletedImagesRaw = formData.get('deleted_images')

    // Determine if gallery data was explicitly sent
    const hasGalleryData = existingGalleryRaw !== null || newGalleryRaw !== null || deletedImagesRaw !== null

    const existingGallery = parseJsonSafe(existingGalleryRaw, [])
    const newGallery = parseJsonSafe(newGalleryRaw, [])
    const deletedImages = parseJsonSafe(deletedImagesRaw, [])

    console.log("Gallery processing:", {
      hasGalleryData,
      existingGallery,
      newGallery,
      deletedImages,
      existingFromDB: existingStory.image_gallery
    })

    // Upload any file-based gallery images
    const galleryFiles = formData.getAll('gallery_images').filter(f => f && f.size > 0)
    let uploadedGalleryUrls = []
    
    if (galleryFiles.length > 0) {
      uploadedGalleryUrls = await uploadFilesToStorage(galleryFiles, 'stories/gallery')
      console.log("Uploaded gallery files:", uploadedGalleryUrls)
    }

    // Only update gallery if gallery data was explicitly provided
    if (hasGalleryData) {
      // Start with existing images that the frontend is keeping (not deleted)
      const keptExistingImages = existingGallery.filter(url => !deletedImages.includes(url))
      
      // Merge: kept existing + new URLs from media library + newly uploaded files
      const allNewImages = [...newGallery, ...uploadedGalleryUrls]
      const finalGallery = [...keptExistingImages, ...allNewImages]
      
      // Remove duplicates while preserving order
      const uniqueGallery = [...new Set(finalGallery)]
      
      payload.image_gallery = uniqueGallery.length > 0 ? uniqueGallery : null
      
      console.log("Final gallery:", payload.image_gallery)
    } else if (uploadedGalleryUrls.length > 0) {
      // Fallback: Just add new file uploads to existing gallery (no frontend tracking)
      payload.image_gallery = [
        ...(existingStory.image_gallery || []),
        ...uploadedGalleryUrls
      ]
    }
    // else: no gallery changes, don't update image_gallery field

    // Delete removed images from storage (optional cleanup)
    if (deletedImages.length > 0) {
      try {
        await deleteFilesFromStorage(deletedImages)
        console.log("Deleted images from storage:", deletedImages)
      } catch (deleteErr) {
        console.warn('Could not delete old images from storage:', deleteErr)
      }
    }

    // Handle tags
    const tagsValue = formData.get('tags')
    let tags = []
    if (tagsValue) {
      tags = parseJsonSafe(tagsValue, [])
      if (tags.length === 0 && typeof tagsValue === 'string') {
        tags = tagsValue.split(',').map(t => t.trim()).filter(Boolean)
      }
    }

    // Handle SEO fields if provided
    const seoFields = ['seo_title', 'seo_description', 'seo_keywords', 'seo_image']
    seoFields.forEach(field => {
      const value = formData.get(field)
      if (value !== null && value !== undefined) {
        payload[field] = value || null
      }
    })

    console.log("Final update payload:", payload)
    
    const { data, error: updateError } = await supabase
      .from('story')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    // Sync tags (always, even if empty to clear old tags)
    await syncStoryTags(id, tags)

    // Revalidate relevant paths
    revalidatePath('/stories')
    revalidatePath(`/stories/${id}`)
    revalidatePath('/admin')
    
    return { 
      success: true, 
      data: {
        ...data,
        tags
      }
    }
  } catch (error) {
    console.error("updateStory error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function deleteStory(id) {
  try {
    // First, get the story to find images to delete
    const { data: story } = await supabase
      .from("story")
      .select("image_url, image_gallery")
      .eq("id", id)
      .single()

    // Delete the story (this should cascade delete story_tag entries)
    const { error } = await supabase.from("story").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Optionally clean up images from storage
    if (story) {
      const imagesToDelete = [
        story.image_url,
        ...(story.image_gallery || [])
      ].filter(Boolean)

      if (imagesToDelete.length > 0) {
        try {
          await deleteFilesFromStorage(imagesToDelete)
        } catch (err) {
          console.warn('Could not clean up story images:', err)
        }
      }
    }

    revalidatePath("/stories")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("deleteStory error:", error)
    return { success: false, error: error.message }
  }
}
