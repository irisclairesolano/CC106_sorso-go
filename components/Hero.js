import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative overflow-hidden w-full min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
             style={{ 
               backgroundImage: 'url(/hero_img.jpg)',
               filter: 'saturate(1.1) contrast(1.1)',
               WebkitFilter: 'saturate(1.1) contrast(1.1)',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat'
             }}>
      <div className="absolute inset-0 bg-gradient-to-b from-palm-green/10 to-deep-sea/20 mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-r from-deep-sea/10 via-transparent to-deep-sea/10 mix-blend-overlay" />
      <div className="absolute inset-0 bg-black/5" />
      <div className="container mx-auto relative z-10 px-4">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h1 className="text-5xl font-heading font-bold tracking-tight sm:text-7xl text-palm-green mb-6 [text-shadow:_0_2px_4px_rgba(255,255,255,0.8)]">SORSO-GO</h1>
          <p className="text-xl text-deep-sea md:text-2xl leading-relaxed max-w-2xl mx-auto font-body font-medium [text-shadow:_0_1px_3px_rgba(255,255,255,0.8)]">
            Explore the beauty and culture of Sorsogon.
            <br className="hidden sm:block" />
            Your gateway to pristine beaches, whale sharks, and rich heritage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto bg-sunset-orange hover:bg-sunset-orange/90 text-white">
              <Link href="/destinations" className="font-heading">
                Explore Destinations <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {/* <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Plan a Trip
            </Button> */}
          </div>
        </div>
      </div>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      {/* Vignette effect */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)]" />
    </section>
  )
}
