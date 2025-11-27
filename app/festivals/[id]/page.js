import { getFestivalById, getFestivals } from "@/app/actions/festival-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarDays, MapPin, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

const formatDateRange = (start, end) => {
  if (!start) return "Date to be announced"

  const startDate = new Date(start)
  const endDate = end ? new Date(end) : null

  const startLabel = startDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  if (!endDate) return startLabel

  const isSameYear = startDate.getFullYear() === endDate.getFullYear()
  const endLabel = endDate.toLocaleDateString("en-US", {
    year: isSameYear ? undefined : "numeric",
    month: "long",
    day: "numeric",
  })

  return `${startLabel} – ${endLabel}`
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const festival = await getFestivalById(id)

  if (!festival) {
    return {
      title: "Festival Not Found | SORSO-GO",
    }
  }

  return {
    title: `${festival.name} | SORSO-GO`,
    description: festival.description?.substring(0, 160) || "Discover vibrant celebrations across Sorsogon.",
  }
}

export default async function FestivalDetailPage({ params }) {
  const { id } = await params
  const festival = await getFestivalById(id)

  if (!festival) {
    notFound()
  }

  const relatedFestivals = (await getFestivals())
    .filter((item) => item.id !== festival.id)
    .slice(0, 3)

  const gallery = Array.isArray(festival.image_gallery) ? festival.image_gallery : []
  const tags = Array.isArray(festival.tags) ? festival.tags : []

  return (
    <article className="min-h-screen pb-20">
      <div className="relative h-[50vh] w-full" aria-label={`Cover image for ${festival.name}`}>
        {festival.image_url ? (
          <Image
            src={festival.image_url}
            alt={festival.name}
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
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto">
            <Link
              href="/festivals"
              className="inline-flex items-center bg-black/70 hover:bg-black/80 text-white px-4 py-2 rounded-lg mb-6 transition-all font-medium group border border-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Festivals
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              {tags.length > 0 && tags.map((tag, idx) => (
                <Badge key={idx} className="text-sm px-3 py-1 bg-white/90 text-gray-900 hover:bg-white border-0 shadow-sm">
                  {typeof tag === "string" ? tag : tag?.name}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]">
              {festival.name}
            </h1>

            <div className="flex flex-wrap gap-4 text-white text-sm md:text-base">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <CalendarDays className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{formatDateRange(festival.start_date, festival.end_date)}</span>
              </div>
              {festival.location && (
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{festival.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl mt-10 space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">About the Celebration</h2>
          <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {festival.description || "Details about this celebration will be added soon."}
          </p>
        </section>

        {gallery.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((imageUrl, index) => (
                <div key={index} className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={imageUrl}
                    alt={`${festival.name} image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="pt-8 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">Share this celebration with friends.</div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" aria-label="Share Festival">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {relatedFestivals.length > 0 && (
          <section className="space-y-4 pt-8 border-t">
            <h2 className="text-2xl font-bold text-primary">More Festivals to Explore</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedFestivals.map((related) => (
                <Link
                  key={related.id}
                  href={`/festivals/${related.id}`}
                  className="group block rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="relative h-48">
                    <Image
                      src={related.image_url || related.cover_image_url || "/placeholder.svg?height=400&width=600&query=festival"}
                      alt={related.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <h3 className="text-xl font-bold text-white">{related.name}</h3>
                      <p className="text-sm text-white/90 line-clamp-2">{related.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
