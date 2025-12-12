import DestinationCard from "@/components/DestinationCard"

export default function DestinationsList({ destinations }) {
  if (!destinations || destinations.length === 0) {
    return <div className="col-span-full text-center py-20 text-muted-foreground">No destinations found.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {destinations.map((dest, index) => (
        <DestinationCard
          key={dest.id || `destination-${index}`}
          destination={dest}
          priority={index < 3}
        />
      ))}
    </div>
  )
}
