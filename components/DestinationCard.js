import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const FEATURE_CARD_BASE_CLASSES = "overflow-hidden h-full flex flex-col group rounded-2xl border border-border/40 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.35)] hover:shadow-[0_25px_60px_-25px_rgba(15,23,42,0.45)] transition-all duration-300 bg-card !p-0 !gap-0";
export const FEATURE_CARD_IMAGE_CLASSES = "relative h-60 w-full overflow-hidden"; // The 'relative' position is required for next/image with fill prop
export const FEATURE_CARD_CONTENT_CLASSES = "absolute bottom-0 left-0 w-full p-6";
export const FEATURE_CARD_BODY_CLASSES = "p-6 flex-grow flex flex-col";

export default function DestinationCard({ destination, priority = false }) {
  return (
    <Card className={FEATURE_CARD_BASE_CLASSES}>
      <div className={FEATURE_CARD_IMAGE_CLASSES}>
        <Image
          src={destination.cover_image_url || destination.image_url || `/placeholder.svg?height=400&width=600&query=sorsogon+${destination.name}`}
          alt={destination.name}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZGRkIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4="
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/90 text-gray-900 hover:bg-white border-0 shadow-sm">
            {destination.category}
          </Badge>
        </div>

        {/* Content */}
        <div className={FEATURE_CARD_CONTENT_CLASSES}>
          <h3 className="text-xl font-bold text-white mb-2 [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">
            {destination.name}
          </h3>
          
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{destination.address}</span>
          </div>
        </div>
      </div>

      <CardContent className={FEATURE_CARD_BODY_CLASSES}>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
          {destination.description}
        </p>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{(destination.article_images?.length || 0) + 1} photos</span>
          </div>
          
          <Link
            href={`/destinations/${destination.id}`}
            className="text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
          >
            View Details →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
