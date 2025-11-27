"use client"

import { createFestival, deleteFestival, getFestivals, updateFestival } from "@/app/actions/festival-actions"
import { MediaLibrary } from "@/components/shared/MediaLibrary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowUpDown, Edit, Filter, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"

// Sort options
const SORT_OPTIONS = [
  { value: "date_asc", label: "Date (Upcoming First)", icon: "↑" },
  { value: "date_desc", label: "Date (Latest First)", icon: "↓" },
  { value: "name_asc", label: "Name (A-Z)", icon: "↑" },
  { value: "name_desc", label: "Name (Z-A)", icon: "↓" },
  { value: "created_desc", label: "Recently Added", icon: "↓" },
]

// Filter options
const FILTER_OPTIONS = [
  { value: "all", label: "All Festivals" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "this_month", label: "This Month" },
]

export default function AdminFestivalsTab() {
  const [festivals, setFestivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFestival, setEditingFestival] = useState(null)
  const [sortBy, setSortBy] = useState("date_asc")
  const [filterBy, setFilterBy] = useState("all")
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const [coverImage, setCoverImage] = useState("")
  const [existingGallery, setExistingGallery] = useState([])
  const [deletedGallery, setDeletedGallery] = useState([])
  const { toast } = useToast()

  // Apply sorting and filtering
  const filteredAndSortedFestivals = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Filter
    let filtered = [...festivals]
    switch (filterBy) {
      case "upcoming":
        filtered = festivals.filter(f => new Date(f.start_date) >= today)
        break
      case "past":
        filtered = festivals.filter(f => new Date(f.start_date) < today)
        break
      case "this_month":
        filtered = festivals.filter(f => {
          const festDate = new Date(f.start_date)
          return festDate.getMonth() === currentMonth && festDate.getFullYear() === currentYear
        })
        break
      default:
        break
    }

    // Sort
    switch (sortBy) {
      case "date_asc":
        filtered.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        break
      case "date_desc":
        filtered.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
        break
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name_desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "created_desc":
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        break
      default:
        break
    }

    return filtered
  }, [festivals, sortBy, filterBy])

  useEffect(() => {
    loadFestivals()
  }, [])

  const loadFestivals = async () => {
    setLoading(true)
    const data = await getFestivals()
    setFestivals(data)
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    formData.set("image_url", coverImage || "")
    formData.set("existing_gallery", JSON.stringify(existingGallery))
    if (deletedGallery.length > 0) {
      formData.set("deleted_gallery", JSON.stringify(deletedGallery))
    }

    const result = editingFestival
      ? await updateFestival(editingFestival.id, formData)
      : await createFestival(formData)

    if (result.success) {
      toast({
        title: editingFestival ? "Festival updated" : "Festival created",
        description: `The festival has been ${editingFestival ? "updated" : "created"} successfully.`,
      })
      setIsDialogOpen(false)
      setEditingFestival(null)
      setCoverImage("")
      setExistingGallery([])
      setDeletedGallery([])
      loadFestivals()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save festival.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (festival) => {
    setEditingFestival(festival)
    setCoverImage(festival?.image_url || "")
    setExistingGallery(festival?.image_gallery || [])
    setDeletedGallery([])
    setIsDialogOpen(true)
  }

  const handleDialogChange = (open) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingFestival(null)
      setCoverImage("")
      setExistingGallery([])
      setDeletedGallery([])
    }
  }

  const openMediaLibrary = useCallback(() => {
    setMediaLibraryOpen(true)
  }, [])

  const handleMediaSelect = useCallback((selected) => {
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

  const removeExistingImage = (url) => {
    setExistingGallery((prev) => prev.filter((img) => img !== url))
    setDeletedGallery((prev) => (prev.includes(url) ? prev : [...prev, url]))
    if (coverImage === url) {
      setCoverImage("")
    }
  }

  const removeCoverImage = () => {
    setCoverImage("")
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this festival?")) return

    const result = await deleteFestival(id)
    if (result.success) {
      toast({
        title: "Festival deleted",
        description: "The festival has been permanently deleted.",
      })
      loadFestivals()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete festival.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading festivals...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Festival Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingFestival(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Festival
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
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
              <DialogTitle>{editingFestival ? "Edit Festival" : "Create New Festival"}</DialogTitle>
              <DialogDescription>
                {editingFestival 
                  ? "Update the festival details and images below."
                  : "Fill in the details to add a new festival or celebration."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={editingFestival?.name}
                  placeholder="Festival Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={editingFestival?.description}
                  placeholder="Festival description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                    defaultValue={editingFestival?.start_date}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    defaultValue={editingFestival?.end_date}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={editingFestival?.location}
                  placeholder="Festival location"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Cover Image</Label>
                  <div className="flex gap-2">
                    {coverImage && (
                      <Button type="button" variant="outline" size="sm" onClick={removeCoverImage}>
                        Remove
                      </Button>
                    )}
                    <Button type="button" variant="outline" size="sm" onClick={openMediaLibrary}>
                      Select Cover
                    </Button>
                  </div>
                </div>

                {coverImage ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                    <Image src={coverImage} alt="Cover" fill className="object-cover" />
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={openMediaLibrary}
                  >
                    <p className="text-sm text-muted-foreground">Click to select a cover image</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Existing Images</Label>
                {existingGallery.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {existingGallery.map((url) => (
                      <div key={url} className="relative group">
                        <div className="aspect-video rounded-md overflow-hidden border bg-muted">
                          <Image src={url} alt="Festival image" fill className="object-cover" />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeExistingImage(url)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No existing images.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Upload Additional Images</Label>
                <Input id="images" name="images" type="file" accept="image/*" multiple />
                <p className="text-xs text-muted-foreground">
                  Newly uploaded images are added to the gallery. Cover image is taken from the selection above.
                </p>
              </div>

              <input type="hidden" name="image_url" value={coverImage || ""} />
              <input type="hidden" name="existing_gallery" value={JSON.stringify(existingGallery)} />
              <input type="hidden" name="deleted_gallery" value={JSON.stringify(deletedGallery)} />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    handleDialogChange(false)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingFestival ? "Update" : "Create"}</Button>
              </div>
            </form>
            <MediaLibrary
              isOpen={mediaLibraryOpen}
              onClose={() => setMediaLibraryOpen(false)}
              onSelect={handleMediaSelect}
              currentSelection={coverImage ? [coverImage] : []}
              multiple={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Sorting */}
      {festivals.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 flex-1">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-muted-foreground flex items-center">
            Showing {filteredAndSortedFestivals.length} of {festivals.length} festivals
          </div>
        </div>
      )}

      {festivals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No festivals found. Create your first festival!
          </CardContent>
        </Card>
      ) : filteredAndSortedFestivals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No festivals match your filter. Try a different filter option.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedFestivals.map((festival) => (
            <Card key={festival.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {festival.image_url && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={festival.image_url}
                        alt={festival.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1">{festival.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {festival.description}
                    </p>
                    <div className="text-sm text-muted-foreground mb-4">
                      <div>
                        {new Date(festival.start_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {festival.end_date &&
                          ` - ${new Date(festival.end_date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}`}
                      </div>
                      {festival.location && <div>{festival.location}</div>}
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                      {new Date(festival.start_date) >= new Date().setHours(0,0,0,0) ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Upcoming
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Past
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {(festival.image_gallery || []).length} image{(festival.image_gallery || []).length === 1 ? "" : "s"}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(festival)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(festival.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

