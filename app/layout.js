import Footer from "@/components/Footer"
import NavigationWrapper from "@/components/NavigationWrapper"
import ReactQueryProvider from "@/components/ReactQueryProvider"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"
import "./globals.css"
import HtmlWrapper from "./HtmlWrapper"

export const metadata = {
  title: "SORSOGON TOURISM",
  description: "Discover the beauty of Sorsogon, Philippines",
  generator: 'v0.app'
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" })

export default function RootLayout({ children }) {
  return (
    <HtmlWrapper className={`w-full ${inter.variable}`} lang="en">
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased w-full overflow-x-hidden font-sans">
        <ReactQueryProvider>
          <NavigationWrapper />
          <main className="flex-1 w-full">{children}</main>
        </ReactQueryProvider>
        <Footer />
        <Toaster />
      </body>
    </HtmlWrapper>
  )
}
