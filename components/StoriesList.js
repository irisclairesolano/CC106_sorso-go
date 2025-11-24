import StoryCard from "@/components/StoryCard"

export default function StoriesList({ stories }) {
  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-medium text-muted-foreground">No stories found yet.</h3>
        <p className="text-sm text-muted-foreground mt-1">Be the first to share your Sorsogon adventure!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  )
}
