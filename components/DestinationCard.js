import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

export default function DestinationCard({ destination }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col group">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={destination.image_url || `/placeholder.svg?height=400&width=600&query=sorsogon+${destination.name}`}
          alt={destination.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="backdrop-blur-md bg-white/80">
            {destination.category}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{destination.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-2">{destination.description}</p>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{destination.address}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link
          href={`/destinations/${destination.id}`}
          className="w-full text-primary text-sm font-medium hover:underline"
        >
          View Details →
        </Link>
      </CardFooter>
    </Card>
  )
}
