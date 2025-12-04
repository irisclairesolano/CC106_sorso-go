"use client"

import {
  createDestination,
  deleteDestination,
  getDestinations,
  updateDestination,
} from "@/app/actions/destination-actions"
import { FormActions, FormField, FormProvider } from "@/components/shared/FormProvider"
import { MediaLibrary } from "@/components/shared/MediaLibrary"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Edit2, Eye, ImageIcon, Loader2, Plus, Search, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Hidden", value: "hidden" },
]

const DEFAULT_VALUES = {
  name: "",
  category: "",
  address: "",
  coordinates: "",
  description: "",
  article_content: "",
  status: "draft",
  image_url: "",
  gallery_images: [],
  deleted_images: [],
}

export default function AdminDestinationsTab() {
  const [destinations, setDestinations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const [galleryLibraryOpen, setGalleryLibraryOpen] = useState(false)
  const [coverImage, setCoverImage] = useState("")
  const [galleryImages, setGalleryImages] = useState([])
  const [deletedGallery, setDeletedGallery] = useState([])
  const [editing, setEditing] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const methods = useForm({ defaultValues: DEFAULT_VALUES })
  const { reset, watch, setValue, formState: { isSubmitting } } = methods
  const formValues = watch()

  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) {
      return destinations
    }

    const query = searchQuery.toLowerCase()
    return destinations.filter((item) => {
      const name = item?.name?.toLowerCase() || ""
      const category = item?.category?.toLowerCase() || ""
      const address = item?.address?.toLowerCase() || ""
      const status = item?.status?.toLowerCase() || ""

      return (
        name.includes(query) ||
        category.includes(query) ||
        address.includes(query) ||
        status.includes(query)
      )
    })
  }, [destinations, searchQuery])

  const loadDestinations = useCallback(async () => {
    setIsLoading(true)
    const data = await getDestinations(true)
    setDestinations(data || [])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadDestinations()
  }, [loadDestinations])

  useEffect(() => {
    methods.register("gallery_images")
    methods.register("image_url")
    methods.register("deleted_images")
  }, [methods])

  useEffect(() => {
    setValue("gallery_images", galleryImages.map((img) => img.url), { shouldValidate: false })
  }, [galleryImages, setValue])

  useEffect(() => {
    setValue("image_url", coverImage || "", { shouldValidate: false })
  }, [coverImage, setValue])

  useEffect(() => {
    setValue("deleted_images", deletedGallery, { shouldValidate: false })
  }, [deletedGallery, setValue])

  const resetFormState = useCallback(() => {
    setEditing(null)
    setCoverImage("")
    setGalleryImages([])
    setDeletedGallery([])
    reset(DEFAULT_VALUES)
  }, [reset])

  const handleDialogChange = useCallback((open) => {
    setDialogOpen(open)
    if (!open) {
      resetFormState()
    }
  }, [resetFormState])

  const openCoverLibrary = useCallback(() => {
    setMediaLibraryOpen(true)
  }, [])

  const openGalleryLibrary = useCallback(() => {
    setGalleryLibraryOpen(true)
  }, [])

  const handleCoverSelect = useCallback((selected) => {
    if (!selected) {
      setMediaLibraryOpen(false)
      return
    }
    const imageUrl = Array.isArray(selected) ? selected[0] : selected
    const finalUrl = typeof imageUrl === "string" ? imageUrl : imageUrl?.url
    if (finalUrl) {
      setCoverImage(finalUrl)
    }
    setMediaLibraryOpen(false)
  }, [])

  const handleGallerySelect = useCallback((selected) => {
    if (!selected) {
      setGalleryLibraryOpen(false)
      return
    }
    const selections = Array.isArray(selected) ? selected : [selected]
    const normalized = selections
      .map((item, index) => ({
        url: typeof item === "string" ? item : item?.url,
        isNew: true,
        id: `new-${Date.now()}-${index}`,
      }))
      .filter((item) => item.url)

    setGalleryImages((prev) => [...prev, ...normalized])
    setGalleryLibraryOpen(false)
  }, [])

  const removeGalleryImage = useCallback((index) => {
    setGalleryImages((prev) => {
      const copy = [...prev]
      const [removed] = copy.splice(index, 1)
      if (removed && !removed.isNew && removed.url) {
        setDeletedGallery((existing) => (existing.includes(removed.url) ? existing : [...existing, removed.url]))
      }
      return copy
    })
  }, [])

  const removeCoverImage = useCallback(() => {
    setCoverImage("")
  }, [])

  const handleCreate = useCallback(() => {
    resetFormState()
    setDialogOpen(true)
  }, [resetFormState])

  const handleEdit = useCallback((record) => {
    if (!record?.id) {
      toast({
        title: "Error",
        description: "Invalid destination data. Please refresh and try again.",
        variant: "destructive",
      })
      return
    }

    const cover = record.cover_image_url || record.image_url || ""
    const existingGallery = (record.article_images || []).map((url, idx) => ({
      url,
      isNew: false,
      id: `existing-${idx}`,
    }))

    reset({
      ...DEFAULT_VALUES,
      name: record.name || "",
      category: record.category || "",
      address: record.address || "",
      coordinates: record.coordinates || "",
      description: record.description || "",
      article_content: record.article_content || "",
      status: record.status || "draft",
      image_url: cover,
      gallery_images: existingGallery.map((img) => img.url),
    })

    setEditing(record)
    setCoverImage(cover)
    setGalleryImages(existingGallery)
    setDeletedGallery([])
    setDialogOpen(true)
  }, [reset, toast])

  const handleDelete = useCallback(async (id) => {
    if (!confirm("Are you sure you want to delete this destination?")) return
    const result = await deleteDestination(id)
    if (result.success) {
      toast({
        title: "Destination deleted",
      })
      loadDestinations()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete destination.",
        variant: "destructive",
      })
    }
  }, [loadDestinations, toast])

  const onSubmit = useCallback(async (data) => {
    try {
      const formData = new FormData()
      const fields = ["name", "category", "address", "coordinates", "description", "article_content", "status"]

      fields.forEach((field) => {
        if (data[field]) {
          formData.append(field, data[field])
        }
      })

      formData.set("image_url", coverImage || "")
      formData.set("gallery_images", JSON.stringify(galleryImages.map((img) => img.url)))

      if (deletedGallery.length > 0) {
        formData.set("deleted_images", JSON.stringify(deletedGallery))
      }

      const result = editing
        ? await updateDestination(editing.id, formData)
        : await createDestination(formData)

      if (!result || !result.success) {
        throw new Error(result?.error || "Failed to save destination")
      }

      toast({
        title: editing ? "Destination updated" : "Destination created",
        description: editing
          ? "The destination has been updated successfully."
          : "The destination has been created successfully.",
      })

      handleDialogChange(false)
      loadDestinations()
    } catch (error) {
      console.error("Error saving destination:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save destination",
        variant: "destructive",
      })
    }
  }, [coverImage, deletedGallery, editing, galleryImages, handleDialogChange, loadDestinations, toast])

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Destinations</h3>
            <p className="text-sm text-muted-foreground">Manage tourist destinations and featured spots.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations..."
                className="pl-10"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Destination
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Destination" : "Create Destination"}</DialogTitle>
                  <DialogDescription>
                    {editing
                      ? "Update the destination details and media."
                      : "Fill in the details to add a new destination."}
                  </DialogDescription>
                </DialogHeader>

                <FormProvider methods={methods} onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="name" label="Title" required>
                      <Input placeholder="Destination name" autoComplete="off" />
                    </FormField>
                    <FormField name="category" label="Category" required>
                      <Input placeholder="e.g. Beach, Mountain, Historical" autoComplete="off" />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="address" label="Address">
                      <Input placeholder="Enter destination address" autoComplete="off" />
                    </FormField>
                    <FormField name="coordinates" label="Coordinates">
                      <Input placeholder="e.g. 12.9747, 124.0312" autoComplete="off" />
                    </FormField>
                  </div>

                  <FormField name="description" label="Short Description" required>
                    <Textarea rows={3} placeholder="Brief summary shown on listing cards" />
                  </FormField>

                  <FormField name="article_content" label="Detailed Content">
                    <Textarea rows={6} placeholder="Full article content (supports HTML)" />
                  </FormField>

                  <FormField
                    name="status"
                    label="Status"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Cover Image</label>
                      <div className="flex gap-2">
                        {coverImage && (
                          <Button type="button" variant="outline" size="sm" onClick={removeCoverImage}>
                            Remove
                          </Button>
                        )}
                        <Button type="button" variant="outline" size="sm" onClick={openCoverLibrary}>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          {coverImage ? "Change Cover" : "Select Cover"}
                        </Button>
                      </div>
                    </div>

                    {coverImage ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                        <img src={coverImage} alt="Cover image preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={openCoverLibrary}
                      >
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to select a cover image</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Gallery Images</label>
                        <p className="text-xs text-muted-foreground">
                          Use the media library to add or remove gallery images.
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={openGalleryLibrary}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Images
                      </Button>
                    </div>

                    {galleryImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {galleryImages.map((image, index) => (
                          <div key={image.id || `${image.url}-${index}`} className="relative group">
                            <div className="aspect-square rounded-md overflow-hidden border bg-muted">
                              <img src={image.url} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => removeGalleryImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              {image.isNew && (
                                <Badge className="absolute top-2 left-2 text-[10px] px-2 py-0.5">New</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={openGalleryLibrary}
                      >
                        <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to add gallery images</p>
                      </div>
                    )}
                  </div>

                  <FormActions className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editing ? "Save Changes" : "Create Destination"}
                    </Button>
                  </FormActions>
                </FormProvider>

                <MediaLibrary
                  isOpen={mediaLibraryOpen}
                  onClose={() => setMediaLibraryOpen(false)}
                  onSelect={handleCoverSelect}
                  currentSelection={coverImage ? [coverImage] : []}
                  multiple={false}
                />

                <MediaLibrary
                  isOpen={galleryLibraryOpen}
                  onClose={() => setGalleryLibraryOpen(false)}
                  onSelect={handleGallerySelect}
                  currentSelection={galleryImages.map((img) => img.url)}
                  multiple
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {(() => {
          if (isLoading) {
            return (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading destinations...
              </div>
            )
          }

          if (filteredDestinations.length === 0) {
            return <div className="text-center py-10 text-muted-foreground">No destinations found.</div>
          }

          return (
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
                  {filteredDestinations.map((destination) => (
                    <TableRow key={destination.id}>
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="flex items-center gap-3">
                          {destination.cover_image_url && (
                            <div
                              className="w-10 h-10 rounded bg-cover bg-center shrink-0 border"
                              style={{ backgroundImage: `url(${destination.cover_image_url})` }}
                            />
                          )}
                          <span className="truncate">{destination.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{destination.category}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{destination.address || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={destination.status === "published" ? "default" : "secondary"}
                          className={
                            destination.status === "published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          }
                        >
                          {destination.status || "draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {(destination.article_images?.length || 0) + (destination.cover_image_url ? 1 : 0)} photos
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(destination)}>
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
                        <Link href={`/destinations/${destination.id}`} target="_blank">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}

