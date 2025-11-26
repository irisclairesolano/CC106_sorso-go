"use server"

import { uploadFilesToStorage } from "@/lib/storage"
import { supabase } from "@/lib/supabaseClient"
import { revalidatePath } from "next/cache"

/**
 * Get all festivals, ordered by start date
 */
export async function getFestivals() {
  const { data, error } = await supabase
    .from("festival")
    .select("*")
    .order("start_date", { ascending: true })

  if (error) {
    console.error("Error fetching festivals:", error)
    return []
  }
  return data
}

/**
 * Get festivals for a specific month and year
 */
export async function getFestivalsByMonth(year, month) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`

  const { data, error } = await supabase
    .from("festival")
    .select("*")
    .gte("start_date", startDate)
    .lte("start_date", endDate)
    .order("start_date", { ascending: true })

  if (error) {
    console.error("Error fetching festivals by month:", error)
    return []
  }
  return data
}

/**
 * Get upcoming festivals (starting from today)
 */
export async function getUpcomingFestivals() {
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("festival")
    .select("*")
    .gte("start_date", today)
    .order("start_date", { ascending: true })
    .limit(10)

  if (error) {
    console.error("Error fetching upcoming festivals:", error)
    return []
  }
  return data
}

/**
 * Get a single festival by ID
 */
export async function getFestivalById(id) {
  const { data, error } = await supabase
    .from("festival")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching festival:", error)
    return null
  }
  return data
}

/**
 * Create a new festival (Admin only)
 */
export async function createFestival(formData) {
  const name = formData.get("name")
  const description = formData.get("description")
  const start_date = formData.get("start_date")
  const end_date = formData.get("end_date")
  const location = formData.get("location")
  const images = formData.getAll("images").filter((file) => file instanceof File)
  const image_gallery = images.length ? await uploadFilesToStorage(images, "uploads/festivals") : []
  const image_url = image_gallery[0] || formData.get("image_url")

  const { data, error } = await supabase
    .from("festival")
    .insert([{ name, description, start_date, end_date, location, image_url, image_gallery }])
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/festivals")
  revalidatePath("/admin")
  return { success: true, data }
}

/**
 * Update an existing festival (Admin only)
 */
export async function updateFestival(id, formData) {
  const name = formData.get("name")
  const description = formData.get("description")
  const start_date = formData.get("start_date")
  const end_date = formData.get("end_date")
  const location = formData.get("location")

  // Safely parse the existing gallery payload which may arrive as JSON or stringified JSON
  const existingGalleryRaw = formData.get("existing_gallery") || "[]"
  let existingGallery = []

  try {
    const parsed = JSON.parse(existingGalleryRaw)
    if (Array.isArray(parsed)) {
      existingGallery = parsed
    } else if (typeof parsed === "string") {
      const reParsed = JSON.parse(parsed)
      if (Array.isArray(reParsed)) {
        existingGallery = reParsed
      }
    }
  } catch (error) {
    console.warn("updateFestival: failed to parse existing_gallery", error)
    existingGallery = []
  }

  const images = formData
    .getAll("images")
    .filter((file) => file instanceof File)
  const uploaded = images.length ? await uploadFilesToStorage(images, "uploads/festivals") : []

  // Place newly uploaded images first so the latest upload becomes the cover
  let image_gallery = uploaded.length
    ? [...uploaded, ...existingGallery]
    : [...existingGallery]

  // Remove falsy values and duplicates while preserving order
  const seen = new Set()
  image_gallery = image_gallery.filter((url) => {
    if (!url || typeof url !== "string") return false
    if (seen.has(url)) return false
    seen.add(url)
    return true
  })

  const payload = { name, description, start_date, end_date, location, image_gallery }

  if (uploaded.length > 0) {
    payload.image_url = uploaded[0]
  } else if (image_gallery.length > 0) {
    payload.image_url = image_gallery[0]
  } else if (formData.get("image_url")) {
    payload.image_url = formData.get("image_url")
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
      delete payload[key]
    }
  })

  const { data, error } = await supabase
    .from("festival")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/festivals")
  revalidatePath(`/festivals/${id}`)
  revalidatePath("/admin")
  return { success: true, data }
}

/**
 * Delete a festival (Admin only)
 */
export async function deleteFestival(id) {
  const { error } = await supabase.from("festival").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/festivals")
  revalidatePath("/admin")
  return { success: true }
}

