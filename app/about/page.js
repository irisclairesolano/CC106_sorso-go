export const revalidate = 30; // Revalidate every 30 seconds for faster updates

import { getAboutInfo } from "@/app/actions/general-actions";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default async function AboutPage() {
  const aboutInfo = await getAboutInfo()
  
  const galleryImages = aboutInfo?.gallery_images || []

  return (
    <div className="container mx-auto py-12 space-y-20">
      {/* Intro Section */}
      <section className="text-center max-w-4xl mx-auto">
        <div className="mb-8">
          <Image
            src="/sorsogon.jpeg"
            alt="Sorsogon Province - Beautiful landscape and scenery"
            width={800}
            height={400}
            className="rounded-2xl shadow-xl mx-auto object-cover"
            priority
          />
        </div>
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
            src={aboutInfo?.hero_image || "/sorsogon-culture.jpg"}
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

      {/* SDG Alignment Section */}
      <section className="py-12 bg-secondary/30 rounded-3xl px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Our Commitment to SDGs
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sorso-Go aligns with the United Nations Sustainable Development Goals:
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-primary text-xl font-bold mt-1">•</span>
              <div>
                <p className="font-semibold text-foreground mb-1">SDG 8: Promoting sustainable tourism that creates jobs and supports local economic growth</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-primary text-xl font-bold mt-1">•</span>
              <div>
                <p className="font-semibold text-foreground mb-1">SDG 11: Making cities and communities sustainable through responsible tourism practices</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-primary text-xl font-bold mt-1">•</span>
              <div>
                <p className="font-semibold text-foreground mb-1">SDG 12: Ensuring responsible consumption and production in tourism activities</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-primary text-xl font-bold mt-1">•</span>
              <div>
                <p className="font-semibold text-foreground mb-1">SDG 13: Taking climate action by promoting low-impact travel and environmental awareness</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
