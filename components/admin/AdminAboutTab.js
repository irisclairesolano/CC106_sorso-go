"use client"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Trash2, Plus } from "lucide-react"
import { getAboutInfo, updateAboutInfo, getTravelTips, createTravelTip, deleteTravelTip } from "@/app/actions/general-actions"

export default function AdminAboutTab() {
  const [about, setAbout] = useState(null)
  const [cultureSections, setCultureSections] = useState([{ title: "", description: "" }])
  const [existingGallery, setExistingGallery] = useState([])
  const [travelTips, setTravelTips] = useState([])
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [aboutInfo, tips] = await Promise.all([getAboutInfo(), getTravelTips()])
    setAbout(aboutInfo)
    setExistingGallery(aboutInfo?.gallery_images || [])
    setCultureSections(
      aboutInfo?.culture_sections?.length
        ? aboutInfo.culture_sections
        : [{ title: "", description: "" }],
    )
    setTravelTips(tips || [])
  }

  const handleCultureChange = (index, field, value) => {
    setCultureSections((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addCultureSection = () => {
    setCultureSections((prev) => [...prev, { title: "", description: "" }])
  }

  const removeCultureSection = (index) => {
    setCultureSections((prev) => prev.filter((_, i) => i !== index))
  }

  const removeGalleryImage = (url) => {
    setExistingGallery((prev) => prev.filter((item) => item !== url))
  }

  const handleAboutSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const filteredSections = cultureSections.filter((section) => section.title || section.description)
    formData.append("culture_sections", JSON.stringify(filteredSections))
    formData.append("existing_gallery", JSON.stringify(existingGallery))
    formData.append("existing_hero_image", about?.hero_image || "")

    startTransition(async () => {
      const result = await updateAboutInfo(formData)
      if (result.success) {
        toast({ title: "About page updated" })
        form.reset()
        loadData()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update about page.",
          variant: "destructive",
        })
      }
    })
  }

  const handleCreateTip = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      try {
        console.log("Creating travel tip with formData:", {
          title: formData.get("title"),
          content: formData.get("content"),
        })
        const result = await createTravelTip(formData)
        console.log("Travel tip creation result:", result)
        
        if (!result) {
          throw new Error("No result returned from server action")
        }

        if (result.success) {
          toast({ title: "Travel tip saved" })
          form.reset()
          loadData()
        } else {
          const errorMessage = result.error || "Failed to save travel tip."
          console.error("Travel tip save error:", errorMessage, result)
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Travel tip submit error:", error)
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred. Please check the console for details.",
          variant: "destructive",
        })
      }
    })
  }

  const handleDeleteTip = (id) => {
    if (!confirm("Delete this travel tip?")) return
    startTransition(async () => {
      const { success, error } = await deleteTravelTip(id)
      if (success) {
        toast({ title: "Travel tip deleted" })
        loadData()
      } else {
        toast({
          title: "Error",
          description: error || "Failed to delete travel tip.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">About Page Content</h3>
            <p className="text-sm text-muted-foreground">Update the hero section, culture highlights, and gallery.</p>
          </div>

          <form className="space-y-4" onSubmit={handleAboutSubmit}>
            <div className="space-y-2">
              <Label htmlFor="description">Main Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={about?.description || ""}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hero_image">Hero Image</Label>
                <Input id="hero_image" name="hero_image" type="file" accept="image/*" />
                {about?.hero_image && (
                  <p className="text-xs text-muted-foreground break-all">Current: {about.hero_image}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gallery_images">Gallery Images</Label>
                <Input id="gallery_images" name="gallery_images" type="file" multiple accept="image/*" />
              </div>
            </div>

            {existingGallery.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Existing Gallery</p>
                <div className="flex flex-wrap gap-2">
                  {existingGallery.map((url) => (
                    <div key={url} className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                      <span className="truncate max-w-[140px]">{url}</span>
                      <button
                        type="button"
                        className="text-destructive"
                        onClick={() => removeGalleryImage(url)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Culture Sections</Label>
                <Button type="button" size="sm" variant="outline" onClick={addCultureSection}>
                  <Plus className="mr-2 h-4 w-4" />
                  Section
                </Button>
              </div>
              <div className="space-y-4">
                {cultureSections.map((section, index) => (
                  <div key={`culture-${index}`} className="rounded-md border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Section {index + 1}</p>
                      {cultureSections.length > 1 && (
                        <button
                          type="button"
                          className="text-destructive text-xs"
                          onClick={() => removeCultureSection(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="Title"
                      value={section.title}
                      onChange={(event) => handleCultureChange(index, "title", event.target.value)}
                    />
                    <Textarea
                      placeholder="Description"
                      rows={3}
                      value={section.description}
                      onChange={(event) => handleCultureChange(index, "description", event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <input type="hidden" name="existing_gallery" value={JSON.stringify(existingGallery)} />
            <input type="hidden" name="existing_hero_image" value={about?.hero_image || ""} />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save About Page
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">Travel Tips</h3>
            <p className="text-sm text-muted-foreground">Add or remove helpful travel tips shown on the About page.</p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleCreateTip}>
            <div className="space-y-2">
              <Label htmlFor="tip_title">Title</Label>
              <Input id="tip_title" name="title" placeholder="Tip title" required />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="tip_content">Content</Label>
              <Textarea id="tip_content" name="content" rows={3} placeholder="Tip details" required />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Tip
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {travelTips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No travel tips yet.</p>
            ) : (
              travelTips.map((tip) => (
                <div
                  key={tip.id}
                  className="rounded-md border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold">{tip.title}</p>
                    <p className="text-sm text-muted-foreground">{tip.content}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeleteTip(tip.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

