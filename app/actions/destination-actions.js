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
    
    // Handle cover image (new: media library URL, fallback to legacy upload)
    const coverImageFromLibrary = formData.get("image_url")
    let coverImageUrl = typeof coverImageFromLibrary === "string" ? coverImageFromLibrary.trim() : ""

    if (!coverImageUrl) {
      const coverImageFile = formData.get("cover_image")
      const existingCover = formData.get("existing_cover_image")
      if (coverImageFile && typeof coverImageFile === "object" && coverImageFile.size > 0) {
        const [uploadedCover] = await uploadFilesToStorage([coverImageFile], "uploads/destinations/covers")
        if (uploadedCover) {
          coverImageUrl = uploadedCover
        }
      } else if (typeof existingCover === "string" && existingCover.trim()) {
        coverImageUrl = existingCover.trim()
      }
    }

    // Handle article images (new: media library URLs, fallback to legacy upload)
    const galleryImagesJson = formData.get("gallery_images")
    let galleryImages = []

    if (typeof galleryImagesJson === "string" && galleryImagesJson.trim()) {
      try {
        const parsed = JSON.parse(galleryImagesJson)
        if (Array.isArray(parsed)) {
          galleryImages = parsed.filter((url) => typeof url === "string" && url.trim())
        }
      } catch (error) {
        console.warn("Failed to parse gallery_images JSON:", error)
      }
    }

    if (galleryImages.length === 0) {
      const articleImages = Array.from(formData.getAll("article_images")).filter(
        (file) => file && typeof file === "object" && file.size > 0,
      )

      let uploadedArticleImages = []
      if (articleImages.length > 0) {
        uploadedArticleImages = await uploadFilesToStorage(articleImages, "uploads/destinations/articles")
      }

      let existingArticleImages = []
      const existingArticleImagesJson = formData.get("existing_article_images")
      if (typeof existingArticleImagesJson === "string" && existingArticleImagesJson.trim()) {
        try {
          const parsed = JSON.parse(existingArticleImagesJson)
          if (Array.isArray(parsed)) {
            existingArticleImages = parsed.filter((url) => typeof url === "string" && url.trim())
          }
        } catch (error) {
          console.warn("Failed to parse existing_article_images JSON:", error)
        }
      }

      galleryImages = [...existingArticleImages, ...uploadedArticleImages]
    }

    // Remove duplicates while preserving order
    const uniqueGalleryImages = []
    const seenGallery = new Set()
    for (const url of galleryImages) {
      const trimmed = typeof url === "string" ? url.trim() : ""
      if (trimmed && !seenGallery.has(trimmed)) {
        seenGallery.add(trimmed)
        uniqueGalleryImages.push(trimmed)
      }
    }

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
        cover_image_url: coverImageUrl || null,
        article_images: uniqueGalleryImages
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
    console.log("updateDestination called with id:", id)
    
    // Get existing destination data first
    const { data: existingDestination, error: fetchError } = await supabase
      .from("tourist_destination")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !existingDestination) {
      console.error("Failed to fetch existing destination:", fetchError)
      return { success: false, error: "Destination not found" }
    }

    const payload = {
      name: formData.get("name") || existingDestination.name,
      category: formData.get("category") || existingDestination.category,
      description: formData.get("description") || existingDestination.description,
      article_content: formData.get("article_content") ?? existingDestination.article_content,
      address: formData.get("address") ?? existingDestination.address,
      coordinates: formData.get("coordinates") ?? existingDestination.coordinates,
      status: formData.get("status") || existingDestination.status,
    }

    // ===== Cover Image Handling =====
    const coverImageFromLibrary = formData.get("image_url")
    const existingCoverImage = formData.get("existing_cover_image")
    const coverImageFile = formData.get("cover_image")

    if (typeof coverImageFromLibrary === "string" && coverImageFromLibrary.trim()) {
      payload.cover_image_url = coverImageFromLibrary.trim()
    } else if (coverImageFile && typeof coverImageFile === 'object' && coverImageFile.size > 0) {
      // Legacy: uploaded file
      const [uploadedCover] = await uploadFilesToStorage([coverImageFile], "uploads/destinations/covers")
      if (uploadedCover) {
        payload.cover_image_url = uploadedCover
      }
    } else if (typeof existingCoverImage === "string" && existingCoverImage.trim()) {
      payload.cover_image_url = existingCoverImage.trim()
    } else {
      payload.cover_image_url = null
    }

    // ===== Gallery Images Handling =====
    const galleryImagesJson = formData.get("gallery_images")
    let galleryFromForm = []

    if (typeof galleryImagesJson === "string" && galleryImagesJson.trim()) {
      try {
        const parsed = JSON.parse(galleryImagesJson)
        if (Array.isArray(parsed)) {
          galleryFromForm = parsed.filter((url) => typeof url === "string" && url.trim())
        }
      } catch (error) {
        console.warn("Failed to parse gallery_images JSON in updateDestination:", error)
      }
    }

    let imagesToDelete = []
    const deletedImagesJson = formData.get("deleted_images") || formData.get("images_to_delete")
    if (typeof deletedImagesJson === "string" && deletedImagesJson.trim()) {
      try {
        const parsed = JSON.parse(deletedImagesJson)
        if (Array.isArray(parsed)) {
          imagesToDelete = parsed.filter((url) => typeof url === "string" && url.trim())
        }
      } catch (error) {
        console.warn("Failed to parse deleted images JSON in updateDestination:", error)
      }
    }

    let finalGallery = []

    if (galleryFromForm.length > 0) {
      const deduped = []
      const seen = new Set()
      for (const url of galleryFromForm) {
        const trimmed = url.trim()
        if (!trimmed || imagesToDelete.includes(trimmed) || seen.has(trimmed)) continue
        seen.add(trimmed)
        deduped.push(trimmed)
      }
      finalGallery = deduped
    } else {
      // Legacy fallback path (support old forms)
      let existingGallery = []
      try {
        existingGallery = JSON.parse(formData.get("existing_article_images") || "[]")
      } catch {
        existingGallery = []
      }

      const newGalleryFiles = Array.from(formData.getAll("article_images")).filter(
        (file) => file && typeof file === 'object' && file.size > 0,
      )

      let uploadedGalleryImages = []
      if (newGalleryFiles.length > 0) {
        uploadedGalleryImages = await uploadFilesToStorage(newGalleryFiles, "uploads/destinations/articles")
        console.log("Uploaded new gallery images (legacy path):", uploadedGalleryImages)
      }

      const keptExistingImages = existingGallery.filter((url) => !imagesToDelete.includes(url))
      const merged = [...keptExistingImages, ...uploadedGalleryImages]
      const deduped = []
      const seen = new Set()
      for (const url of merged) {
        const trimmed = typeof url === "string" ? url.trim() : ""
        if (!trimmed || seen.has(trimmed)) continue
        seen.add(trimmed)
        deduped.push(trimmed)
      }
      finalGallery = deduped
    }

    payload.article_images = finalGallery

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
          console.log("Deleted images from storage:", paths)
        }
      } catch (cleanupErr) {
        console.error("Image cleanup error:", cleanupErr)
        // Do not fail request if cleanup fails
      }
    }

    console.log("Final update payload:", payload)

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
