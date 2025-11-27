"use server"

import { randomUUID } from "crypto"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const BUCKET_NAME = "spots"

function buildPath(folder) {
  const normalized = folder?.replace(/^\/+|\/+$/g, "") || "uploads"
  return normalized
}

export async function uploadFileToStorage(file, folder = "uploads") {
  if (!file) return null
  
  // In server actions, instanceof File doesn't work reliably
  // Check for file-like object properties instead
  if (typeof file !== 'object' || !file.size || file.size === 0) {
    console.log("uploadFileToStorage: Invalid file object", { 
      type: typeof file, 
      hasSize: !!file?.size,
      size: file?.size 
    })
    return null
  }

  const extension = file.name?.split(".").pop() || "dat"
  const fileName = `${buildPath(folder)}/${randomUUID()}.${extension}`

  console.log("uploadFileToStorage: Uploading", { fileName, size: file.size, type: file.type })

  const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).upload(fileName, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || "application/octet-stream",
  })

  if (error) {
    // Provide more helpful error message for RLS/policy issues
    if (error.message?.includes("row-level security") || error.message?.includes("policy")) {
      throw new Error(
        `Storage upload failed due to permissions. Please ensure:\n` +
        `1. The "spots" storage bucket exists in Supabase\n` +
        `2. The bucket allows public uploads OR you have set SUPABASE_SERVICE_ROLE_KEY environment variable\n` +
        `3. Storage policies allow uploads from your application\n` +
        `Original error: ${error.message}`
      )
    }
    throw new Error(error.message || "Failed to upload file")
  }

  const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(fileName)
  return data?.publicUrl || null
}

export async function uploadFilesToStorage(files, folder = "uploads") {
  if (!files) return []

  console.log("uploadFilesToStorage: Processing", files.length, "files")

  const uploads = []
  for (const file of files) {
    // In server actions, instanceof File doesn't work reliably
    // Check for file-like object properties instead
    if (!file || typeof file !== 'object' || !file.size || file.size === 0) {
      console.log("uploadFilesToStorage: Skipping invalid file", { 
        type: typeof file, 
        hasSize: !!file?.size 
      })
      continue
    }
    const url = await uploadFileToStorage(file, folder)
    if (url) uploads.push(url)
  }
  
  console.log("uploadFilesToStorage: Uploaded", uploads.length, "files")
  return uploads
}

/**
 * Delete files from Supabase Storage
 * @param {string[]} urls - Array of public URLs to delete
 * @returns {Promise<{success: boolean, deleted: number, errors: string[]}>}
 */
export async function deleteFilesFromStorage(urls) {
  if (!urls || urls.length === 0) return { success: true, deleted: 0, errors: [] }

  const errors = []
  let deleted = 0

  for (const url of urls) {
    try {
      if (!url || typeof url !== 'string') continue
      
      // Extract the file path from the public URL
      // URL format: https://xxx.supabase.co/storage/v1/object/public/spots/folder/file.ext
      const match = url.match(/\/storage\/v1\/object\/public\/spots\/(.+)$/)
      if (!match || !match[1]) {
        console.warn(`Could not extract path from URL: ${url}`)
        continue
      }
      
      const filePath = match[1]
      
      const { error } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([filePath])
      
      if (error) {
        console.warn(`Failed to delete ${filePath}:`, error.message)
        errors.push(`${filePath}: ${error.message}`)
      } else {
        deleted++
      }
    } catch (err) {
      console.warn(`Error deleting file:`, err)
      errors.push(err.message)
    }
  }

  return { 
    success: errors.length === 0, 
    deleted, 
    errors 
  }
}

