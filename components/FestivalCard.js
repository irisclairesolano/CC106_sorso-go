import {
    FEATURE_CARD_BASE_CLASSES,
    FEATURE_CARD_BODY_CLASSES,
    FEATURE_CARD_CONTENT_CLASSES,
    FEATURE_CARD_IMAGE_CLASSES,
} from "@/components/DestinationCard"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const formatRange = (start, end) => {
  if (!start) return "Date TBA"
  const startDate = new Date(start)
  const startLabel = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  if (!end) return startLabel

  const endDate = new Date(end)
  const isSameYear = startDate.getFullYear() === endDate.getFullYear()
  const endLabel = endDate.toLocaleDateString("en-US", {
    month: isSameYear ? "short" : "short",
    day: "numeric",
    year: isSameYear ? undefined : "numeric",
  })

  return `${startLabel} – ${endLabel}`
}

export default function FestivalCard({ festival }) {
  return (
    <Card className={FEATURE_CARD_BASE_CLASSES}>
      <div className={`${FEATURE_CARD_IMAGE_CLASSES} bg-muted`}>
        <Image
          src={
            festival.image_url ||
            festival.cover_image_url ||
            "/placeholder.svg?height=400&width=600&query=festival"
          }
          alt={festival.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end max-w-[60%]">
          <Badge className="bg-white/90 text-gray-900 hover:bg-white border-0 shadow-sm text-xs">
            {festival.category || "Festival"}
          </Badge>
        </div>

        <div className={FEATURE_CARD_CONTENT_CLASSES}>
          <h3 className="text-xl font-bold text-white mb-2 [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">
            {festival.name}
          </h3>

          <div className="flex flex-col gap-1 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-2">{formatRange(festival.start_date, festival.end_date)}</span>
            </div>
            {festival.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="line-clamp-1">{festival.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className={FEATURE_CARD_BODY_CLASSES}>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
          {festival.description || "Experience the vibrant culture of Sorsogon."}
        </p>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{festival.image_gallery?.length || 0} gallery photos</span>
          </div>

          <Link
            href={`/festivals/${festival.id}`}
            className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
          >
            View Details →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
