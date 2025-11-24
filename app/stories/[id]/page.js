import { getStoryById } from "@/app/actions/story-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, User, ArrowLeft, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }) {
  const { id } = await params
  const story = await getStoryById(id)

  if (!story) {
    return {
      title: "Story Not Found | SORSO-GO",
    }
  }

  return {
    title: `${story.title} | SORSO-GO`,
    description: story.content.substring(0, 160),
  }
}

export default async function StoryDetailPage({ params }) {
  const { id } = await params
  const story = await getStoryById(id)

  if (!story) {
    notFound()
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Recently"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <article className="min-h-screen pb-20">
      {/* Hero Image */}
      <div className="relative h-[50vh] w-full">
        <Image
          src={story.image_url || "/placeholder.svg?height=800&width=1200&query=travel"}
          alt={story.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto">
            <Link
              href="/stories"
              className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stories
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">{story.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{story.author_name || "Traveler"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDate(story.created_at)}</span>
              </div>
              {story.destination_id && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Sorsogon</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl mt-10">
        <div className="flex flex-wrap gap-2 mb-8">
          {story.tags &&
            story.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-sm px-3 py-1">
                #{tag.name}
              </Badge>
            ))}
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{story.content}</p>
        </div>

        <div className="mt-12 pt-8 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">Share this story</div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
