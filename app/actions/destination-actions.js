"use server"

import { supabase } from "@/lib/supabaseClient"
import { uploadFilesToStorage } from "@/lib/storage"
import { revalidatePath } from "next/cache"

export async function getDestinations() {
  const { data, error } = await supabase.from("tourist_destination").select("*").order("id", { ascending: true })

  if (error) {
    console.error("Error fetching destinations:", error)
    return []
  }
  return data
}

export async function getDestinationById(id) {
  const { data, error } = await supabase.from("tourist_destination").select("*").eq("id", id).single()

  if (error) return null
  return data
}

export async function getFeaturedDestinations() {
  const { data, error } = await supabase
    .from("tourist_destination")
    .select("*")
    .order("id", { ascending: true })
    .limit(3)

  if (error) return []
  return data
}

export async function createDestination(formData) {
  const name = formData.get("name")
  const category = formData.get("category") || "General"
  const description = formData.get("description")
  const article_content = formData.get("article_content") || ""
  const address = formData.get("address") || ""
  const coordinates = formData.get("coordinates") || ""
  const status = formData.get("status") || "draft"
  const images = formData.getAll("images").filter((file) => file instanceof File)

  const imageGallery = images.length ? await uploadFilesToStorage(images, "uploads/destinations") : []
  const coverImage = imageGallery[0] || formData.get("image_url") || ""

  const { data, error } = await supabase
    .from("tourist_destination")
    .insert([
      {
        name,
        category,
        description,
        article_content,
        address,
        coordinates,
        status,
        image_url: coverImage,
        image_gallery: imageGallery,
      },
    ])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/destinations")
  revalidatePath("/admin")
  return { success: true, data }
}

export async function updateDestination(id, formData) {
  try {
    console.log("updateDestination called with id:", id)
    const name = formData.get("name")
    const category = formData.get("category")
    const description = formData.get("description")
    const article_content = formData.get("article_content")
    const address = formData.get("address")
    const coordinates = formData.get("coordinates")
    const status = formData.get("status")
    const existingGallery = JSON.parse(formData.get("existing_gallery") || "[]")
    const images = formData.getAll("images").filter((file) => file instanceof File)

    let uploadedImages = []
    if (images.length > 0) {
      try {
        uploadedImages = await uploadFilesToStorage(images, "uploads/destinations")
        console.log("Uploaded images:", uploadedImages)
      } catch (uploadError) {
        console.error("Image upload error:", uploadError)
        return { success: false, error: `Failed to upload images: ${uploadError.message}` }
      }
    }
    
    const image_gallery = [...existingGallery, ...uploadedImages]
    const payload = {
      name,
      category,
      description,
      article_content,
      address,
      coordinates,
      status,
      image_gallery,
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
        delete payload[key]
      }
    })

    if (!image_gallery.length && formData.get("image_url")) {
      payload.image_url = formData.get("image_url")
    } else if (image_gallery.length) {
      payload.image_url = image_gallery[0]
    }

    console.log("Updating destination with payload:", { id, payload })
    const { data, error } = await supabase
      .from("tourist_destination")
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase update error:", error)
      return { success: false, error: error.message }
    }

    console.log("Destination updated successfully:", data)
    revalidatePath("/destinations")
    revalidatePath("/admin")
    revalidatePath(`/destinations/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("updateDestination unexpected error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function deleteDestination(id) {
  const { error } = await supabase.from("tourist_destination").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/destinations")
  revalidatePath("/admin")
  return { success: true }
}
