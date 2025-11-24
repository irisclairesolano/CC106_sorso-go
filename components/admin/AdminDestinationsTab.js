"use client"

import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react"
import {
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from "@/app/actions/destination-actions"

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Hidden", value: "hidden" },
]

export default function AdminDestinationsTab() {
  const [destinations, setDestinations] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    loadDestinations()
  }, [])

  const loadDestinations = async () => {
    setIsLoading(true)
    const data = await getDestinations()
    setDestinations(data || [])
    setIsLoading(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const action = editing ? updateDestination.bind(null, editing.id) : createDestination

    startTransition(async () => {
      try {
        console.log("Submitting destination:", { editing: editing?.id, editingData: editing })
        const result = await action(formData)
        console.log("Destination action result:", result)
        
        if (!result) {
          throw new Error("No result returned from server action")
        }

        if (result.success) {
          toast({
            title: editing ? "Destination Updated" : "Destination Created",
            description: editing
              ? "The destination has been updated successfully."
              : "The destination has been added successfully.",
          })
          form.reset()
          setEditing(null)
          setOpen(false)
          loadDestinations()
        } else {
          const errorMessage = result.error || "Something went wrong while saving the destination."
          console.error("Destination save error:", errorMessage, result)
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Destination submit error:", error)
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred. Please check the console for details.",
          variant: "destructive",
        })
      }
    })
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
          <Dialog open={open} onOpenChange={setOpen}>
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

              <form className="space-y-4" onSubmit={handleSubmit}>
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

                <div className="space-y-2">
                  <Label htmlFor="images">Images</Label>
                  <Input id="images" name="images" type="file" multiple accept="image/*" />
                  <p className="text-xs text-muted-foreground">You can upload multiple images; the first becomes the cover.</p>
                </div>

                <input
                  type="hidden"
                  name="existing_gallery"
                  value={JSON.stringify(editing?.image_gallery || [])}
                />
                <input type="hidden" name="image_url" value={editing?.image_url || ""} />

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
                      <Badge variant={destination.status === "published" ? "default" : "secondary"}>
                        {destination.status || "draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{(destination.image_gallery || []).length || 0}</TableCell>
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

