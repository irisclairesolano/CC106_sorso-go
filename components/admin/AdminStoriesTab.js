"use client"

import { approveStory, deleteStory, getAllStories } from "@/app/actions/admin-actions";
import { createStory, getStoryById, updateStory } from "@/app/actions/story-actions";
import { DraftStatusBadge, StatusSelect } from "@/components/shared/DraftStatusBadge";
import EditorErrorBoundary from "@/components/shared/EditorErrorBoundary";
import { FormActions, FormField, FormProvider } from "@/components/shared/FormProvider";
import { MediaLibrary } from "@/components/shared/MediaLibrary";
import { usePreview } from '@/components/shared/PreviewMode';
import { RichTextEditor } from "@/components/shared/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Edit2, Eye, FileText, Image as ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

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
});

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
});

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
]

export default function AdminStoriesTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { PreviewComponent, openPreview } = usePreview();
  
  // State for media library
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  
  // Fetch stories with React Query
  const { data: stories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['adminStories'],
    queryFn: getAllStories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Open/close handlers
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form when dialog is closed
      methods.reset();
      setEditing(null);
      setCoverImage('');
      setGalleryImages([]);
    }
  };

  // Handle edit button click
  const handleEdit = (story) => {
    setEditing(story);
    // Set form values from the story being edited
    methods.reset({
      ...story,
      // Ensure arrays are properly initialized
      tags: story.tags || [],
      existing_gallery: story.image_gallery || [],
    });
    setCoverImage(story.image_url || '');
    setGalleryImages(story.image_gallery || []);
    setOpen(true);
  };

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
  });
  
  const { handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = methods;
  
  // Watch form values
  const formValues = watch();
  
  // Track deleted images
  const [deletedImages, setDeletedImages] = useState([]);

  // Handle image selection from media library
  const handleMediaSelect = (selected) => {
    if (!selected) {
      setMediaLibraryOpen(false);
      return;
    }

    if (Array.isArray(selected)) {
      // Handle multiple selections for gallery
      const newGalleryItems = selected.map(item => ({
        url: typeof item === 'string' ? item : item.url,
        isNew: true
      }));
      
      // Update both state and form value
      const updatedGallery = [...galleryImages, ...newGalleryItems];
      setGalleryImages(updatedGallery);
      setValue('image_gallery', updatedGallery, { shouldValidate: true });
    } else {
      // Handle single selection for cover image
      const imageUrl = typeof selected === 'string' ? selected : selected.url;
      setCoverImage(imageUrl);
      setValue('image_url', imageUrl, { shouldValidate: true });
    }
    
    setMediaLibraryOpen(false);
  };
  
  // Handle new image uploads
  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      // Create preview URLs for the new files
      const newImages = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isNew: true
      }));
      
      // Update both state and form value
      const updatedGallery = [...galleryImages, ...newImages];
      setGalleryImages(updatedGallery);
      setValue('image_gallery', updatedGallery, { shouldValidate: true });
      
      // Clear the file input to allow selecting the same file again if needed
      event.target.value = '';
    } catch (error) {
      console.error('Error processing images:', error);
      toast({
        title: 'Error',
        description: 'Failed to process images. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Remove an image from the gallery
  const removeImage = (index, isCover = false) => {
    if (isCover) {
      // If removing cover image, also remove it from the form values
      setCoverImage('');
      setValue('image_url', '', { shouldValidate: true });
    } else {
      // For gallery images
      const newImages = [...galleryImages];
      const [removed] = newImages.splice(index, 1);
      
      // If it's an existing image (not a new upload), add to deleted images
      if (removed && !removed.isNew) {
        setDeletedImages(prev => [...prev, removed]);
      }
      
      // Update both state and form value
      setGalleryImages(newImages);
      setValue('image_gallery', newImages, { shouldValidate: true });
      
      // Revoke the object URL to prevent memory leaks
      if (removed && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
    }
  };
  
  // Set cover image from gallery
  const setAsCover = (image) => {
    setCoverImage(image);
    setValue('image_url', image);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Append basic form data
      Object.entries(data).forEach(([key, value]) => {
        // Skip image_gallery as we'll handle it separately
        if (key === 'image_gallery') return;
        
        if (Array.isArray(value)) {
          // Handle arrays (like tags)
          value.forEach((item) => {
            if (item !== null && item !== undefined) {
              formData.append(key, item);
            }
          });
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Handle cover image
      if (coverImage) {
        if (coverImage instanceof File) {
          formData.append('cover_image', coverImage);
        } else if (typeof coverImage === 'string') {
          formData.append('image_url', coverImage);
        }
      }
      
      // Handle gallery images
      galleryImages.forEach((img, index) => {
        if (img.isNew && img.file) {
          formData.append('gallery_images', img.file);
        } else if (img.url) {
          formData.append('existing_gallery[]', img.url);
        }
      });

      // Add deleted images to form data
      if (deletedImages.length > 0) {
        formData.append('deleted_images', JSON.stringify(deletedImages));
      }
      
      // Set the status based on the action
      if (data.status === 'published') {
        formData.set('approved', 'true');
      }
      
      let result;
      if (editing) {
        // Update existing story
        result = await updateStory(editing.id, formData);
      } else {
        // Create new story
        result = await createStory(formData);
      }
      
      if (result.success) {
        toast({
          title: editing ? 'Story updated' : 'Story created',
          description: editing 
            ? 'Your story has been updated successfully.'
            : 'Your story has been created and is pending review.',
        });
        
        // Reset form and close dialog
        reset();
        setEditing(null);
        setOpen(false);
        setDeletedImages([]);
        
        // Invalidate and refetch
        await queryClient.invalidateQueries(['adminStories']);
      } else {
        throw new Error(result.error || 'Failed to save story');
      }
    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save story. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle story approval
  const handleApprove = async (id) => {
    try {
      const result = await approveStory(id);
      if (result.success) {
        toast({ title: 'Story approved' });
        await queryClient.invalidateQueries(['adminStories']);
      } else {
        throw new Error(result.error || 'Failed to approve story');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve story',
        variant: 'destructive',
      });
    }
  };
  
  // Handle story deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story? This cannot be undone.')) {
      return;
    }
    
    try {
      const result = await deleteStory(id);
      if (result.success) {
        toast({ title: 'Story deleted' });
        await queryClient.invalidateQueries(['adminStories']);
      } else {
        throw new Error(result.error || 'Failed to delete story');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete story',
        variant: 'destructive',
      });
    }
  };
  
  // Start creating a new story
  const startCreate = () => {
    reset();
    setCoverImage('');
    setGalleryImages([]);
    setValue('existing_gallery', []);
    setValue('image_url', '');
    setOpen(true);
  };
  
  // Start editing an existing story
  const startEdit = async (story) => {
    if (!story?.id) {
      toast({
        title: 'Error',
        description: 'Invalid story data',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Reset any existing state
      setCoverImage('');
      setGalleryImages([]);
      setDeletedImages([]);
      
      // Show loading state
      toast({
        title: 'Loading story...',
        description: 'Please wait while we load the story data.',
      });
      
      // Fetch the full story data
      const { data: fullStory } = await getStoryById(story.id);
      
      if (!fullStory) {
        throw new Error('Could not load story data');
      }
      
      // Prepare form values
      const formValues = {
        ...fullStory,
        // Ensure arrays are properly initialized
        tags: Array.isArray(fullStory.tags) ? fullStory.tags : [],
      };
      
      // Reset form with the new values first
      reset(formValues);
      
      // Set cover image if exists
      if (fullStory.image_url) {
        setCoverImage(fullStory.image_url);
        setValue('image_url', fullStory.image_url, { shouldValidate: true });
      }
      
      // Set gallery images if any
      const gallery = [];
      if (Array.isArray(fullStory.image_gallery) && fullStory.image_gallery.length > 0) {
        fullStory.image_gallery.forEach(url => {
          if (url) {
            gallery.push({
              url,
              isNew: false
            });
          }
        });
      }
      setGalleryImages(gallery);
      setValue('image_gallery', gallery, { shouldValidate: true });
      
      // Set the editing state
      setEditing(fullStory);
      setOpen(true);
      
      // Dismiss loading toast
      toast.dismiss();
      
    } catch (error) {
      console.error('Error loading story for editing:', error);
      toast({
        title: 'Error',
        description: 'Failed to load story data. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle preview
  const handlePreview = () => {
    openPreview({
      title: formValues.title || 'Story Preview',
      content: formValues.content || 'No content to preview',
      image: coverImage,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Story Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage and publish community stories with rich content and media
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link href="/story-submission" target="_blank" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Eye className="mr-2 h-4 w-4" />
              View Public Submission
            </Button>
          </Link>
          <Button onClick={startCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Story
          </Button>
        </div>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading stories...</span>
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-destructive">Failed to load stories. Please try again.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : stories.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
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
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {stories.map((story) => (
              <Card key={story.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {story.image_url && (
                    <div className="relative h-48 w-full md:w-48 flex-shrink-0">
                      <Image
                        src={story.image_url}
                        alt={story.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 20rem"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold leading-none tracking-tight line-clamp-1">
                          {story.title}
                        </h3>
                        <DraftStatusBadge 
                          status={story.approved ? 'published' : 'pending'} 
                          className="ml-2"
                        />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>By {story.author_name || 'Anonymous'}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(story.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {story.destination_id && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Destination #{story.destination_id}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {story.excerpt || story.content?.substring(0, 200) || 'No content'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!story.approved && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleApprove(story.id)}
                          className="gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => startEdit(story)}
                        className="gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(story.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </Button>
                      <Link href={`/stories/${story.id}`} target="_blank" className="inline-flex">
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Story Form Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle id="dialog-title">
              {editing ? 'Edit Story' : 'Create New Story'}
            </DialogTitle>
            <DialogDescription id="dialog-description">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="title" label="Title" required>
                  <Input placeholder="Enter story title" />
                </FormField>
                
                <FormField name="author_name" label="Author Name" required>
                  <Input placeholder="Author's name" />
                </FormField>
              </div>

              <FormField name="destination_id" label="Destination (optional)">
                <Input 
                  type="number" 
                  placeholder="Destination ID" 
                  min={1}
                />
              </FormField>

              <FormField
                name="content"
                label="Content"
                render={({ field }) => (
                  <EditorErrorBoundary>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your story here..."
                      aria-describedby="dialog-description"
                    />
                  </EditorErrorBoundary>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="status" label="Status">
                  <StatusSelect 
                    value={formValues.status}
                    onChange={(value) => setValue('status', value)}
                  />
                </FormField>
                
                <FormField name="tags" label="Tags (comma separated)">
                  <Input 
                    placeholder="e.g., travel, adventure, food"
                    value={formValues.tags?.join(', ') || ''}
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(',')
                        .map(tag => tag.trim())
                        .filter(Boolean);
                      setValue('tags', tags);
                    }}
                  />
                </FormField>
              </div>

              {/* Cover Image */}
              <FormField 
                name="image_url" 
                label="Cover Image"
                hint="The main image that will be displayed as the cover"
              >
                <div className="space-y-4">
                  {coverImage ? (
                    <div className="relative group">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={coverImage}
                          alt="Cover"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setMediaLibraryOpen(true)}
                          >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Change Cover
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 rounded-full h-6 w-6 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => {
                          setCoverImage('');
                          setValue('image_url', '');
                        }}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove cover</span>
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setMediaLibraryOpen(true)}
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Upload a cover image</p>
                        <p className="text-xs text-muted-foreground">
                          Drag & drop an image here, or click to select
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </FormField>

              {/* Image Gallery */}
              <FormField 
                name="existing_gallery" 
                label="Image Gallery"
                hint="Additional images for the story gallery"
              >
                <div className="space-y-4">
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {galleryImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden bg-muted">
                            <Image
                              src={image}
                              alt={`Gallery image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => setAsCover(image)}
                                title="Set as cover"
                              >
                                <ImageIcon className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => removeImage(index)}
                                title="Remove image"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setMediaLibraryOpen(true)}
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Add images to gallery</p>
                        <p className="text-xs text-muted-foreground">
                          Drag & drop images here, or click to select
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMediaLibraryOpen(true)}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {galleryImages.length > 0 ? 'Add More Images' : 'Select from Media Library'}
                    </Button>
                  </div>
                </div>
              </FormField>

              {/* SEO Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-medium">SEO Settings</h3>
                <div className="space-y-4">
                  <FormField 
                    name="seo_title" 
                    label="SEO Title"
                    hint="Recommended: 50-60 characters"
                  >
                    <Input 
                      placeholder="Enter SEO title" 
                      maxLength={70}
                      value={formValues.seo_title || ''}
                      onChange={(e) => setValue('seo_title', e.target.value)}
                    />
                  </FormField>
                  
                  <FormField 
                    name="seo_description" 
                    label="Meta Description"
                    hint="Recommended: 150-160 characters"
                  >
                    <Textarea 
                      placeholder="Enter meta description" 
                      rows={3}
                      maxLength={160}
                      value={formValues.seo_description || ''}
                      onChange={(e) => setValue('seo_description', e.target.value)}
                    />
                  </FormField>
                  
                  <FormField 
                    name="seo_keywords" 
                    label="Keywords"
                    hint="Comma-separated list of keywords"
                  >
                    <Input 
                      placeholder="e.g., travel, adventure, sorsogon, philippines"
                      value={formValues.seo_keywords || ''}
                      onChange={(e) => setValue('seo_keywords', e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <FormActions>
              <div className="flex justify-between w-full">
                <div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePreview}
                    disabled={!formValues.title || !formValues.content}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
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
                    {editing ? 'Update Story' : 'Create Story'}
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
        multiple={true}
        currentSelection={[...(coverImage ? [coverImage] : []), ...galleryImages]}
      />

      {/* Preview Component */}
      <PreviewComponent />
    </div>
  )
}

