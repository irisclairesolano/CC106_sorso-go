"use server"

import { uploadFilesToStorage } from "@/lib/storage"
import { supabase } from "@/lib/supabaseClient"
import { revalidatePath } from "next/cache"

export async function getDestinations(includeAll = false) {
  let query = supabase.from("tourist_destination").select("*")
  
  // If not including all, filter for only approved or published destinations
  if (!includeAll) {
    query = query.in('status', ['approved', 'published'])
  }
  
  query = query.order("id", { ascending: true })
  
  const { data, error } = await query

  if (error) {
    console.error("Error fetching destinations:", error)
    return []
  }
  return data || []
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
  try {
    if (!supabase) {
      console.error("Supabase client is not initialized");
      return [];
    }

    // Try a simple query to check if the table exists
    const { data, error } = await supabase
      .from("tourist_destination")
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        console.log("The 'tourist_destination' table does not exist in your database.");
        return [];
      }
      console.error("Error querying tourist_destination table:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    // If we get here, the table exists, so let's get the actual data
    const { data: destinations, error: fetchError } = await supabase
      .from("tourist_destination")
      .select("*")
      .in('status', ['approved', 'published'])
      .order("created_at", { ascending: false })
      .limit(6);

    if (fetchError) {
      console.error("Error fetching featured destinations:", {
        message: fetchError.message,
        details: fetchError.details,
        hint: fetchError.hint,
        code: fetchError.code
      });
      return [];
    }

    return destinations || [];

  } catch (error) {
    console.error("Unexpected error in getFeaturedDestinations:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return [];
  }
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

    // ===== Cover Image Handling =====
    const coverImage = formData.get("cover_image")

    if (coverImage instanceof File && coverImage.size > 0) {
      // New cover uploaded
      const [uploadedCover] = await uploadFilesToStorage([coverImage], "uploads/destinations/covers")
      if (uploadedCover) {
        payload.cover_image_url = uploadedCover
      }
    } else if (formData.get("existing_cover_image")) {
      // Keep existing cover image as-is
      payload.cover_image_url = formData.get("existing_cover_image")
    } else {
      // User removed the cover image
      payload.cover_image_url = null
    }

    // ===== Gallery Images Handling =====
    const imagesToDelete = JSON.parse(formData.get("images_to_delete") || "[]")

    // New image files selected by the user
    const newGalleryFiles = Array.from(formData.getAll("article_images")).filter(
      (file) => file instanceof File && file.size > 0,
    )

    let uploadedGalleryImages = []
    if (newGalleryFiles.length > 0) {
      uploadedGalleryImages = await uploadFilesToStorage(newGalleryFiles, "uploads/destinations/articles")
    }

    // Existing gallery URLs that the user kept (not in imagesToDelete)
    const existingGallery = JSON.parse(formData.get("existing_article_images") || "[]")
      .filter((url) => !imagesToDelete.includes(url))

    // Merge existing + newly uploaded
    payload.article_images = [...existingGallery, ...uploadedGalleryImages]

    // ===== Optional storage cleanup of deleted images =====
    if (imagesToDelete.length > 0) {
      try {
        const paths = imagesToDelete.map((fullUrl) => {
          try {
            const { pathname } = new URL(fullUrl)
            // pathname like /storage/v1/object/public/<bucket>/<key>
            // Extract everything after the bucket name
            const parts = pathname.split("/object/public/")
            return parts.length === 2 ? parts[1] : null
          } catch {
            return null
          }
        }).filter(Boolean)

        if (paths.length > 0) {
          // NOTE: replace 'uploads' with your actual bucket name if different
          await supabase.storage.from("uploads").remove(paths)
        }
      } catch (cleanupErr) {
        console.error("Image cleanup error:", cleanupErr)
        // Do not fail request if cleanup fails
      }
    }

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
