export const revalidate = 60; // Revalidate every 60 seconds

import { getFeaturedDestinations } from "@/app/actions/destination-actions";
import { getUpcomingFestivals } from "@/app/actions/festival-actions";
import { getAboutInfo, getTravelTips } from "@/app/actions/general-actions";
import { getStories } from "@/app/actions/story-actions";
import DestinationCard from "@/components/DestinationCard";
import Hero from "@/components/Hero";
import StoryCard from "@/components/StoryCard";
import TravelTipCard from "@/components/TravelTipCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Info, Mail, MapPin, PenSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  // Fetch all data in parallel
  const [featuredDestinations, allStories, upcomingFestivals, aboutInfo, travelTips] = await Promise.all([
    getFeaturedDestinations(),
    getStories(),
    getUpcomingFestivals(),
    getAboutInfo(),
    getTravelTips(),
  ])

  // Process data on the server side
  const approvedStories = allStories?.filter((story) => story?.approved).slice(0, 6) || []
  const festivals = upcomingFestivals?.slice(0, 6) || []
  const destinations = featuredDestinations || []

  return (
    <div className="flex flex-col min-h-screen">
      <section id="hero">
        <Hero />
      </section>

      {/* Featured Destinations */}
      <section id="destinations" className="py-20 bg-background">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-primary">Featured Destinations</h2>
              <p className="text-muted-foreground mt-2">Don't miss these top-rated spots in Sorsogon.</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/destinations">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDestinations.length > 0
              ? featuredDestinations.map((dest, index) => (
                  <DestinationCard key={dest.id || `destination-${index}`} destination={dest} />
                ))
              : [1, 2, 3].map((i) => <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />)}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/destinations">View All Destinations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Travel Stories */}
      {approvedStories.length > 0 && (
        <section id="stories" className="py-20 bg-secondary/30">
          <div className="container mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">Travel Stories</h2>
                <p className="text-muted-foreground mt-2">Discover Sorsogon through the eyes of fellow travelers.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/stories">View All</Link>
                </Button>
                <Button asChild className="hidden sm:flex">
                  <Link href="/story-submission">
                    <PenSquare className="mr-2 h-4 w-4" />
                    Share Story
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden space-x-2">
              <Button variant="outline" asChild>
                <Link href="/stories">View All Stories</Link>
              </Button>
              <Button asChild>
                <Link href="/story-submission">
                  <PenSquare className="mr-2 h-4 w-4" />
                  Share Story
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Festivals */}
      {festivals.length > 0 && (
        <section id="festivals" className="py-20 bg-background">
          <div className="container mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">Upcoming Festivals</h2>
                <p className="text-muted-foreground mt-2">Celebrate the rich culture and traditions of Sorsogon.</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/festivals">View Calendar</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {festivals.map((festival) => (
                <Link key={festival.id} href="/festivals" className="group">
                  <Card className="h-full overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                    {festival.image_url && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={festival.image_url}
                          alt={festival.name}
                          fill
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZGRkIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4="
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{festival.name}</h3>
                      {festival.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{festival.description}</p>
                      )}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            {new Date(festival.start_date).toLocaleDateString("en-US", {
                                        timeZone: "UTC",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {festival.end_date &&
                              ` - ${new Date(festival.end_date).toLocaleDateString("en-US", {
                                  timeZone: "UTC",
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
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/festivals">View Festival Calendar</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Travel Tips */}
      {travelTips.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">Travel Tips</h2>
                <p className="text-muted-foreground mt-2">Helpful advice for your Sorsogon adventure.</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/about">View All Tips</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {travelTips.slice(0, 6).map((tip) => (
                <TravelTipCard key={tip.id} tip={tip} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/about">View All Tips</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {aboutInfo && (
        <section id="about" className="py-20 bg-secondary/30">
          <div className="container mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-primary">About Sorsogon</h2>
                <p className="text-muted-foreground mt-2">Discover the culture, history, and beauty of our province.</p>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {aboutInfo.hero_image && (
                <div className="relative h-[400px] rounded-3xl overflow-hidden">
                  <Image src={aboutInfo.hero_image} alt="Sorsogon" fill className="object-cover" />
                </div>
              )}
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {aboutInfo.description ||
                    "Sorsogon is a province in the Philippines located in the Bicol Region. It is the southernmost province in Luzon and is subdivided into fourteen municipalities and one city."}
                </p>
                <Button asChild>
                  <Link href="/about">
                    <Info className="mr-2 h-4 w-4" />
                    Learn More About Sorsogon
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-6 text-primary">Have Questions?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Get in touch with us for travel advice, recommendations, or to share your Sorsogon experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/story-submission">
                <PenSquare className="mr-2 h-4 w-4" />
                Share Your Story
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
