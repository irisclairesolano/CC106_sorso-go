import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function DestinationCard({ destination }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col group rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={destination.cover_image_url || destination.image_url || `/placeholder.svg?height=400&width=600&query=sorsogon+${destination.name}`}
          alt={destination.name}
          fill
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
        <div className="absolute bottom-0 left-0 w-full p-6">
          <h3 className="text-xl font-bold text-white mb-2 [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">
            {destination.name}
          </h3>
          
          <div className="flex items-center gap-2 text-white/90 text-sm">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{destination.address}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6 flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
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
