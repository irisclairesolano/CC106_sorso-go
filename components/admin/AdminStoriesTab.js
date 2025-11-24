"use client"

import { useEffect, useState, useTransition } from "react"
import { getAllStories, approveStory, deleteStory } from "@/app/actions/admin-actions"
import { createStory, updateStory } from "@/app/actions/story-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import Image from "next/image"
import { Check, Trash2, Eye, Plus, Edit2, Loader2 } from "lucide-react"

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
]

export default function AdminStoriesTab() {
  const [stories, setStories] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    setIsLoading(true)
    const data = await getAllStories()
    setStories(data || [])
    setIsLoading(false)
  }

  const handleApprove = async (id) => {
    const result = await approveStory(id)
    if (result.success) {
      toast({ title: "Story approved" })
      loadStories()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to approve story.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this story?")) return
    const result = await deleteStory(id)
    if (result.success) {
      toast({ title: "Story deleted" })
      loadStories()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete story.",
        variant: "destructive",
      })
    }
  }

  const startCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const startEdit = (story) => {
    console.log("Starting edit with story:", story)
    if (!story || !story.id) {
      console.error("Invalid story for editing:", story)
      toast({
        title: "Error",
        description: "Invalid story data. Please refresh the page.",
        variant: "destructive",
      })
      return
    }
    setEditing(story)
    setOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const action = editing ? updateStory.bind(null, editing.id) : createStory

    startTransition(async () => {
      try {
        console.log("Submitting story:", { editing: editing?.id, editingData: editing })
        const result = await action(formData)
        console.log("Story action result:", result)
        
        if (!result) {
          throw new Error("No result returned from server action")
        }

        if (result.success) {
          toast({
            title: editing ? "Story updated" : "Story created",
            description: editing
              ? "The story was updated successfully."
              : "The story has been added successfully.",
          })
          form.reset()
          setEditing(null)
          setOpen(false)
          loadStories()
        } else {
          const errorMessage = result.error || "Failed to save story."
          console.error("Story save error:", errorMessage, result)
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Story submit error:", error)
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred. Please check the console for details.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Story Management</h2>
          <p className="text-sm text-muted-foreground">Review, approve, and publish community stories.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/story-submission" target="_blank">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Submission Page
            </Button>
          </Link>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={startCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Story" : "Add Story"}</DialogTitle>
                <DialogDescription>
                  {editing ? "Update the selected story." : "Create a new story on behalf of a user."}
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={editing?.title || ""} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author_name">Author</Label>
                    <Input id="author_name" name="author_name" defaultValue={editing?.author_name || ""} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination_id">Destination ID (optional)</Label>
                  <Input
                    id="destination_id"
                    name="destination_id"
                    type="number"
                    defaultValue={editing?.destination_id || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" name="content" rows={6} defaultValue={editing?.content || ""} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      className="w-full rounded-md border bg-background px-3 py-2"
                      defaultValue={editing?.approved ? "approved" : "pending"}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="images">Upload Images</Label>
                    <Input id="images" name="images" type="file" multiple accept="image/*" />
                    <p className="text-xs text-muted-foreground">First image becomes the cover.</p>
                  </div>
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
                    {editing ? "Save Changes" : "Create Story"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading stories...
        </div>
      ) : stories.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No stories found.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {stories.map((story) => (
            <Card key={story.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {story.image_url && (
                    <div className="relative w-full md:w-40 h-40 rounded-lg overflow-hidden">
                      <Image src={story.image_url} alt={story.title} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{story.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{story.content}</p>
                      </div>
                      <Badge variant={story.approved ? "default" : "secondary"}>
                        {story.approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
                      <span>By: {story.author_name || "Anonymous"}</span>
                      <span>
                        {new Date(story.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {story.destination_id && <span>Destination #{story.destination_id}</span>}
                    </div>
                    {story.image_gallery?.length > 1 && (
                      <p className="text-xs text-muted-foreground">{story.image_gallery.length} images</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!story.approved && (
                    <Button size="sm" variant="outline" onClick={() => handleApprove(story.id)}>
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => startEdit(story)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => handleDelete(story.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Link href={`/stories/${story.id}`} target="_blank">
                    <Button size="sm" variant="ghost">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

