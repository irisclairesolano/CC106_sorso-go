import { getFestivals, getUpcomingFestivals } from "@/app/actions/festival-actions"
import FestivalCalendar from "@/components/FestivalCalendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "Festival Calendar | SORSO-GO",
  description: "Discover upcoming festivals and cultural events in Sorsogon.",
}

export default async function FestivalsPage() {
  const festivals = await getFestivals()
  const upcomingFestivals = await getUpcomingFestivals()

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary drop-shadow-sm">
            Festival Calendar
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
            Celebrate the rich culture and unforgettable traditions of Sorsogon.
          </p>
        </div>

        {/* Calendar Section */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 relative">
            Calendar View
            <span className="block w-16 h-1 bg-blue-400/40 mt-2 rounded-full"></span>
          </h2>

          <div className="rounded-xl shadow-md border bg-white p-6
                          max-w-4xl mx-auto
                          bg-gradient-to-br from-blue-50 to-blue-100/40">
            <FestivalCalendar
              festivals={festivals}
              className="scale-90 origin-top" //  smaller calendar
            />
          </div>
        </section>

        {/* Upcoming Festivals */}
        {upcomingFestivals.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 relative">
              Upcoming Festivals
              <span className="block w-16 h-1 bg-blue-400/40 mt-2 rounded-full"></span>
            </h2>

            {/* list all events — change slice if you want pagination later */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingFestivals.map((festival) => (
                <Link
                  key={festival.id}
                  href={`/festivals#festival-${festival.id}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden border bg-card shadow-sm
                                   transition-all duration-300
                                   group-hover:shadow-xl group-hover:-translate-y-1">

                    {/* Image */}
                    <div className="relative h-52 w-full">
                      <Image
                        src={
                          festival.image_url ||
                          "/placeholder.svg?height=400&width=600&query=festival"
                        }
                        alt={festival.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Title */}
                    <CardHeader className="pb-0">
                      <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
                        {festival.name}
                      </CardTitle>
                    </CardHeader>

                    {/* Details */}
                    <CardContent className="mt-3">
                      <div className="space-y-3 text-sm text-muted-foreground">

                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            {new Date(festival.start_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {festival.end_date &&
                              ` - ${new Date(festival.end_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}`}
                          </span>
                        </div>

                        {festival.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{festival.location}</span>
                          </div>
                        )}
                      </div>

                      {festival.description && (
                        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                          {festival.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
