"use client"

import { getTravelTips } from "@/app/actions/general-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TravelTipsPage() {
  const [tips, setTips] = useState([])
  const [selectedTip, setSelectedTip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTips()
  }, [])

  const loadTips = async () => {
    const data = await getTravelTips()
    setTips(data || [])
    setLoading(false)
  }

  const TravelTipCard = ({ tip }) => {
    const content = tip.content || ''
    const plainText = content.replace(/<[^>]*>/g, '')
    const previewLength = 150
    const shouldTruncate = plainText.length > previewLength
    const preview = shouldTruncate ? plainText.substring(0, previewLength) + '...' : plainText

    const openModal = () => {
      setSelectedTip(tip)
    }

    return (
      <>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Lightbulb className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-lg text-blue-800 group-hover:text-blue-700 transition-colors">
                {tip.title}
              </h3>
            </div>
            
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="mb-3">{preview}</p>
              {shouldTruncate && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={openModal}
                  className="p-0 h-auto text-blue-600 hover:text-blue-700 font-normal"
                >
                  Read More
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedTip?.id === tip.id && (
          <Dialog open={true} onOpenChange={() => setSelectedTip(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  {tip.title}
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
            Travel Tips
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Helpful advice for your Sorsogon adventure
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <Button variant="outline" asChild>
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>

        {/* Tips Grid */}
        {tips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <TravelTipCard key={`tip-${tip.id}-${tip.title}`} tip={tip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No travel tips found.</p>
            <p className="text-muted-foreground mt-2">Check back later for new tips!</p>
          </div>
        )}
      </div>
    </div>
  )
}
