"use client"

// app/stories/page.js
import StoriesList from "@/components/StoriesList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PenSquare, Search } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

export default function StoriesPage() {
  const [stories] = useState([
    // Sample data - replace with actual data fetching
    { id: 1, title: "My Amazing Subic Beach Adventure", author_name: "John Doe", content: "Had a great time at Subic Beach...", tags: ["beach", "adventure"] },
    { id: 2, title: "Hiking Bulusan Volcano", author_name: "Jane Smith", content: "The trek was challenging but rewarding...", tags: ["mountain", "hiking"] },
    { id: 3, title: "Island Paradise at Paguriran", author_name: "Mike Johnson", content: "Paguriran Island is a hidden gem...", tags: ["island", "nature"] }
  ])
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return stories
    
    const query = searchQuery.toLowerCase()
    return stories.filter(story => 
      story.title.toLowerCase().includes(query) ||
      story.author_name.toLowerCase().includes(query) ||
      story.content.toLowerCase().includes(query) ||
      story.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }, [stories, searchQuery])

  return (
    <div className="container mx-auto py-12 min-h-screen">
      {/* HEADER CONTENT */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
          Travel Stories
        </h1>
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Discover Sorsogon through the eyes of fellow travelers.
          </p>
          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
            <p className="text-base">
              Every journey carries a story, and each story reveals a new layer of Sorsogon’s charm. From quiet coastal mornings to lively cultural encounters, these narratives offer authentic glimpses into the province’s heart and soul. Dive into real experiences that celebrate the people, places, and moments that make Sorsogon unforgettable.
            </p>
          </div>
        </div>
      </div>

      

      {/* BUTTONS NOW AT THE BOTTOM */}
      <div className="mt-16 flex flex-col items-center gap-6">
        
        {/* Back to Home */}
        <div>
          <Button variant="outline" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>

        {/* Search + Share Your Story */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search stories..." 
              className="pl-10 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Link href="/story-submission" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <PenSquare className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          </Link>
        </div>

      </div>
      <div className="mt-16">
      {/* STORY LIST */}
      <StoriesList stories={filteredStories} />
      </div>
    </div>
    
  )
}
