"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, Lightbulb } from "lucide-react"
import { useState } from "react"
import TravelTipModal from "./TravelTipModal"

export default function TravelTipCard({ tip }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Handle null/undefined content
  const content = tip.content || ''
  // Strip HTML tags for preview and count characters
  const plainText = content.replace(/<[^>]*>/g, '')
  const previewLength = 100
  const shouldTruncate = plainText.length > previewLength
  const preview = shouldTruncate ? plainText.substring(0, previewLength) + '...' : plainText

  return (
    <>
      <Card className="bg-secondary/20 border-none hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-secondary text-secondary-foreground">
              <Lightbulb className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">{tip.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {shouldTruncate ? (
              <div>
                <p>{preview}</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="p-0 h-auto text-primary hover:text-primary/80 font-normal"
                >
                  Read More
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ) : (
              <p>{plainText}</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <TravelTipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tip={tip}
      />
    </>
  )
}
