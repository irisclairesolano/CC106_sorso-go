"use client"

import DestinationMap from "@/components/DestinationMap"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Map as MapIcon, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"

export default function DestinationContent({ destination, recommended = [] }) {
  // This component is now a client component
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!destination) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Destination not found</h1>
        <Link href="/destinations" className="mt-4 inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md">
          Back to Destinations
        </Link>
      </div>
    )
  }

  return (
    <article className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[500px] max-h-[800px]" aria-label={`${destination.name} - ${destination.category}`}>
        <div className="absolute inset-0 w-full h-full">
          {destination.cover_image_url ? (
            <Image
              src={destination.cover_image_url}
              alt={destination.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1400px"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No cover image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/destinations"
                className="inline-flex items-center bg-black/70 hover:bg-black/80 text-white px-4 py-2 rounded-lg mb-6 transition-all font-medium border border-white/20 group"
                aria-label="Back to Destinations"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-shadow">Back to Destinations</span>
              </Link>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="text-sm px-3 py-1 bg-white/90 text-gray-900 hover:bg-white border-0 shadow-sm">
                  {destination.category}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)] leading-tight">
                {destination.name}
              </h1>
              {destination.address && (
                <div className="flex items-center gap-4 text-white text-base md:text-lg">
                  <div className="flex items-center gap-2 bg-black/50 hover:bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm transition-colors">
                    <MapPin className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{destination.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 md:px-6 py-12">
        {/* Main Content */}
        <div className="space-y-12">
          <section className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-primary mb-6">About</h2>
            <p className="leading-relaxed text-muted-foreground">{destination.description}</p>
            {destination.article_content && (
              <div 
                className="mt-6 text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: destination.article_content }}
              />
            )}
          </section>

          {/* Article Images Gallery */}
          {destination.article_images?.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {destination.article_images.map((image, index) => (
                  <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${destination.name} - Image ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Location</h2>
            <div className="w-full h-[400px] rounded-xl overflow-hidden border">
              <DestinationMap address={destination.address} destinationName={destination.name} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {destination.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{destination.address}</span>
                </div>
              )}
              {destination.coordinates && (
                <div className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4" />
                  <span>Coordinates: {destination.coordinates}</span>
                </div>
              )}
            </div>
          </section>

          {/* Recommended Destinations */}
          {recommended.length > 0 && (
            <section className="space-y-4 pt-8 border-t">
              <h2 className="text-2xl font-bold text-primary">You Might Also Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommended
                  .filter(dest => dest.id !== destination.id)
                  .slice(0, 2)
                  .map((dest) => (
                    <Link
                      key={dest.id}
                      href={`/destinations/${dest.id}`}
                      className="group block rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="relative h-48">
                        <Image
                          src={dest.cover_image_url || dest.image_url || '/placeholder.svg'}
                          alt={dest.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-4">
                          <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                          <p className="text-sm text-white/90 line-clamp-2">{dest.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  )
}
