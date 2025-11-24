"use server"

import { supabase } from "@/lib/supabaseClient"
import { revalidatePath } from "next/cache"

export async function getMediaForStory(storyId) {
  const { data, error } = await supabase.from("media").select("*").eq("story_id", storyId)

  if (error) return []
  return data
}

export async function uploadMedia(formData) {
  const story_id = formData.get("story_id")
  const url = formData.get("url")
  const type = formData.get("type") || "image"
  const caption = formData.get("caption")

  const { data, error } = await supabase.from("media").insert([{ story_id, url, type, caption }]).select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/stories/${story_id}`)
  return { success: true, data }
}

export async function updateMedia(id, formData) {
  const caption = formData.get("caption")

  const { data, error } = await supabase.from("media").update({ caption }).eq("id", id).select()

  if (error) {
    return { success: false, error: error.message }
  }

  // We need to know the story_id to revalidate, but for now just return success
  return { success: true, data }
}

export async function deleteMedia(id) {
  const { error } = await supabase.from("media").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
