"use client"

import { createTravelTip, deleteTravelTip, getTravelTips, updateTravelTip } from "@/app/actions/general-actions"
import { RichTextEditor } from "@/components/shared/RichTextEditor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Edit, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminTravelTipsTab() {
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTip, setEditingTip] = useState(null)
  const [newTipContent, setNewTipContent] = useState('') // For new tips
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
    
    // Get content from the appropriate source
    const content = editingTip ? editingTip.content : newTipContent
    formData.set('content', content)
    
    console.log('Submitting:', {
      title: formData.get('title'),
      content: content,
      contentLength: content.length,
      isEditing: !!editingTip
    })
    
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
      setNewTipContent('') // Reset new tip content
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
    console.log('Editing tip:', tip) // Debug logging
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
              <DialogDescription>
                {editingTip 
                  ? "Update the travel tip details below."
                  : "Add helpful travel advice for visitors to Sorsogon."}
              </DialogDescription>
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
                <div className="w-full max-w-full overflow-hidden">
                  <RichTextEditor
                    key={editingTip?.id || 'new'} // Force re-render when editing different tip
                    value={editingTip ? editingTip.content : newTipContent}
                    onChange={(value) => {
                      if (editingTip) {
                        setEditingTip({ ...editingTip, content: value })
                      } else {
                        setNewTipContent(value)
                      }
                    }}
                    placeholder="Travel tip content..."
                  />
                  {/* Debug: Show what we're passing to editor */}
                  <div className="text-xs text-muted-foreground mt-1">
                    Debug: Content length = {(editingTip ? editingTip.content : newTipContent)?.length || 0}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingTip(null)
                    setNewTipContent('') // Reset new tip content
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
                    <div 
                      className="text-sm text-muted-foreground line-clamp-3 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: tip.content }}
                    />
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

