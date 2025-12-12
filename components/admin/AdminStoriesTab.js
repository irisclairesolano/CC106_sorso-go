"use client"

import { approveStory, deleteStory, getAllStories } from "@/app/actions/admin-actions"
import { createStory, getStoryById, updateStory } from "@/app/actions/story-actions"
import { StatusSelect } from "@/components/shared/DraftStatusBadge"
import EditorErrorBoundary from "@/components/shared/EditorErrorBoundary"
import { FormActions, FormField, FormProvider } from "@/components/shared/FormProvider"
import { MediaLibrary } from "@/components/shared/MediaLibrary"
import { usePreview } from '@/components/shared/PreviewMode'
import { RichTextEditor } from "@/components/shared/RichTextEditor"
import { TagInput } from "@/components/shared/TagInput"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useClearSelectedItems, useError, useIsLoading, useSelectedItems, useSetLoading, useSetSelectedItems, useSyncSelectedItems, useToggleSelectedItem } from "@/lib/store/adminStore"
import { yupResolver } from '@hookform/resolvers/yup'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Edit2, Eye, FileText, Image as ImageIcon, Loader2, Plus, Search, Star, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

yup.setLocale({
  mixed: {
    required: 'This field is required',
  },
  string: {
    min: 'Must be at least ${min} characters',
    max: 'Must be at most ${max} characters',
    email: 'Invalid email address',
  },
  number: {
    min: 'Must be at least ${min}',
    max: 'Must be at most ${max}',
  },
})

// Form validation schema
const storySchema = yup.object().shape({
  title: yup.string().required().min(10).max(100).label('Title'),
  author_name: yup.string().required().min(3).max(50).label('Author Name'),
  destination_id: yup.number().nullable().transform(value => 
    !value || isNaN(value) ? null : Number(value)
  ),
  content: yup.string().required().min(100).label('Content'),
  status: yup.string().required().oneOf(['draft', 'pending', 'published', 'rejected', 'archived']),
  images: yup.mixed(),
  existing_gallery: yup.array().of(yup.string()),
  image_url: yup.string(),
  tags: yup.array().of(yup.string()).nullable(),
  seo_title: yup.string().max(70).nullable(),
  seo_description: yup.string().max(160).nullable(),
  seo_keywords: yup.string().nullable(),
  seo_image: yup.string().nullable(),
})

// Common tag suggestions for travel stories
const TAG_SUGGESTIONS = [
  "adventure", "beach", "culture", "food", "hiking", "nature", 
  "photography", "resort", "surfing", "swimming", "travel", 
  "whale watching", "wildlife", "local cuisine", "heritage",
  "eco-tourism", "family", "solo travel", "backpacking"
]

