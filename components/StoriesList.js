import StoryCard from "@/components/StoryCard"
import { Button } from "@/components/ui/button"
import { PenSquare } from "lucide-react"
import Link from "next/link"

export default function StoriesList({ stories }) {
  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <PenSquare className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No stories yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to share your Sorsogon adventure with our community!
          </p>
          <Link href="/story-submission">
            <Button>
              <PenSquare className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {stories.map((story, index) => (
        <StoryCard key={story.id} story={story} priority={index < 3} />
      ))}
    </div>
  )
}
