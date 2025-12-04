import {
    FEATURE_CARD_BASE_CLASSES,
    FEATURE_CARD_BODY_CLASSES,
    FEATURE_CARD_CONTENT_CLASSES,
    FEATURE_CARD_IMAGE_CLASSES,
} from "@/components/DestinationCard"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function StoryCard({ story }) {
  const formatDate = (dateString) => {
    if (!dateString) return "Recently"
    const date = new Date(dateString)
    // Use consistent formatting that works the same on server and client
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    })
  }

  // Get tags - handle both array of objects and array of strings
  const tags = story.tags?.slice(0, 2) || []

  return (
    <Card className={FEATURE_CARD_BASE_CLASSES}>
      <div className={FEATURE_CARD_IMAGE_CLASSES}>
        <Image
          src={story.image_url || "/placeholder.svg?height=400&width=600&query=travel+sorsogon"}
          alt={story.title}
          fill
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZGRkIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4="
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="absolute top-4 right-4 flex flex-wrap gap-1.5 justify-end max-w-[60%]">
            {tags.map((tag, index) => (
              <Badge 
                key={typeof tag === 'object' ? tag.id : index} 
                className="bg-white/90 text-gray-900 hover:bg-white border-0 shadow-sm text-xs"
              >
                {typeof tag === 'object' ? tag.name : tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Content */}
        <div className={FEATURE_CARD_CONTENT_CLASSES}>
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">
            {story.title}
          </h3>
          
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{story.author_name || "Anonymous Traveler"}</span>
          </div>
        </div>
      </div>

      <CardContent className={FEATURE_CARD_BODY_CLASSES}>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
          {story.content?.replace(/<[^>]*>/g, '').substring(0, 150) || "No content available..."}
        </p>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formatDate(story.created_at)}</span>
          </div>
          
          <Link
            href={`/stories/${story.id}`}
            className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
          >
            Read Story →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
