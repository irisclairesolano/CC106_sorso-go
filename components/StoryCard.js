import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CalendarDays, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function StoryCard({ story }) {
  const formatDate = (dateString) => {
    if (!dateString) return "Recently"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Link href={`/stories/${story.id}`} className="block">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 group cursor-pointer border-none shadow-md">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={story.image_url || "/placeholder.svg?height=400&width=600&query=travel"}
            alt={story.title}
            fill
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZGRkIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4="
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {story.tags &&
              story.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs font-normal">
                  {tag.name}
                </Badge>
              ))}
          </div>
          <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">{story.title}</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-muted-foreground text-sm line-clamp-3">{story.content}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{story.author_name || "Traveler"}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            <span>{formatDate(story.created_at)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
