"use client"

import {
  createDestination,
  deleteDestination,
  getDestinations,
  updateDestination,
} from "@/app/actions/destination-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Edit2, Eye, Loader2, Plus, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Hidden", value: "hidden" },
]

export default function AdminDestinationsTab() {
  const router = useRouter()
  const [destinations, setDestinations] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  
  // Image states
  const [coverPreview, setCoverPreview] = useState('')
  const [articleImagePreviews, setArticleImagePreviews] = useState([])
  const [articleImageFiles, setArticleImageFiles] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  
  // Handle cover image change
  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCoverPreview(URL.createObjectURL(file))
    if (file) {
      setCoverPreview(URL.createObjectURL(file))
    }
  }
  
  // Handle article images change
  const handleArticleImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    // Calculate remaining slots
    const remainingSlots = 10 - articleImagePreviews.length
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: "You can upload a maximum of 10 images per destination.",
        variant: "destructive",
      })
      return
    }

    // Only take as many files as we have slots for
    const filesToAdd = files.slice(0, remainingSlots)
    
    // Create unique file names to prevent duplicates
    const uniqueFiles = filesToAdd.filter(newFile => {
      const isDuplicate = articleImageFiles.some(
        existingFile => existingFile.name === newFile.name && 
                        existingFile.size === newFile.size
      )
      return !isDuplicate
    })

    const newPreviews = uniqueFiles.map(file => ({
      url: URL.createObjectURL(file),
      file,
      isNew: true,
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
    
    setArticleImagePreviews(prev => [...prev, ...newPreviews])
    setArticleImageFiles(prev => [...prev, ...uniqueFiles])
    
    // Clear the input to allow selecting the same file again if needed
    e.target.value = ''
  }
  
  // Handle removing an article image
  const handleRemoveArticleImage = (index) => {
    setArticleImagePreviews(prev => {
      const newPreviews = [...prev]
      const removed = newPreviews.splice(index, 1)[0]
      
      // If it's an existing image, mark it for deletion
      if (!removed.isNew) {
        setImagesToDelete(prev => [...(prev || []), removed.url])
      }
      
      return newPreviews
    })
    
    // Only remove from files if it was a new file
    setArticleImageFiles(prev => {
      if (index >= prev.length) return prev // Skip if it's an existing image
      return prev.filter((_, i) => i !== index)
    })
  }
  
  
  // Reset form when opening/closing
  const handleDialogOpenChange = (open) => {
    setOpen(open)
    if (!open) {
      resetForm()
    } else if (editing) {
      setCoverPreview(editing.cover_image_url || '')
      setArticleImagePreviews(editing.article_images || [])
    }
  }

  const resetForm = () => {
    setEditing(null)
    setCoverPreview('')
    setArticleImagePreviews([])
    setArticleImageFiles([])
    setImagesToDelete([])
    
    // Safely reset the form if it exists
    const form = document.getElementById('destination-form')
    if (form) {
      form.reset()
    }
  }

  useEffect(() => {
    loadDestinations()
  }, [])

  const loadDestinations = async () => {
    setIsLoading(true)
    // Pass includeAll: true to get all destinations including non-published ones in admin
    const data = await getDestinations(true)
    setDestinations(data || [])
    setIsLoading(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    
    // Add cover preview if it's a new file
    const coverFile = document.getElementById('cover_image')?.files[0]
    if (coverFile) {
      formData.delete('cover_image') // Remove any existing entry
      formData.append('cover_image', coverFile)
    } else if (coverPreview && coverPreview.startsWith('http')) {
      formData.append('existing_cover_image', coverPreview)
    } // else: user removed cover, backend will set it to null
    
    // Add new article images (only new ones)
    articleImageFiles.forEach(file => {
      if (file) { // Ensure file exists
        formData.append('article_images', file)
      }
    })
    
    // Determine existing gallery images that remain (not deleted)
    const existingImages = articleImagePreviews
      .filter(img => !img.isNew && img.url)
      .map(img => img.url)

    // Always send the remaining existing images (could be empty if all removed)
    formData.append('existing_article_images', JSON.stringify(existingImages))
    
    // Add images to be deleted
    if (imagesToDelete.length > 0) {
      formData.append('images_to_delete', JSON.stringify(imagesToDelete))
    }
    
    try {
      if (editing) {
        await updateDestination(editing.id, formData)
        toast({
          title: 'Destination updated',
          description: 'The destination has been updated successfully.',
        })
      } else {
        await createDestination(formData)
        toast({
          title: 'Destination created',
          description: 'The destination has been created successfully.',
        })
      }
      
      setOpen(false)
      resetForm()
      loadDestinations()
    } catch (error) {
      console.error('Error saving destination:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save destination',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this destination?")) return
    startTransition(async () => {
      const result = await deleteDestination(id)
      if (result.success) {
        toast({ title: "Destination deleted" })
        loadDestinations()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete destination.",
          variant: "destructive",
        })
      }
    })
  }

  const startCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const startEdit = (record) => {
    console.log("Starting edit with record:", record)
    if (!record || (!record.id && !record.destination_id)) {
      console.error("Invalid record for editing:", record)
      toast({
        title: "Error",
        description: "Invalid destination data. Please refresh the page.",
        variant: "destructive",
      })
      return
    }
    // Ensure we use 'id' field (fallback to destination_id for backwards compatibility)
    const recordWithId = { ...record, id: record.id || record.destination_id }
    setEditing(recordWithId)
    setOpen(true)
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Destinations</h3>
            <p className="text-sm text-muted-foreground">Manage tourist destinations and featured spots.</p>
          </div>
          <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={startCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Destination" : "Add Destination"}</DialogTitle>
                <DialogDescription>
                  {editing
                    ? "Update the details of this destination."
                    : "Provide information about the new destination."}
                </DialogDescription>
              </DialogHeader>

              <form id="destination-form" className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Title</Label>
                    <Input id="name" name="name" defaultValue={editing?.name || ""} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" defaultValue={editing?.category || ""} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" defaultValue={editing?.address || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coordinates">Coordinates</Label>
                    <Input
                      id="coordinates"
                      name="coordinates"
                      placeholder="e.g. 12.9747, 124.0312"
                      defaultValue={editing?.coordinates || ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={3}
                    defaultValue={editing?.description || ""}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="article_content">Full Article Content</Label>
                  <Textarea
                    id="article_content"
                    name="article_content"
                    rows={5}
                    defaultValue={editing?.article_content || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    className="w-full rounded-md border bg-background px-3 py-2"
                    defaultValue={editing?.status || "draft"}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <Input
                    type="file"
                    name="cover_image"
                    accept="image/*"
                    onChange={handleCoverChange}
                  />
                  {(coverPreview || editing?.cover_image_url) && (
                    <div className="mt-2 relative w-40 h-40 border rounded-md overflow-hidden">
                      <img
                        src={coverPreview || editing?.cover_image_url}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="hidden"
                    name="existing_cover_image"
                    value={editing?.cover_image_url || ""}
                  />
                </div>

                {/* Article Images Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Article Images (Max 10)</Label>
                    <span className="text-sm text-muted-foreground">
                      {articleImagePreviews.length}/10 images
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      className={`flex items-center justify-center px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-accent/50 transition-colors ${
                        articleImagePreviews.length >= 10 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {articleImagePreviews.length >= 10 ? "Maximum 10 images" : "Add Images"}
                      <Input
                        id="article_images"
                        name="article_images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleArticleImagesChange}
                        disabled={articleImagePreviews.length >= 10}
                      />
                    </label>
                  </div>
                  {articleImagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {articleImagePreviews.map((preview, index) => (
                        <div key={preview.id || index} className="relative group">
                          <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              handleRemoveArticleImage(index)
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editing ? "Save Changes" : "Create Destination"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading destinations...
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No destinations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {destinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell className="font-medium">{destination.name}</TableCell>
                    <TableCell>{destination.category}</TableCell>
                    <TableCell>{destination.address}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={destination.status === "published" ? "default" : "secondary"}
                        className={`${
                          destination.status === 'published' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {destination.status || "draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {destination.cover_image_url && (
                          <div 
                            className="w-6 h-6 rounded-full bg-cover bg-center border" 
                            style={{ backgroundImage: `url(${destination.cover_image_url})` }} 
                          />
                        )}
                        <span>{destination.article_images?.length || 0} images</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(destination)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleDelete(destination.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/destinations/${destination.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

