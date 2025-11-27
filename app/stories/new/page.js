import { redirect } from "next/navigation"

export const metadata = {
  title: "Share Your Story | SORSO-GO",
  description: "Share your travel experiences and adventures in Sorsogon with our community.",
}

// Redirect /stories/new to /story-submission for consistent UX
export default function NewStoryPage() {
  redirect("/story-submission")
}

