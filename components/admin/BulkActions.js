"use client"

import { Button } from "@/components/ui/button"
import { useClearSelectedItems, useSelectedItems } from "@/lib/store/adminStore"
import { Check, Trash2, X } from "lucide-react"

export function BulkActions({ onDelete, onPublish, onUnpublish }) {
  const selectedItems = useSelectedItems()
  const clearSelectedItems = useClearSelectedItems()

  if (selectedItems.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 rounded-lg border bg-background/95 p-4 shadow-xl backdrop-blur">
      <span className="text-sm font-medium">
        {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {onPublish ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onPublish(selectedItems)
              clearSelectedItems()
            }}
          >
            <Check className="mr-2 h-4 w-4" /> Publish
          </Button>
        ) : null}

        {onUnpublish ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onUnpublish(selectedItems)
              clearSelectedItems()
            }}
          >
            <X className="mr-2 h-4 w-4" /> Unpublish
          </Button>
        ) : null}

        {onDelete ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(selectedItems)
              clearSelectedItems()
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        ) : null}

        <Button variant="ghost" size="sm" onClick={clearSelectedItems}>
          Clear
        </Button>
      </div>
    </div>
  )
}
