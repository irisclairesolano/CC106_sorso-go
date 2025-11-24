"use client"

import { useState, useEffect } from "react"
import { getFestivals, createFestival, updateFestival, deleteFestival } from "@/app/actions/festival-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function AdminFestivalsTab() {
  const [festivals, setFestivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFestival, setEditingFestival] = useState(null)
  const { toast } = useToast()

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
    setIsDialogOpen(true)
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Festival Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingFestival(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Festival
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFestival ? "Edit Festival" : "Create New Festival"}</DialogTitle>
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
              <div className="space-y-2">
                <Label htmlFor="images">Upload Images</Label>
                <Input id="images" name="images" type="file" accept="image/*" multiple />
                <p className="text-xs text-muted-foreground">Upload multiple festival photos. First image becomes cover.</p>
              </div>

              <input
                type="hidden"
                name="existing_gallery"
                value={JSON.stringify(editingFestival?.image_gallery || [])}
              />
              <input type="hidden" name="image_url" value={editingFestival?.image_url || ""} />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingFestival(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingFestival ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {festivals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No festivals found. Create your first festival!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {festivals.map((festival) => (
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
                    <div className="flex gap-2 items-center">
                      <Badge variant="secondary">
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

