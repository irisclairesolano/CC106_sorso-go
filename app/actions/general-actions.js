"use server"

import { uploadFileToStorage, uploadFilesToStorage } from "@/lib/storage"
import { supabase } from "@/lib/supabaseClient"
import { revalidatePath } from "next/cache"

// Travel Tips
export async function getTravelTips() {
  const { data, error } = await supabase.from("travel_tip").select("*").order("created_at", { ascending: false })

  if (error) return []
  return data
}

export async function getTravelTipById(id) {
  const { data, error } = await supabase.from("travel_tip").select("*").eq("id", id).single()

  if (error) return null
  return data
}

export async function createTravelTip(formData) {
  try {
    console.log("createTravelTip called")
    const title = formData.get("title")
    const content = formData.get("content")

    if (!title || !content) {
      return { success: false, error: "Title and content are required" }
    }

    console.log("Inserting travel tip:", { title, content })
    const { data, error } = await supabase.from("travel_tip").insert([{ title, content }]).select()

    if (error) {
      console.error("Supabase insert error:", error)
      return { success: false, error: error.message }
    }

    console.log("Travel tip created successfully:", data)
    revalidatePath("/about")
    revalidatePath("/admin")
    return { success: true, data }
  } catch (error) {
    console.error("createTravelTip unexpected error:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function updateTravelTip(id, formData) {
  const title = formData.get("title")
  const content = formData.get("content")

  const { data, error } = await supabase.from("travel_tip").update({ title, content }).eq("id", id).select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/about")
  return { success: true, data }
}

export async function deleteTravelTip(id) {
  const { error } = await supabase.from("travel_tip").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/about")
  return { success: true }
}

// Contact
export async function submitContactForm(formData) {
  const name = formData.get("name")
  const email = formData.get("email")
  const subject = formData.get("subject")
  const message = formData.get("message")
  const attachments = formData.getAll("attachments").filter((file) => file && typeof file === 'object' && file.size > 0)
  const attachmentUrls = attachments.length
    ? await uploadFilesToStorage(attachments, "uploads/contact")
    : []

  const { error } = await supabase.from("contact").insert([{ name, email, subject, message, attachments: attachmentUrls }])

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function getContactMessages() {
  const { data, error } = await supabase.from("contact").select("*").order("created_at", { ascending: false })

  if (error) return []
  return data
}

// About
export async function getAboutInfo() {
  const { data, error } = await supabase.from("about").select("*").single()

  if (error) return null
  return data
}

export async function updateAboutInfo(formData) {
  const description = formData.get("description")
  const cultureSectionsRaw = formData.get("culture_sections")
  const existingGallery = JSON.parse(formData.get("existing_gallery") || "[]")
  const heroImageExisting = formData.get("existing_hero_image")
  const heroImageFile = formData.get("hero_image")
  const galleryFiles = formData.getAll("gallery_images").filter((file) => file && typeof file === 'object' && file.size > 0)

  const culture_sections = cultureSectionsRaw ? JSON.parse(cultureSectionsRaw) : []
  const uploadedGallery = galleryFiles.length ? await uploadFilesToStorage(galleryFiles, "uploads/about") : []
  const gallery_images = [...existingGallery, ...uploadedGallery]

  let hero_image = heroImageExisting || ""
  if (heroImageFile && typeof heroImageFile === 'object' && heroImageFile.size > 0) {
    hero_image = await uploadFileToStorage(heroImageFile, "uploads/about")
  }

  const { data, error } = await supabase
    .from("about")
    .upsert(
      {
        id: 1,
        description,
        hero_image,
        gallery_images,
        culture_sections,
      },
      { onConflict: "id" },
    )
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/about")
  revalidatePath("/admin")
  return { success: true, data }
}

// Sustainable Travel Entries
export async function getSustainableEntries() {
  const { data, error } = await supabase
    .from("sustainable_travel")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return []
  return data || []
}

export async function createSustainableEntry(formData) {
  try {
    const title = formData.get("title")
    const description = formData.get("description")

    if (!title || !description) {
      return { success: false, error: "Title and description are required" }
    }

    const { data, error } = await supabase
      .from("sustainable_travel")
      .insert([{ s_title: title, s_description: description }])
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/about")
    revalidatePath("/admin")
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function updateSustainableEntry(id, formData) {
  try {
    const title = formData.get("title")
    const description = formData.get("description")

    if (!title || !description) {
      return { success: false, error: "Title and description are required" }
    }

    const { data, error } = await supabase
      .from("sustainable_travel")
      .update({ s_title: title, s_description: description })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/about")
    revalidatePath("/admin")
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}

export async function deleteSustainableEntry(id) {
  try {
    const { error } = await supabase
      .from("sustainable_travel")
      .delete()
      .eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/about")
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
