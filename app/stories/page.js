import { getStories } from "@/app/actions/story-actions"
import StoriesList from "@/components/StoriesList"
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
          <h1 className="text-4xl font-bold text-primary mb-2">Travel Stories</h1>
          <p className="text-muted-foreground text-lg">Discover Sorsogon through the eyes of fellow travelers.</p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/story-submission">
            <PenSquare className="h-4 w-4" />
            Share Your Story
          </Link>
        </Button>
      </div>

      <StoriesList stories={stories} />
    </div>
  )
}
