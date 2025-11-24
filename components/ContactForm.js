"use client"

import { useState } from "react"
import { submitContactForm } from "@/app/actions/general-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.target)
    const attachments = formData.getAll("attachments").filter((file) => file instanceof File)
    formData.delete("attachments")
    attachments.forEach((file) => formData.append("attachments", file))

    const result = await submitContactForm(formData)

    if (result.success) {
      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      })
      e.target.reset()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input id="name" name="name" required placeholder="Your name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" placeholder="What is this regarding?" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Tell us how we can help..."
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachments">Attachments</Label>
        <Input id="attachments" name="attachments" type="file" multiple />
        <p className="text-xs text-muted-foreground">
          Upload supporting files or images (up to 5 attachments, 10MB each).
        </p>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}

