"use client"

import { createSustainableEntry, deleteSustainableEntry, getSustainableEntries, updateSustainableEntry } from "@/app/actions/general-actions"
import { RichTextEditor } from "@/components/shared/RichTextEditor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Edit2, Loader2, Save, Trash2, X } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
  

export default function AdminSustainableTab() {
  const [entries, setEntries] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ title: "", description: "" })
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const data = await getSustainableEntries()
    setEntries(data || [])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Title and description are required.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      // Create FormData object for the server action
      const formDataObj = new FormData()
      formDataObj.set("title", formData.title)
      formDataObj.set("description", formData.description)
      
      const result = editingId 
        ? await updateSustainableEntry(editingId, formDataObj)
        : await createSustainableEntry(formDataObj)

      if (result.success) {
        toast({
          title: editingId ? "Entry updated" : "Entry created",
          description: `Sustainable travel entry has been ${editingId ? "updated" : "created"} successfully.`,
        })
        resetForm()
        loadEntries()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save entry.",
          variant: "destructive",
        })
      }
    })
  }

  const handleEdit = (entry) => {
    setEditingId(entry.id)
    setFormData({ title: entry.s_title, description: entry.s_description })
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this sustainable travel entry?")) return

    startTransition(async () => {
      const result = await deleteSustainableEntry(id)
      if (result.success) {
        toast({
          title: "Entry deleted",
          description: "Sustainable travel entry has been deleted.",
        })
        loadEntries()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete entry.",
          variant: "destructive",
        })
      }
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ title: "", description: "" })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sustainable Travel</h2>
        <p className="text-sm text-muted-foreground">
          Manage sustainable travel practices and SDG information
        </p>
      </div>

      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Edit Entry" : "Add New Entry"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Eco-Friendly Practices"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="w-full max-w-full overflow-hidden">
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Describe the sustainable travel practice..."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingId ? "Update" : "Create"} Entry
                  </>
                )}
              </Button>

              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Current Entries ({entries.length})</span>
            <Button variant="outline" size="sm" onClick={loadEntries}>
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sustainable travel entries found. Add your first entry above.
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{entry.s_title}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        {(() => {
                          const content = entry.s_description || ''
                          const plainText = content.replace(/<[^>]*>/g, '')
                          const previewLength = 150
                          const shouldTruncate = plainText.length > previewLength
                          const preview = shouldTruncate ? plainText.substring(0, previewLength) + '...' : plainText
                          
                          return shouldTruncate ? (
                            <div>
                              <p>{preview}</p>
                              <span className="text-xs text-primary hover:text-primary/80 cursor-pointer">
                                Click edit to see full content
                              </span>
                            </div>
                          ) : (
                            <div 
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: content }}
                            />
                          )
                        })()}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(entry.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
