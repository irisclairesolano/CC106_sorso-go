"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Lightbulb } from "lucide-react"

export default function TravelTipModal({ isOpen, onClose, tip }) {
  const content = tip.content || ''

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-secondary text-secondary-foreground">
              <Lightbulb className="h-4 w-4" />
            </div>
            {tip.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div 
            className="prose prose-lg max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
