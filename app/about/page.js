import { getAboutInfo, getTravelTips } from "@/app/actions/general-actions"
import TravelTipCard from "@/components/TravelTipCard"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default async function AboutPage() {
  const aboutInfo = await getAboutInfo()
  const tips = await getTravelTips()
  const cultureSections =
    aboutInfo?.culture_sections?.length > 0
      ? aboutInfo.culture_sections
      : [
          { title: "Eco-Friendly Practices", description: "Use reusable water bottles..." },
          { title: "Marine Conservation", description: "Keep a respectful distance from marine life..." },
          { title: "Support Local Communities", description: "Shop local and hire community guides." },
          { title: "Climate Awareness", description: "Use low-impact transport and respect weather patterns." },
        ]
  const galleryImages = aboutInfo?.gallery_images || []

  return (
    <div className="container mx-auto py-12 space-y-20">
      {/* Intro Section */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">About Sorsogon</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          {aboutInfo?.description ||
            "Sorsogon is a province in the Philippines located in the Bicol Region. It is the southernmost province in Luzon and is subdivided into fourteen municipalities and one city."}
        </p>
      </section>

      {/* Grid Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative h-[400px] rounded-3xl overflow-hidden">
          <Image
            src={aboutInfo?.hero_image || "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/d5/10/80/caption.jpg?w=1200&h=1200&s=1"}
            alt="Sorsogon Culture"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-primary">Culture & History</h2>
          <p className="text-muted-foreground leading-relaxed">
            Immerse yourself in the rich heritage of Sorsogon. From the Kasanggayahan Festival celebrating the first
            mass in Luzon to the vibrant traditions of the local communities.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-none">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-primary text-2xl mb-1">14</h3>
                <p className="text-sm text-muted-foreground">Municipalities</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-none">
              <CardContent className="p-4 text-center">
                <h3 className="font-bold text-primary text-2xl mb-1">1</h3>
                <p className="text-sm text-muted-foreground">City</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sustainable Travel Section */}
      <section className="bg-secondary/30 rounded-3xl p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Sustainable Travel</h2>
            <p className="text-lg text-muted-foreground">
              Travel responsibly and help preserve Sorsogon's natural beauty for future generations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {cultureSections.map((section, index) => (
              <Card key={`culture-${index}`} className="border-none bg-background/50">
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
      {galleryImages.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-primary mb-6 text-center">Photo Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {galleryImages.map((url, index) => (
              <div key={`gallery-${index}`} className="relative h-64 rounded-2xl overflow-hidden">
                <Image src={url} alt={`Gallery ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

          <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
            <h3 className="font-semibold text-lg mb-3 text-primary">Our Commitment to SDGs</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sorso-Go aligns with the United Nations Sustainable Development Goals:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>SDG 8:</strong> Promoting sustainable tourism that creates jobs and supports local economic growth
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>SDG 11:</strong> Making cities and communities sustainable through responsible tourism practices
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>SDG 12:</strong> Ensuring responsible consumption and production in tourism activities
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>SDG 13:</strong> Taking climate action by promoting low-impact travel and environmental awareness
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Travel Tips */}
      <section>
        <h2 className="text-3xl font-bold text-primary mb-8 text-center">Travel Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.length > 0 ? (
            tips.map((tip) => <TravelTipCard key={tip.id} tip={tip} />)
          ) : (
            // Fallback tips if DB is empty
            <>
              <TravelTipCard
                tip={{
                  title: "Best Time to Visit",
                  content:
                    "The dry season from November to May is ideal for beach hopping and whale shark interaction.",
                }}
              />
              <TravelTipCard
                tip={{
                  title: "Getting There",
                  content: "You can take a flight to Legazpi City or a bus directly to Sorsogon City from Manila.",
                }}
              />
              <TravelTipCard
                tip={{
                  title: "Local Delicacies",
                  content: "Don't miss trying the Pili nut candies and the spicy Bicol Express.",
                }}
              />
            </>
          )}
        </div>
      </section>
    </div>
  )
}
