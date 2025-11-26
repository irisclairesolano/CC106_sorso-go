// app/stories/page.js
import { getStories } from "@/app/actions/story-actions"
import { Button } from "@/components/ui/button"
import { PenSquare } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Travel Stories | SORSO-GO",
  description: "Read about the adventures and experiences of travelers in Sorsogon.",
}

export default async function StoriesPage() {
  const stories = await getStories()

  return (
    <div className="container mx-auto py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Travel Stories</h1>
          <p className="text-muted-foreground mt-2">
            Read about the adventures and experiences of travelers in Sorsogon.
          </p>
        </div>
        <Link href="/stories/new">
          <Button>
            <PenSquare className="w-4 h-4 mr-2" />
            Share Your Story
          </Button>
        </Link>
      </div>
      
      <div className="space-y-8">
        {stories.map((story) => (
          <div key={story.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{story.title}</h2>
                <p className="text-muted-foreground">By {story.author_name || "Anonymous"}</p>
              </div>
              <Link href={`/stories/${story.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
            </div>
            <div className="mt-4 prose max-w-none">
              <p className="line-clamp-3">{story.content.substring(0, 200)}...</p>
            </div>
            <div className="mt-4">
              <Link 
                href={`/stories/${story.id}`} 
                className="text-primary hover:underline text-sm font-medium"
              >
                Read full story →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}