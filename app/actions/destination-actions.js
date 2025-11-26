"use server"

import { uploadFilesToStorage } from "@/lib/storage"
import { supabase } from "@/lib/supabaseClient"
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
  try {
    const { data, error } = await supabase
      .from("tourist_destination")
      .select(`
        *,
        cover_image_url,
        article_images
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching destination:", error)
      return null
    }

    // Ensure consistent data structure
    return {
      ...data,
      // Backward compatibility for any components still using the old field names
      image_url: data.cover_image_url || '',
      image_gallery: data.article_images || [],
      // Ensure arrays are never null
      article_images: data.article_images || []
    }
  } catch (error) {
    console.error("Error in getDestinationById:", error)
    return null
  }
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
  try {
    const name = formData.get("name")
    const category = formData.get("category") || "General"
    const description = formData.get("description")
    const article_content = formData.get("article_content") || ""
    const address = formData.get("address") || ""
    const coordinates = formData.get("coordinates") || ""
    const status = formData.get("status") || "draft"
    
    // Handle cover image
    const coverImage = formData.get("cover_image")
    let coverImageUrl = formData.get("existing_cover_image") || ""
    if (coverImage && coverImage.size > 0) {
      const [uploadedCover] = await uploadFilesToStorage([coverImage], "uploads/destinations/covers")
      if (uploadedCover) {
        coverImageUrl = uploadedCover
      }
    }

    // Handle article images
    const articleImages = Array.from(formData.getAll("article_images")).filter(
      file => file instanceof File && file.size > 0
    )
    
    let uploadedArticleImages = []
    if (articleImages.length > 0) {
      uploadedArticleImages = await uploadFilesToStorage(articleImages, "uploads/destinations/articles")
    }
    
    // Get existing article images from the form data
    const existingArticleImagesJson = formData.get("existing_article_images")
    const existingArticleImages = existingArticleImagesJson 
      ? JSON.parse(existingArticleImagesJson)
      : []
      
    // Combine existing and newly uploaded images
    const allArticleImages = [...existingArticleImages, ...uploadedArticleImages]

    const { data, error } = await supabase
      .from("tourist_destination")
      .insert([{
        name,
        category,
        description,
        article_content,
        address,
        coordinates,
        status,
        cover_image_url: coverImageUrl,
        article_images: allArticleImages
      }])
      .select()
      .single()

    if (error) {
      console.error("Create destination error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/destinations")
    revalidatePath("/admin")
    return { success: true, data }
  } catch (error) {
    console.error("Error in createDestination:", error)
    return { success: false, error: error.message || "Failed to create destination" }
  }
}

export async function updateDestination(id, formData) {
  try {
    const payload = {
      name: formData.get("name"),
      category: formData.get("category"),
      description: formData.get("description"),
      article_content: formData.get("article_content"),
      address: formData.get("address"),
      coordinates: formData.get("coordinates"),
      status: formData.get("status"),
    }

    // Handle cover image
    const coverImage = formData.get("cover_image")
    if (coverImage instanceof File) {
      const [uploadedCover] = await uploadFilesToStorage([coverImage], "uploads/destinations/covers")
      if (uploadedCover) {
        payload.cover_image_url = uploadedCover
      }
    } else if (formData.get("existing_cover_image")) {
      payload.cover_image_url = formData.get("existing_cover_image")
    }

    // Handle article images
    const articleImages = formData.getAll("article_images").filter(file => file instanceof File)
    let uploadedArticleImages = []
    if (articleImages.length > 0) {
      uploadedArticleImages = await uploadFilesToStorage(articleImages, "uploads/destinations/articles")
    }
    const existingArticleImages = JSON.parse(formData.get("existing_article_images") || "[]")
    payload.article_images = [...existingArticleImages, ...uploadedArticleImages]

    // Clean up payload (remove undefined/null/empty values)
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
        delete payload[key]
      }
    })

    const { data, error } = await supabase
      .from("tourist_destination")
      .update(payload)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Update error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/destinations")
    revalidatePath("/admin")
    revalidatePath(`/destinations/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error in updateDestination:", error)
    return { success: false, error: error.message || "Failed to update destination" }
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
