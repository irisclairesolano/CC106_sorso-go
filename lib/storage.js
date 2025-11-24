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
  if (!(file instanceof File)) return null

  const extension = file.name?.split(".").pop() || "dat"
  const fileName = `${buildPath(folder)}/${randomUUID()}.${extension}`

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

  const uploads = []
  for (const file of files) {
    if (!(file instanceof File)) continue
    const url = await uploadFileToStorage(file, folder)
    if (url) uploads.push(url)
  }
  return uploads
}

