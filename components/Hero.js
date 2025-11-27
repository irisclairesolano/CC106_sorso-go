import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Sparkles } from "lucide-react"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative overflow-hidden w-full min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
             style={{ 
               backgroundImage: 'url(/hero_img.jpg)',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat'
             }}>
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-palm-green/15 via-transparent to-deep-sea/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-deep-sea/20 via-transparent to-deep-sea/20" />
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-sunset-orange/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-40 right-20 w-40 h-40 bg-ocean-blue/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto relative z-10 px-4">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-palm-green/20 shadow-lg">
            <Sparkles className="h-4 w-4 text-sunset-orange" />
            <span className="text-sm font-medium text-deep-sea">Discover the Gateway to Bicol</span>
          </div>
          
          {/* Main title */}
          <h1 className="text-5xl font-heading font-bold tracking-tight sm:text-7xl text-palm-green mb-6 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]">
            SORSO-GO
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-deep-sea md:text-2xl leading-relaxed max-w-2xl mx-auto font-body font-medium drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]">
            Explore the beauty and culture of Sorsogon.
            <br className="hidden sm:block" />
            Your gateway to pristine beaches, whale sharks, and rich heritage.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Primary CTA - Enhanced styling */}
            <Button 
              size="lg" 
              asChild 
              className="
                w-full sm:w-auto 
                bg-gradient-to-r from-sunset-orange to-sunset-orange/90
                hover:from-sunset-orange/95 hover:to-sunset-orange
                text-white font-heading font-semibold
                shadow-lg shadow-sunset-orange/30
                hover:shadow-xl hover:shadow-sunset-orange/40
                transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200
                px-8 py-6 text-lg
                border-0
                group
              "
            >
              <Link href="/destinations" className="flex items-center gap-2">
                <MapPin className="h-5 w-5 group-hover:animate-bounce" />
                <span>Explore Destinations</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            {/* Secondary CTA */}
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="
                w-full sm:w-auto 
                bg-white/80 backdrop-blur-sm
                hover:bg-white/95
                text-deep-sea font-heading font-medium
                border-2 border-deep-sea/30
                hover:border-deep-sea/50
                shadow-lg
                hover:shadow-xl
                transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200
                px-8 py-6 text-lg
              "
            >
              {/* <Link href="/stories">
                Share Your Story
              </Link> */}
            </Button>
          </div>
          
          {/* Stats or trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm font-medium text-deep-sea/80">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sunset-orange font-bold">50+</span>
              <span>Destinations</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-palm-green font-bold">100+</span>
              <span>Travel Stories</span>
            </div>
            {/* <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-ocean-blue font-bold">🐋</span>
              <span>Whale Shark Capital</span>
            </div> */}
          </div>
        </div>
      </div>

      {/* Gradient fade to content below */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
      
      {/* Subtle vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.25)] pointer-events-none" />
      
      {/* Scroll indicator */}
      {/* <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-deep-sea/60 animate-bounce">
        <span className="text-xs font-medium">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-deep-sea/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-deep-sea/40 rounded-full animate-pulse" />
        </div>
      </div> */}
    </section>
  )
}
