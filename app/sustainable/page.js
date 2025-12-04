"use client"

import { getSustainableEntries } from "@/app/actions/general-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SustainableTravelPage() {
  const [entries, setEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const data = await getSustainableEntries()
    setEntries(data || [])
    setLoading(false)
  }

  const SustainableTravelCard = ({ entry }) => {
    const content = entry.s_description || ''
    const plainText = content.replace(/<[^>]*>/g, '')
    const previewLength = 150
    const shouldTruncate = plainText.length > previewLength
    const preview = shouldTruncate ? plainText.substring(0, previewLength) + '...' : plainText

    const openModal = () => {
      setSelectedEntry(entry)
    }

    return (
      <>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <Info className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-lg text-green-800 group-hover:text-green-700 transition-colors">
                {entry.s_title}
              </h3>
            </div>
            
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="mb-3">{preview}</p>
              {shouldTruncate && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={openModal}
                  className="p-0 h-auto text-green-600 hover:text-green-700 font-normal"
                >
                  Read More
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedEntry?.id === entry.id && (
          <Dialog open={true} onOpenChange={() => setSelectedEntry(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <Info className="h-4 w-4" />
                  </div>
                  {entry.s_title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-4">
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
            Sustainable Travel
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Eco-friendly practices for responsible tourism in Sorsogon
            </p>
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
              <p className="text-base">
                Sustainable tourism is the practice of traveling with a conscious effort to 
                <span className="font-semibold text-primary"> protect the environment</span>, 
                <span className="font-semibold text-primary"> respect local cultures</span>, and 
                <span className="font-semibold text-primary"> support community economies</span>—
                ensuring destinations remain vibrant and healthy for future generations. 
                It is not about sacrifice, but about 
                <span className="font-semibold text-primary"> traveling more thoughtfully</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Button variant="outline" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>

        {/* Entries Grid */}
        {entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <SustainableTravelCard key={`sustainable-${entry.id}-${entry.s_title}`} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No sustainable travel entries found.</p>
            <p className="text-muted-foreground mt-2">Check back later for new content!</p>
          </div>
        )}
      </div>
    </div>
  )
}
