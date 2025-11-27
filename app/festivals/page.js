import { getFestivals, getUpcomingFestivals } from "@/app/actions/festival-actions"
import FestivalCalendar from "@/components/FestivalCalendar"
import FestivalCard from "@/components/FestivalCard"

export const metadata = {
  title: "Festival Calendar | SORSO-GO",
  description: "Discover upcoming festivals and cultural events in Sorsogon.",
}

export default async function FestivalsPage() {
  const festivals = await getFestivals()
  const upcomingFestivals = await getUpcomingFestivals()

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-primary">Festivals & Celebrations</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Celebrate the rich culture and unforgettable traditions of Sorsogon with our curated
              calendar of events.
            </p>
          </div>
        </div>

        {/* Calendar Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-primary mb-6">Calendar Overview</h2>

          <div className="rounded-xl border bg-card shadow-md p-6 max-w-4xl mx-auto">
            <FestivalCalendar
              festivals={festivals}
              className="scale-90 origin-top" //  smaller calendar
            />
          </div>
        </section>

        {/* Upcoming Festivals */}
        {upcomingFestivals.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-primary mb-6">Upcoming Festivals</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingFestivals.map((festival) => (
                <FestivalCard key={festival.id} festival={festival} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
