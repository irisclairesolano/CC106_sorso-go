"use client"

import DestinationsList from "@/components/DestinationsList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

export default function DestinationsPage() {
  const [destinations] = useState([
    // Sample data - replace with actual data fetching
    { id: 1, name: "Subic Beach", category: "Beach", address: "Matnog, Sorsogon" },
    { id: 2, name: "Bulusan Volcano", category: "Mountain", address: "Bulusan, Sorsogon" },
    { id: 3, name: "Paguriran Island", category: "Island", address: "Sorsogon City" }
  ])
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return destinations
    
    const query = searchQuery.toLowerCase()
    return destinations.filter(dest => 
      dest.name.toLowerCase().includes(query) ||
      dest.category.toLowerCase().includes(query) ||
      dest.address.toLowerCase().includes(query)
    )
  }, [destinations, searchQuery])

  return (
    <div className="container mx-auto py-12 min-h-screen">

      {/* HEADER CONTENT */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
          Destinations
        </h1>
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Explore all the amazing places Sorsogon has to offer.
          </p>
          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
            <p className="text-base">
              From serene beaches and hidden waterfalls to vibrant city corners and heritage sites, 
              Sorsogon invites travelers to discover its diverse landscapes and rich culture. 
              Whether you seek adventure, relaxation, or inspiration, each destination promises a 
              unique story waiting to be lived—responsibly and meaningfully.
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

        {/* Search Destinations */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search destinations..."
              className="pl-10 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

      </div>

      {/* DESTINATION LIST */}
      <div className="mt-16">
        <DestinationsList destinations={filteredDestinations} />
      </div>

    </div>
  )
}
