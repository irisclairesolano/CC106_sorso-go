"use client"

import DestinationsList from "@/components/DestinationsList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { getDestinations } from "@/app/actions/destination-actions"

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 9

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await getDestinations(false)
      setDestinations(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return destinations
    
    const query = searchQuery.toLowerCase()
    return destinations.filter(dest => 
      dest.name.toLowerCase().includes(query) ||
      dest.category.toLowerCase().includes(query) ||
      dest.address.toLowerCase().includes(query)
    )
  }, [destinations, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredDestinations.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedDestinations = filteredDestinations.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
      <div className="mt-16 space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-[260px] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <DestinationsList destinations={pagedDestinations} />
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  )
}
