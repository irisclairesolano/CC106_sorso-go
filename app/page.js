"use client"

import { getFeaturedDestinations } from "@/app/actions/destination-actions";
import { getUpcomingFestivals } from "@/app/actions/festival-actions";
import { getAboutInfo, getSustainableEntries, getTravelTips } from "@/app/actions/general-actions";
import { getStories } from "@/app/actions/story-actions";
import DestinationCard from "@/components/DestinationCard";
import Hero from "@/components/Hero";
import StoryCard from "@/components/StoryCard";
import TravelTipCard from "@/components/TravelTipCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, ChevronDown, Info, Mail, MapPin, PenSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [upcomingFestivals, setUpcomingFestivals] = useState([]);
  const [aboutInfo, setAboutInfo] = useState(null);
  const [travelTips, setTravelTips] = useState([]);
  const [sustainableEntries, setSustainableEntries] = useState([]);
  const [selectedSustainable, setSelectedSustainable] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [destinations, stories, festivals, about, tips, sustainable] = await Promise.all([
          getFeaturedDestinations(),
          getStories(),
          getUpcomingFestivals(),
          getAboutInfo(),
          getTravelTips(),
          getSustainableEntries(),
        ]);
        
        setFeaturedDestinations(destinations || []);
        setAllStories(stories || []);
        setUpcomingFestivals(festivals || []);
        setAboutInfo(about);
        setTravelTips(tips || []);
        setSustainableEntries(sustainable || []);
        console.log('Sustainable entries loaded:', sustainable?.length || 0, sustainable);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process data
  const approvedStories = allStories?.filter((story) => story?.approved).slice(0, 6) || []
  const festivals = upcomingFestivals?.slice(0, 6) || []
  const destinations = featuredDestinations || []

  // Sustainable Travel Card Component
  const SustainableTravelCard = ({ entry }) => {
    const content = entry.s_description || ''
    const plainText = content.replace(/<[^>]*>/g, '')
    const previewLength = 120
    const shouldTruncate = plainText.length > previewLength
    const preview = shouldTruncate ? plainText.substring(0, previewLength) + '...' : plainText

    const openModal = () => {
      setSelectedSustainable(entry)
    }

    return (
      <>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <Info className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-lg text-green-800 group-hover:text-green-700 transition-colors">
                {entry.s_title}
              </h3>
            </div>
            
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="mb-3">{preview}</p>
              {shouldTruncate && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={openModal}
                  className="p-0 h-auto text-green-600 hover:text-green-700 font-normal"
                >
                  Read More
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedSustainable?.id === entry.id && (
          <Dialog open={true} onOpenChange={() => setSelectedSustainable(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <Info className="h-4 w-4" />
                  </div>
                  {entry.s_title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-4">
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <section id="hero">
        <Hero />
      </section>

      {/* Featured Destinations */}
      <section id="destinations" className="py-20 bg-background">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div className="max-w-4xl">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
                Featured Destinations
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Don't miss these top-rated spots in Sorsogon
              </p>
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
            <div className="flex justify-between items-end mb-12">
              <div className="max-w-4xl">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
                  Travel Stories
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Discover Sorsogon through the eyes of fellow travelers
                </p>
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
            <div className="flex justify-between items-end mb-12">
              <div className="max-w-4xl">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
                  Upcoming Festivals
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Celebrate the rich culture and traditions of Sorsogon
                </p>
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

      {/* Sustainable Travel */}
      {true && ( // Temporarily always show sustainable section
        <section className="py-20 bg-secondary/5">
          <div className="container mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div className="max-w-4xl">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
                  Sustainable Travel
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Eco-friendly practices for responsible tourism in Sorsogon
                </p>
                <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                  <p className="text-base">
                    Sustainable tourism is the practice of traveling with a conscious effort to 
                    <span className="font-semibold text-primary"> protect the environment</span>, 
                    <span className="font-semibold text-primary"> respect local cultures</span>, and 
                    <span className="font-semibold text-primary"> support community economies</span>—
                    ensuring destinations remain vibrant and healthy for future generations. 
                    It is not about sacrifice, but about 
                    <span className="font-semibold text-primary"> traveling more thoughtfully</span>.
                  </p>
                </div>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/about">View All</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sustainableEntries.length > 0 ? (
                sustainableEntries.slice(0, 3).map((entry) => (
                  <SustainableTravelCard key={`sustainable-${entry.id}-${entry.s_title}`} entry={entry} />
                ))
              ) : (
                // Fallback sustainable travel content with beautiful styling
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 rounded-full bg-green-100 text-green-600">
                        <Info className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold text-lg text-green-800 group-hover:text-green-700 transition-colors">
                        What is Sustainable Tourism?
                      </h3>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p>
                        Sustainable tourism is the practice of traveling with a conscious effort to 
                        <span className="font-semibold text-green-600"> protect the environment</span>, 
                        <span className="font-semibold text-green-600"> respect local cultures</span>, and 
                        <span className="font-semibold text-green-600"> support community economies</span>—
                        ensuring destinations remain vibrant and healthy for future generations. 
                        It is not about sacrifice, but about 
                        <span className="font-semibold text-green-600"> traveling more thoughtfully</span>.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/about">View All Sustainable Tips</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Travel Tips */}
      {travelTips.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div className="max-w-4xl">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
                  Travel Tips
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Helpful advice for your Sorsogon adventure
                </p>
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
