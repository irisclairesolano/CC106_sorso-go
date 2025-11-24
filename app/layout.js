import "./globals.css"
import NavigationWrapper from "@/components/NavigationWrapper"
import Footer from "@/components/Footer"
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "SORSO-GO | Explore Sorsogon",
  description: "Discover the beauty and culture of Sorsogon. Plan your trip today.",
    generator: 'v0.app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="w-full">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased w-full overflow-x-hidden font-sans">
        <NavigationWrapper />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
