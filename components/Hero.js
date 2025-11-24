import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-16 pb-32 md:pt-32 md:pb-48 w-full">
      <div className="container mx-auto relative z-10">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-primary drop-shadow-sm">SORSO-GO</h1>
          <p className="text-xl text-muted-foreground md:text-2xl leading-relaxed">
            Explore the beauty and culture of Sorsogon.
            <br className="hidden sm:block" />
            Your gateway to pristine beaches, whale sharks, and rich heritage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/destinations">
                Explore Destinations <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Plan a Trip
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-secondary rounded-full blur-3xl" />
      </div>
    </section>
  )
}
