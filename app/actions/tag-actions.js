"use server"

import { supabase } from "@/lib/supabaseClient"
import { revalidatePath } from "next/cache"

export async function getTags() {
  const { data, error } = await supabase.from("tag").select("*").order("name")

  if (error) return []
  return data
}

export async function getTagById(id) {
  const { data, error } = await supabase.from("tag").select("*").eq("id", id).single()

  if (error) return null
  return data
}

export async function createTag(formData) {
  const name = formData.get("name")

  const { data, error } = await supabase.from("tag").insert([{ name }]).select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/stories") // Tags are used in stories
  return { success: true, data }
}

export async function updateTag(id, formData) {
  const name = formData.get("name")

  const { data, error } = await supabase.from("tag").update({ name }).eq("id", id).select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/stories")
  return { success: true, data }
}

export async function deleteTag(id) {
  const { error } = await supabase.from("tag").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/stories")
  return { success: true }
}

// Story Tag Association Actions

export async function assignTagToStory(storyId, tagId) {
  const { error } = await supabase.from("story_tag").insert([{ story_id: storyId, tag_id: tagId }])

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/stories/${storyId}`)
  return { success: true }
}

export async function removeTagFromStory(storyId, tagId) {
  const { error } = await supabase.from("story_tag").delete().match({ story_id: storyId, tag_id: tagId })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/stories/${storyId}`)
  return { success: true }
}
