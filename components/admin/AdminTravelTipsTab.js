"use client"

import { useState, useEffect } from "react"
import { getTravelTips, createTravelTip, updateTravelTip, deleteTravelTip } from "@/app/actions/general-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminTravelTipsTab() {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTip, setEditingTip] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    loadTips()
  }, [])

  const loadTips = async () => {
    setLoading(true)
    const data = await getTravelTips()
    setTips(data)
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const result = editingTip
      ? await updateTravelTip(editingTip.id, formData)
      : await createTravelTip(formData)

    if (result.success) {
      toast({
        title: editingTip ? "Travel tip updated" : "Travel tip created",
        description: `The travel tip has been ${editingTip ? "updated" : "created"} successfully.`,
      })
      setIsDialogOpen(false)
      setEditingTip(null)
      loadTips()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to save travel tip.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (tip) => {
    setEditingTip(tip)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this travel tip?")) return

    const result = await deleteTravelTip(id)
    if (result.success) {
      toast({
        title: "Travel tip deleted",
        description: "The travel tip has been permanently deleted.",
      })
      loadTips()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete travel tip.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading travel tips...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Travel Tips Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTip(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Travel Tip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTip ? "Edit Travel Tip" : "Create New Travel Tip"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={editingTip?.title}
                  placeholder="Travel tip title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={6}
                  required
                  defaultValue={editingTip?.content}
                  placeholder="Travel tip content..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingTip(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingTip ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {tips.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No travel tips found. Create your first travel tip!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tips.map((tip) => (
            <Card key={tip.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{tip.content}</p>
                    {tip.created_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Created:{" "}
                        {new Date(tip.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(tip)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(tip.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
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

