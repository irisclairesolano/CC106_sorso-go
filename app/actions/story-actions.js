"use server"

import { uploadFilesToStorage } from "@/lib/storage"
import { supabase } from "@/lib/supabaseClient"
import { revalidatePath } from "next/cache"

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
    .eq('approved', true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching stories:", error)
    return []
  }

  // Transform data to flatten tags and normalize image fields
  return data.map((story) => ({
    ...story,
    tags: story.story_tag?.map((st) => st.tag) || [],
    image_url: story.image_url || story.cover_image_url || null,
    image_gallery: story.image_gallery || story.article_images || [],
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
    image_url: data.image_url || data.cover_image_url || null,
    image_gallery: data.image_gallery || data.article_images || [],
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
    image_url: story.image_url || story.cover_image_url || null,
    image_gallery: story.image_gallery || story.article_images || [],
  }))
}

export async function createStory(formData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Extract form data
    const title = formData.get('title')
    const content = formData.get('content')
    const author_name = formData.get('author_name') || null
    const status = formData.get('status') || 'draft'
    
    // Handle destination_id - ensure it's a valid integer or null
    let destination_id = formData.get('destination_id')
    destination_id = destination_id && !isNaN(parseInt(destination_id)) ? parseInt(destination_id) : null

    // Handle cover image
    const coverImageFile = formData.get('image_url')
    let cover_image_url = null
    
    // Handle gallery images
    const galleryImages = formData.getAll('image_gallery[]')
    let article_images = []

    // Upload cover image if it's a file
    if (coverImageFile && coverImageFile.size > 0) {
      const [uploadedCover] = await uploadFilesToStorage([coverImageFile], 'stories')
      if (uploadedCover) cover_image_url = uploadedCover
    } else if (typeof coverImageFile === 'string' && coverImageFile.startsWith('http')) {
      // If it's already a URL, use it directly
      cover_image_url = coverImageFile
    }

    // Upload gallery images
    const galleryFiles = Array.isArray(galleryImages) 
      ? galleryImages.filter(img => img && img.size > 0) 
      : []
    
    if (galleryFiles.length > 0) {
      article_images = await uploadFilesToStorage(galleryFiles, 'stories/gallery')
    } else if (formData.get('existing_gallery')) {
      // Handle existing gallery if no new files are uploaded
      try {
        const existingGallery = JSON.parse(formData.get('existing_gallery'))
        if (Array.isArray(existingGallery)) {
          article_images = existingGallery
            .filter(img => img && (typeof img === 'string' || img.url))
            .map(img => typeof img === 'string' ? img : img.url)
        }
      } catch (e) {
        console.error('Error parsing existing gallery:', e)
      }
    }

    // Create the story in the database
    const { data, error } = await supabase
      .from('story')
      .insert([{
        title,
        content,
        author_name,
        user_id: user.id,
        destination_id,
        cover_image_url,
        article_images: article_images.length > 0 ? article_images : null,
        status,
        approved: status === 'published' // Auto-approve if published
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // Revalidate relevant paths
    revalidatePath("/stories")
    revalidatePath("/admin")
    
    return { 
      success: true, 
      data: {
        ...data,
        image_url: cover_image_url,
        image_gallery: article_images
      } 
    }
  } catch (error) {
    console.error('Error in createStory:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to create story. Please try again.' 
    }
  }
}

export async function updateStory(id, formData) {
  try {
    console.log("Updating story with id:", id);
    
    // Get existing story data
    const { data: existingStory } = await supabase
      .from('story')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingStory) {
      throw new Error('Story not found');
    }

    const payload = {
      title: formData.get('title') || existingStory.title,
      content: formData.get('content') || existingStory.content,
      author_name: formData.get('author_name') || existingStory.author_name,
      approved: formData.get('approved') === 'true' || existingStory.approved,
    };

    // Handle destination_id
    const destination_id = formData.get('destination_id');
    if (destination_id) {
      payload.destination_id = destination_id === 'none' ? null : parseInt(destination_id);
    } else if (formData.has('destination_id')) {
      payload.destination_id = null;
    }

    // Handle image uploads
    const imageFiles = Array.from(formData.getAll('images')).filter(file => file.size > 0);
    
    if (imageFiles.length > 0) {
      // Upload new images
      const newImageUrls = await uploadFilesToStorage(imageFiles, 'stories');
      
      // Get existing images or initialize empty arrays
      const existingImages = existingStory.image_gallery || [];
      const existingCover = existingStory.image_url ? [existingStory.image_url] : [];
      
      // Combine images (new uploads + existing)
      const allImages = [...existingCover, ...existingImages, ...newImageUrls];
      
      // First image is the cover, rest go to gallery
      payload.image_url = allImages[0] || null;
      payload.image_gallery = allImages.length > 1 ? allImages.slice(1) : [];
    }

    // Handle image deletions if needed
    const imagesToDelete = formData.get('imagesToDelete');
    if (imagesToDelete) {
      const urlsToRemove = JSON.parse(imagesToDelete);
      if (Array.isArray(urlsToRemove) && urlsToRemove.length > 0) {
        // Remove from gallery
        payload.image_gallery = (payload.image_gallery || existingStory.image_gallery || [])
          .filter(url => !urlsToRemove.includes(url));
        
        // If cover is being removed, use the first gallery image as new cover
        if (urlsToRemove.includes(payload.image_url)) {
          payload.image_url = payload.image_gallery[0] || null;
          payload.image_gallery = payload.image_gallery.slice(1);
        }
      }
    }

    console.log("Final update payload:", payload);
    const { data, error: updateError } = await supabase
      .from('story')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Revalidate relevant paths
    revalidatePath('/stories');
    revalidatePath(`/stories/${id}`);
    revalidatePath('/admin/stories');
    
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
