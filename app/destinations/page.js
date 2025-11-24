import { getDestinations } from "@/app/actions/destination-actions"
import DestinationsList from "@/components/DestinationsList"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export const metadata = {
  title: "Destinations | SORSO-GO",
  description: "Explore the beautiful tourist destinations in Sorsogon.",
}

export default async function DestinationsPage() {
  const destinations = await getDestinations()

  return (
    <div className="container mx-auto py-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-primary">Destinations</h1>
          <p className="text-muted-foreground mt-2">Explore all the amazing places Sorsogon has to offer.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search destinations..." className="pl-10 rounded-full" />
        </div>
      </div>

      <DestinationsList destinations={destinations} />
    </div>
  )
}
