"use client"

import { useState, useEffect } from "react"
import { createStory } from "@/app/actions/story-actions"
import { getDestinations } from "@/app/actions/destination-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

export default function StorySubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [destinations, setDestinations] = useState([])
  const [selectedDestination, setSelectedDestination] = useState("")
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const { toast } = useToast()

  // Load destinations on mount
  useEffect(() => {
    getDestinations().then(setDestinations)
  }, [])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = []
    const newPreviews = []

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB. Please choose a smaller file.`,
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        })
        return
      }

      validFiles.push(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push(e.target.result)
        if (newPreviews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })

    setImages([...images, ...validFiles])
    e.target.value = ""
  }

  const removeImage = (index) => {
    const newImages = [...images]
    const newPreviews = [...imagePreviews]
    newImages.splice(index, 1)
    newPreviews.splice(index, 1)
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target)
    formData.delete("images")
    images.forEach((file) => formData.append("images", file))

    // Add destination_id if selected
    if (selectedDestination && selectedDestination !== "none") {
      formData.append("destination_id", selectedDestination)
    }

    const result = await createStory(formData)

    if (result.success) {
      toast({
        title: "Story submitted!",
        description: "Thank you for sharing! Your story is under review and will be published soon.",
      })
      e.target.reset()
      setImages([])
      setImagePreviews([])
      setSelectedDestination("")
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to submit story. Please try again.",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Story Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="My Amazing Adventure in Sorsogon"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author_name">Your Name</Label>
        <Input id="author_name" name="author_name" placeholder="John Doe" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination_id">Related Destination (Optional)</Label>
        <Select value={selectedDestination || undefined} onValueChange={(value) => setSelectedDestination(value === "none" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {destinations.map((dest) => (
              <SelectItem key={dest.id || dest.destination_id} value={(dest.id || dest.destination_id).toString()}>
                {dest.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">
          Your Story <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="content"
          name="content"
          required
          rows={12}
          placeholder="Share your experience, what you saw, how you felt, tips for other travelers..."
          className="resize-none"
          minLength={200}
        />
        <p className="text-xs text-muted-foreground">Minimum 200 characters recommended</p>
      </div>

      <div className="space-y-2">
        <Label>Images (Optional)</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
          <label
            htmlFor="images"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload images or drag and drop
            </span>
            <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</span>
          </label>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p className="font-semibold mb-1">Note:</p>
        <p>
          Your story will be reviewed before publication. We reserve the right to edit or reject submissions that don't
          meet our guidelines. By submitting, you confirm that you own the rights to all content and images.
        </p>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Story"
        )}
      </Button>
    </form>
  )
}

