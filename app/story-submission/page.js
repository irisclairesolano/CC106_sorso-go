import StorySubmissionForm from "@/components/StorySubmissionForm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PenSquare, Image as ImageIcon, FileText } from "lucide-react"

export const metadata = {
  title: "Share Your Story | SORSO-GO",
  description: "Share your travel experiences and adventures in Sorsogon with our community.",
}

export default function StorySubmissionPage() {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">Share Your Story</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have you visited Sorsogon? We'd love to hear about your experience! Share your travel story, photos, and
            memories with our community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Guidelines */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Guidelines</CardTitle>
                <CardDescription>Help us maintain quality content for our community.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Content Quality</h3>
                    <p className="text-xs text-muted-foreground">
                      Write from personal experience. Be authentic and descriptive. Minimum 200 words recommended.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ImageIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Images</h3>
                    <p className="text-xs text-muted-foreground">
                      Upload high-quality photos (JPG, PNG). Maximum 5MB per image. You can upload multiple images.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PenSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Review Process</h3>
                    <p className="text-xs text-muted-foreground">
                      All submissions are reviewed before publication. We'll notify you once your story is approved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">What to Include</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Your personal experience and highlights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Destinations you visited</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Tips for future travelers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Photos that capture the experience</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Story</CardTitle>
                <CardDescription>Fill out the form below to submit your travel story.</CardDescription>
              </CardHeader>
              <CardContent>
                <StorySubmissionForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

