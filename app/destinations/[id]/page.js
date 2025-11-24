import { getDestinationById, getFeaturedDestinations } from "@/app/actions/destination-actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import DestinationMap from "@/components/DestinationMap"

export default async function DestinationDetailPage({ params }) {
  const { id } = await params
  const destination = await getDestinationById(id)
  const recommended = await getFeaturedDestinations() // Just reusing featured as recommended for now

  if (!destination) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Destination not found</h1>
        <Button asChild className="mt-4">
          <Link href="/destinations">Back to Destinations</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-[50vh] w-full">
        <Image
          src={destination.image_url || `/placeholder.svg?height=800&width=1200&query=sorsogon+${destination.name}`}
          alt={destination.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="container mx-auto">
            <Button variant="secondary" size="sm" asChild className="mb-6">
              <Link href="/destinations">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
            <Badge className="mb-4 text-lg px-4 py-1">{destination.category}</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2">{destination.name}</h1>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="mr-2 h-5 w-5" />
              <span className="text-lg">{destination.address}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">About</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">{destination.description}</p>
            {destination.article_content && (
              <div
                className="prose prose-lg dark:prose-invert mt-6 max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: destination.article_content }}
              />
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-primary">Location</h2>
            <div className="w-full h-[400px] rounded-2xl overflow-hidden border">
              <DestinationMap address={destination.address} destinationName={destination.name} />
            </div>
            {destination.address && (
              <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {destination.address}
              </p>
            )}
            {destination.coordinates && (
              <p className="text-xs text-muted-foreground mt-1">Coordinates: {destination.coordinates}</p>
            )}
          </section>

          {destination.image_gallery?.length > 1 && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.image_gallery.map((url, index) => (
                  <div key={`gallery-${index}`} className="relative h-64 rounded-xl overflow-hidden">
                    <Image src={url} alt={`${destination.name} gallery ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-xl mb-4">Plan Your Visit</h3>
            <Button className="w-full mb-3">Get Directions</Button>
            <Button variant="outline" className="w-full bg-transparent">
              Save to Itinerary
            </Button>
          </div>

          <div>
            <h3 className="font-bold text-xl mb-4">Recommended Nearby</h3>
            <div className="space-y-4">
              {recommended.slice(0, 2).map((dest, index) => (
                <Link key={dest.id || `recommended-${index}`} href={`/destinations/${dest.id}`} className="block group">
                  <div className="relative h-32 rounded-xl overflow-hidden mb-2">
                    <Image
                      src={dest.image_url || `/placeholder.svg?height=200&width=300&query=${dest.name}`}
                      alt={dest.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-medium group-hover:text-primary transition-colors">{dest.name}</h4>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