export default function AdminStoriesTab() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { PreviewComponent, openPreview } = usePreview()
  const [searchQuery, setSearchQuery] = useState("")
  
  // Use individual selectors to prevent infinite re-renders
  const selectedItems = useSelectedItems()
  const bulkLoading = useIsLoading()
  const error = useError()
  const toggleSelectedItem = useToggleSelectedItem()
  const clearSelectedItems = useClearSelectedItems()
  const setSelectedItems = useSetSelectedItems()
  const syncSelectedItems = useSyncSelectedItems()
  const setLoading = useSetLoading()
  
  // State for media library
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const [mediaLibraryMode, setMediaLibraryMode] = useState('cover') // 'cover' or 'gallery'
  const [coverImage, setCoverImage] = useState('')
  const [galleryImages, setGalleryImages] = useState([])
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [deletedImages, setDeletedImages] = useState([])
  
  // Fetch stories with React Query
  const { data: stories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['adminStories'],
    queryFn: getAllStories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Filter stories based on search query
  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return stories
    
    const query = searchQuery.toLowerCase()
    return stories.filter(story => 
      story.title.toLowerCase().includes(query) ||
      story.author_name.toLowerCase().includes(query) ||
      story.content.toLowerCase().includes(query) ||
      story.tags?.some(tag => {
        const tagText = typeof tag === 'object' ? tag.name : tag
        return tagText.toLowerCase().includes(query)
      })
    )
  }, [stories, searchQuery])

  // Use refs to store the latest functions to avoid dependency issues
  const clearSelectedItemsRef = useRef(clearSelectedItems)
  const syncSelectedItemsRef = useRef(syncSelectedItems)
  
  // Update refs in effect to avoid state updates during render
  useEffect(() => {
    clearSelectedItemsRef.current = clearSelectedItems
    syncSelectedItemsRef.current = syncSelectedItems
  }, [clearSelectedItems, syncSelectedItems])

  useEffect(() => {
    if (!stories || stories.length === 0) {
      // Use setTimeout to defer state update to avoid React error #185
      setTimeout(() => {
        clearSelectedItemsRef.current()
      }, 0)
      return
    }
    const storyIds = stories.map((story) => story.id)
    // Use setTimeout to defer state update to avoid React error #185
    setTimeout(() => {
      syncSelectedItemsRef.current(storyIds)
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories])
  
  // Form handling
  const methods = useForm({
    resolver: yupResolver(storySchema),
    defaultValues: {
      title: '',
      author_name: '',
      content: '',
      status: 'draft',
      destination_id: '',
      tags: [],
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      seo_image: '',
      images: [],
      existing_gallery: [],
      image_url: '',
    },
  })
  
  const { handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = methods
  const formValues = watch()
  
  // Open/close handlers
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen)
    if (!isOpen) {
      methods.reset()
      setEditing(null)
      setCoverImage('')
      setGalleryImages([])
      setDeletedImages([])
    }
  }

  // Handle media selection from library
  const handleMediaSelect = (selected) => {
    if (!selected) {
      setMediaLibraryOpen(false)
      return
    }

    if (mediaLibraryMode === 'cover') {
      const imageUrl = typeof selected === 'string' ? selected : selected.url
      setCoverImage(imageUrl)
      setValue('image_url', imageUrl, { shouldValidate: true })
    } else {
      // Gallery mode - handle multiple selections
      const newImages = Array.isArray(selected) ? selected : [selected]
      const newGalleryItems = newImages.map(item => ({
        url: typeof item === 'string' ? item : item.url,
        isNew: true,
        id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
      
      const updatedGallery = [...galleryImages, ...newGalleryItems]
      setGalleryImages(updatedGallery)
    }
    
    setMediaLibraryOpen(false)
  }
  
  // Open media library for cover or gallery
  const openMediaLibrary = (mode) => {
    setMediaLibraryMode(mode)
    setMediaLibraryOpen(true)
  }
  
  // Remove cover image
  const removeCoverImage = () => {
    if (coverImage && !coverImage.startsWith('blob:')) {
      setDeletedImages(prev => [...prev, coverImage])
    }
    setCoverImage('')
    setValue('image_url', '', { shouldValidate: true })
  }
  
  // Remove gallery image
  const removeGalleryImage = (index) => {
    const newImages = [...galleryImages]
    const [removed] = newImages.splice(index, 1)
    
    // Track deleted existing images for backend cleanup
    if (removed && !removed.isNew && removed.url) {
      setDeletedImages(prev => [...prev, removed.url])
    }
    
    setGalleryImages(newImages)
  }
  
  // Set a gallery image as cover
  const setAsCover = (image) => {
    const imageUrl = typeof image === 'string' ? image : image.url
    setCoverImage(imageUrl)
    setValue('image_url', imageUrl, { shouldValidate: true })
    toast({ title: 'Cover image updated' })
  }
  
  // Move gallery image (reorder)
  const moveGalleryImage = (fromIndex, toIndex) => {
    const newImages = [...galleryImages]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setGalleryImages(newImages)
  }

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      
      // Append basic form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image_gallery' || key === 'existing_gallery') return
        
        if (key === 'tags' && Array.isArray(value)) {
          // Send tags as JSON array
          formData.append('tags', JSON.stringify(value))
        } else if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item !== null && item !== undefined) {
              formData.append(key, item)
            }
          })
        } else if (value !== null && value !== undefined) {
          formData.append(key, value)
        }
      })
      
      // Handle cover image
      if (coverImage) {
        formData.append('image_url', coverImage)
      }
      
      // Handle gallery images - separate new from existing
      const existingGalleryUrls = galleryImages
        .filter(img => !img.isNew && img.url)
        .map(img => img.url)
      
      const newGalleryUrls = galleryImages
        .filter(img => img.isNew && img.url)
        .map(img => img.url)
      
      formData.append('existing_gallery', JSON.stringify(existingGalleryUrls))
      formData.append('new_gallery', JSON.stringify(newGalleryUrls))
      
      // Add deleted images
      if (deletedImages.length > 0) {
        formData.append('deleted_images', JSON.stringify(deletedImages))
      }
      
      // Set approved based on status
      if (data.status === 'published') {
        formData.set('approved', 'true')
      }
      
      let result
      if (editing) {
        result = await updateStory(editing.id, formData)
      } else {
        result = await createStory(formData)
      }
      
      if (result.success) {
        toast({
          title: editing ? 'Story updated' : 'Story created',
          description: editing 
            ? 'Your story has been updated successfully.'
            : 'Your story has been created.',
        })
        
        reset()
        setEditing(null)
        setOpen(false)
        setDeletedImages([])
        setCoverImage('')
        setGalleryImages([])
        
        await queryClient.invalidateQueries(['adminStories'])
      } else {
        throw new Error(result.error || 'Failed to save story')
      }
    } catch (error) {
      console.error('Error saving story:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save story. Please try again.',
        variant: 'destructive',
      })
      // Reset the form submission state on error
      methods.reset(undefined, { keepValues: true })
    } finally {
      // Ensure isSubmitting is always reset
      methods.formState.isSubmitting = false
    }
  }
  
  const handleBulkApprove = async (ids) => {
    if (!ids?.length) return
    setLoading(true)
    try {
      await Promise.all(
        ids.map(async (id) => {
          const result = await approveStory(id)
          if (!result?.success) {
            throw new Error(result?.error || 'Failed to publish story')
          }
        })
      )
      toast({
        title: 'Stories published',
        description: `${ids.length} stor${ids.length > 1 ? 'ies' : 'y'} published successfully.`,
      })
      clearSelectedItems()
      await queryClient.invalidateQueries(['adminStories'])
    } catch (error) {
      console.error('Bulk publish error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish selected stories.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async (ids) => {
    if (!ids?.length) return
    const confirmed = window.confirm(
      `Are you sure you want to delete ${ids.length} stor${ids.length > 1 ? 'ies' : 'y'}? This cannot be undone.`
    )
    if (!confirmed) return

    setLoading(true)
    try {
      await Promise.all(
        ids.map(async (id) => {
          const result = await deleteStory(id)
          if (!result?.success) {
            throw new Error(result?.error || 'Failed to delete story')
          }
        })
      )
      toast({
        title: 'Stories deleted',
        description: `${ids.length} stor${ids.length > 1 ? 'ies' : 'y'} deleted successfully.`,
      })
      clearSelectedItems()
      await queryClient.invalidateQueries(['adminStories'])
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete selected stories.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle story approval
  const handleApprove = async (id) => {
    try {
      const result = await approveStory(id)
      if (result.success) {
        toast({ title: 'Story approved' })
        await queryClient.invalidateQueries(['adminStories'])
      } else {
        throw new Error(result.error || 'Failed to approve story')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve story',
        variant: 'destructive',
      })
    }
  }
  
  // Handle story deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story? This cannot be undone.')) {
      return
    }
    
    try {
      const result = await deleteStory(id)
      if (result.success) {
        toast({ title: 'Story deleted' })
        await queryClient.invalidateQueries(['adminStories'])
      } else {
        throw new Error(result.error || 'Failed to delete story')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete story',
        variant: 'destructive',
      })
    }
  }
  
  // Start creating a new story
  const startCreate = () => {
    reset({
      title: '',
      author_name: '',
      content: '',
      status: 'draft',
      destination_id: '',
      tags: [],
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      seo_image: '',
    })
    setCoverImage('')
    setGalleryImages([])
    setDeletedImages([])
    setEditing(null)
    setOpen(true)
  }
  
  // Start editing an existing story
  const startEdit = async (story) => {
    if (!story?.id) {
      toast({
        title: 'Error',
        description: 'Invalid story data',
        variant: 'destructive',
      })
      return
    }
    
    try {
      setCoverImage('')
      setGalleryImages([])
      setDeletedImages([])
      
      toast({
        title: 'Loading story...',
        description: 'Please wait while we load the story data.',
      })
      
      const fullStory = await getStoryById(story.id)
      
      if (!fullStory) {
        throw new Error('Could not load story data')
      }
      
      // Parse tags if they're stored as a string
      let tags = []
      if (Array.isArray(fullStory.tags)) {
        tags = fullStory.tags.map(t => typeof t === 'object' ? t.name : t)
      }
      
      reset({
        ...fullStory,
        tags,
      })
      
      if (fullStory.image_url) {
        setCoverImage(fullStory.image_url)
      }
      
      // Set gallery images
      const gallery = (fullStory.image_gallery || []).map((url, idx) => ({
        url,
        isNew: false,
        id: `existing-${idx}`
      }))
      setGalleryImages(gallery)
      
      setEditing(fullStory)
      setOpen(true)
      
    } catch (error) {
      console.error('Error loading story for editing:', error)
      toast({
        title: 'Error',
        description: 'Failed to load story data. Please try again.',
        variant: 'destructive',
      })
    }
  }
  
  // Handle preview - generates HTML preview content
  const handlePreview = useCallback(() => {
    const previewHtml = `
      <div style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
        ${coverImage ? `<img src="${coverImage}" alt="Cover" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1.5rem;" />` : ''}
        <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; color: #1a1a1a;">${formValues.title || 'Untitled Story'}</h1>
        <p style="color: #666; margin-bottom: 1rem;">By ${formValues.author_name || 'Anonymous'}</p>
        ${formValues.tags?.length > 0 ? `
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
            ${formValues.tags.map(tag => `<span style="background: #e0f2e9; color: #2E8B57; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">${tag}</span>`).join('')}
          </div>
        ` : ''}
        <div style="line-height: 1.75; color: #333;">
          ${formValues.content || '<p>No content to preview</p>'}
        </div>
        ${galleryImages.length > 0 ? `
          <div style="margin-top: 2rem;">
            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Gallery</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
              ${galleryImages.map(img => `<img src="${img.url}" alt="Gallery" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;" />`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `
    openPreview(previewHtml, formValues.title || 'Story Preview')
  }, [formValues, coverImage, galleryImages, openPreview])

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Header - matching Destinations layout */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Stories</h3>
            <p className="text-sm text-muted-foreground">Manage community travel stories and submissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Link href="/story-submission" target="_blank">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Public Form
                </Button>
              </Link>
              <Button onClick={startCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Story
              </Button>
            </div>
          </div>
        </div>

        {/* Stories Table - matching Destinations layout */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading stories...
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-destructive mb-4">Failed to load stories.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No stories yet</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Start by creating your first story.
              </p>
              <Button onClick={startCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create Story
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="flex items-center gap-3">
                        {story.image_url && (
                          <div 
                            className="w-10 h-10 rounded bg-cover bg-center flex-shrink-0 border" 
                            style={{ backgroundImage: `url(${story.image_url})` }} 
                          />
                        )}
                        <span className="truncate">{story.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{story.author_name || 'Anonymous'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {(story.tags || []).slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {typeof tag === 'object' ? tag.name : tag}
                          </Badge>
                        ))}
                        {(story.tags || []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{story.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={story.approved ? "default" : "secondary"}
                        className={`${
                          story.approved 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}
                      >
                        {story.approved ? 'Published' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {story.image_url && (
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <ImageIcon className="h-3 w-3 text-primary" />
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {(story.image_gallery?.length || 0) + (story.image_url ? 1 : 0)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(story.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {!story.approved && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleApprove(story.id)}
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => startEdit(story)} title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleDelete(story.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Link href={`/stories/${story.id}`} target="_blank">
                        <Button size="sm" variant="outline" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Story Form Dialog */}
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
            onPointerDownOutside={(event) => {
              if (mediaLibraryOpen) {
                event.preventDefault()
              }
            }}
            onInteractOutside={(event) => {
              if (mediaLibraryOpen) {
                event.preventDefault()
              }
            }}
            onEscapeKeyDown={(event) => {
              if (mediaLibraryOpen) {
                event.preventDefault()
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Edit Story' : 'Create New Story'}
              </DialogTitle>
              <DialogDescription>
                {editing 
                  ? 'Update the story details and content.'
                  : 'Fill in the details to create a new story.'}
              </DialogDescription>
            </DialogHeader>
            
            <FormProvider 
              methods={methods} 
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid gap-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="title" label="Title" required>
                    <Input placeholder="Enter story title" />
                  </FormField>
                  
                  <FormField name="author_name" label="Author Name" required>
                    <Input placeholder="Author's name" />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="destination_id" label="Destination ID (optional)">
                    <Input 
                      type="number" 
                      placeholder="Link to destination" 
                      min={1}
                    />
                  </FormField>
                  
                  <FormField name="status" label="Status">
                    <StatusSelect 
                      value={formValues.status}
                      onChange={(value) => setValue('status', value)}
                    />
                  </FormField>
                </div>

                {/* Tags with improved UX */}
                <FormField name="tags" label="Tags">
                  <TagInput
                    value={formValues.tags || []}
                    onChange={(tags) => setValue('tags', tags)}
                    suggestions={TAG_SUGGESTIONS}
                    placeholder="Add tags like 'adventure', 'beach'..."
                    maxTags={10}
                  />
                </FormField>

                {/* Content */}
                <FormField
                  name="content"
                  label="Content"
                  render={({ field }) => (
                    <EditorErrorBoundary>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Write your story here..."
                      />
                    </EditorErrorBoundary>
                  )}
                />

                {/* Cover Image Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Cover Image</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openMediaLibrary('cover')}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {coverImage ? 'Change Cover' : 'Select Cover'}
                    </Button>
                  </div>
                  
                  {coverImage ? (
                    <div className="relative group">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                        <Image
                          src={coverImage}
                          alt="Cover"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openMediaLibrary('cover')}
                          >
                            Change
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removeCoverImage}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => openMediaLibrary('cover')}
                    >
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to select a cover image</p>
                    </div>
                  )}
                </div>

                {/* Gallery Section with merge/delete/reorder controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Image Gallery</label>
                      <p className="text-xs text-muted-foreground">Drag to reorder, click star to set as cover</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openMediaLibrary('gallery')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Images
                    </Button>
                  </div>
                  
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {galleryImages.map((image, index) => (
                        <div key={image.id || index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden bg-muted border">
                            <Image
                              src={image.url}
                              alt={`Gallery image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            {/* Overlay with controls */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                              <div className="flex gap-1">
                                {/* Set as cover */}
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setAsCover(image)}
                                  title="Set as cover"
                                >
                                  <Star className="h-3.5 w-3.5" />
                                </Button>
                                {/* Delete Button */}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-destructive/90"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to remove this image?')) {
                                      removeGalleryImage(index);
                                    }
                                  }}
                                  title="Remove image"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              {/* Reorder buttons */}
                              <div className="flex gap-1 mt-1">
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="h-6 text-xs px-2"
                                    onClick={() => moveGalleryImage(index, index - 1)}
                                  >
                                    ← Move
                                  </Button>
                                )}
                                {index < galleryImages.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="h-6 text-xs px-2"
                                    onClick={() => moveGalleryImage(index, index + 1)}
                                  >
                                    Move →
                                  </Button>
                                )}
                              </div>
                            </div>
                            {/* New badge */}
                            {image.isNew && (
                              <div className="absolute top-1 left-1">
                                <Badge className="text-[10px] px-1.5 py-0 bg-primary">New</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => openMediaLibrary('gallery')}
                    >
                      <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to add gallery images</p>
                    </div>
                  )}
                </div>

                {/* SEO Section */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium flex items-center gap-2 py-2 border-t pt-4">
                    <span>SEO Settings</span>
                    <span className="text-xs text-muted-foreground">(optional)</span>
                  </summary>
                  <div className="space-y-4 pt-4">
                    <FormField 
                      name="seo_title" 
                      label="SEO Title"
                      hint="50-60 characters recommended"
                    >
                      <Input 
                        placeholder="Enter SEO title" 
                        maxLength={70}
                      />
                    </FormField>
                    
                    <FormField 
                      name="seo_description" 
                      label="Meta Description"
                      hint="150-160 characters recommended"
                    >
                      <Textarea 
                        placeholder="Enter meta description" 
                        rows={2}
                        maxLength={160}
                      />
                    </FormField>
                    
                    <FormField 
                      name="seo_keywords" 
                      label="Keywords"
                      hint="Comma-separated"
                    >
                      <Input placeholder="travel, sorsogon, adventure" />
                    </FormField>
                  </div>
                </details>
              </div>

              <FormActions>
                <div className="flex justify-between w-full">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePreview}
                    disabled={!formValues.title && !formValues.content}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editing ? 'Save Changes' : 'Create Story'}
                    </Button>
                  </div>
                </div>
              </FormActions>
            </FormProvider>
          </DialogContent>
        </Dialog>

        {/* Media Library */}
        <MediaLibrary 
          isOpen={mediaLibraryOpen}
          onClose={() => setMediaLibraryOpen(false)}
          onSelect={handleMediaSelect}
          multiple={mediaLibraryMode === 'gallery'}
        />

        {/* Preview Component */}
        <PreviewComponent />
      </CardContent>
    </Card>
  )
}
