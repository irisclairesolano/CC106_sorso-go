"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X, MapPin } from "lucide-react"
import { useState } from "react"

export default function Navigation({ showAdminButton = true }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    { href: "/", label: "Home" },
    { href: "/destinations", label: "Destinations" },
    { href: "/stories", label: "Stories" },
    { href: "/festivals", label: "Festivals" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <MapPin className="h-6 w-6" />
          <span>SORSO-GO</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
          {showAdminButton && (
            <Button size="sm" asChild>
              <Link href="/admin-login">Admin Login</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-4 animate-accordion-down">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block text-sm font-medium transition-colors hover:text-primary py-2",
                pathname === route.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
          {showAdminButton && (
            <Button className="w-full" size="sm" asChild>
              <Link href="/admin-login" onClick={() => setIsOpen(false)}>
                Admin Login
              </Link>
            </Button>
          )}
        </div>
      )}
    </header>
  )
}
