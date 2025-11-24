"use server"

import { supabase } from "@/lib/supabaseClient"
import { revalidatePath } from "next/cache"
import { uploadFilesToStorage } from "@/lib/storage"

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
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching stories:", error)
    return []
  }

  // Transform data to flatten tags
  return data.map((story) => ({
    ...story,
    tags: story.story_tag?.map((st) => st.tag) || [],
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

  if (error) return null

  return {
    ...data,
    tags: data.story_tag?.map((st) => st.tag) || [],
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
  }))
}

export async function createStory(formData) {
  const title = formData.get("title")
  const content = formData.get("content")
  const destination_id = formData.get("destination_id")
  const status = formData.get("status") || null
  const author_name = formData.get("author_name") || null
  const images = formData.getAll("images").filter((file) => file instanceof File)

  const image_gallery = images.length ? await uploadFilesToStorage(images, "uploads/stories") : []
  const image_url = image_gallery[0] || formData.get("image_url") || null

  const { data, error } = await supabase
    .from("story")
    .insert([{ title, content, destination_id, author_name, image_url, image_gallery, approved: status === "approved" }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/stories")
  revalidatePath("/admin")
  return { success: true, data }
}

export async function updateStory(id, formData) {
  try {
    console.log("updateStory called with id:", id)
    const title = formData.get("title")
    const content = formData.get("content")
    const destination_id = formData.get("destination_id")
    const status = formData.get("status")
    const author_name = formData.get("author_name")
    const existingGallery = JSON.parse(formData.get("existing_gallery") || "[]")
    const images = formData.getAll("images").filter((file) => file instanceof File)

    let uploaded = []
    if (images.length > 0) {
      try {
        uploaded = await uploadFilesToStorage(images, "uploads/stories")
        console.log("Uploaded images:", uploaded)
      } catch (uploadError) {
        console.error("Image upload error:", uploadError)
        return { success: false, error: `Failed to upload images: ${uploadError.message}` }
      }
    }
    
    const image_gallery = [...existingGallery, ...uploaded]
    const payload = {
      title,
      content,
      destination_id: destination_id || null,
      author_name: author_name || null,
      image_gallery,
    }

    if (status) {
      payload.approved = status === "approved"
    }

    if (image_gallery.length) {
      payload.image_url = image_gallery[0]
    } else if (formData.get("image_url")) {
      payload.image_url = formData.get("image_url")
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
        delete payload[key]
      }
    })

    console.log("Updating story with payload:", { id, payload })
    const { data, error } = await supabase.from("story").update(payload).eq("id", id).select().single()

    if (error) {
      console.error("Supabase update error:", error)
      return { success: false, error: error.message }
    }

    console.log("Story updated successfully:", data)
    revalidatePath("/stories")
    revalidatePath(`/stories/${id}`)
    revalidatePath("/admin")
    return { success: true, data }
  } catch (error) {
    console.error("updateStory unexpected error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function deleteStory(id) {
  const { error } = await supabase.from("story").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/stories")
  return { success: true }
}
