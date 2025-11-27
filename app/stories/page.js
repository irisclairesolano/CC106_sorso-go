// app/stories/page.js
import { getStories } from "@/app/actions/story-actions"
import StoriesList from "@/components/StoriesList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PenSquare, Search } from "lucide-react"
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
          <h1 className="text-4xl font-bold text-primary">Travel Stories</h1>
          <p className="text-muted-foreground mt-2">
            Discover Sorsogon through the eyes of fellow travelers.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search stories..." className="pl-10 rounded-full" />
          </div>
          <Link href="/story-submission" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <PenSquare className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          </Link>
        </div>
      </div>
      
      <StoriesList stories={stories} />
    </div>
  )
}
