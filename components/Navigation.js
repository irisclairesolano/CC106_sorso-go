"use client"

import { Button } from "@/components/ui/button"
import { useActiveSection } from "@/hooks/useActiveSection"
import { cn } from "@/lib/utils"
import { MapPin, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function Navigation({ showAdminButton = true }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const isHomePage = pathname === "/"
  const [sections, setSections] = useState([])
  
  // Only observe sections that exist on the current page - use useEffect to avoid hydration issues
  useEffect(() => {
    if (typeof window !== 'undefined' && isHomePage) {
      const availableSections = ["hero", "destinations", "stories", "festivals", "about", "contact"]
        .filter(section => !!document.getElementById(section))
      
      // Only update if sections actually changed to avoid unnecessary re-renders
      setSections(prev => {
        if (prev.length !== availableSections.length || 
            !prev.every((s, i) => s === availableSections[i])) {
          return availableSections
      }
        return prev
      })
    } else {
      setSections([])
    }
  }, [isHomePage, pathname])
  
  const activeSection = useActiveSection(sections)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll progress and navbar background
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = windowHeight > 0 ? Math.min(100, (scrollTop / windowHeight) * 100) : 0
      
      setScrollProgress(scrolled)
      setIsScrolled(scrollTop > 10)
    }

    // Add debounce to improve performance
    let timeoutId
    const debouncedScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 50)
    }

    window.addEventListener('scroll', debouncedScroll, { passive: true })
    
    // Initial check with a small delay to ensure DOM is ready
    const timer = setTimeout(handleScroll, 300)
    
    return () => {
      clearTimeout(timeoutId)
      clearTimeout(timer)
      window.removeEventListener('scroll', debouncedScroll, { passive: true })
    }
  }, [])

  const routes = [
    { href: "/", label: "Home", section: "hero" },
    { href: "/destinations", label: "Destinations", section: "destinations" },
    { href: "/stories", label: "Stories", section: "stories" },
    { href: "/festivals", label: "Festivals", section: "festivals" },
    { href: "/sustainable", label: "Sustainable Travel" },
    { href: "/tips", label: "Travel Tips" },
    { href: "/about", label: "About", section: "about" },
    { href: "/contact", label: "Contact", section: "contact" },
  ]

  const isActive = (route) => {
    if (!isHomePage) return pathname === route.href
    if (pathname !== '/') return false
    return activeSection === route.section
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled 
        ? "bg-white/90 backdrop-blur-md shadow-sm" 
        : "bg-white/80"
    )}>
      {/* Scroll progress indicator */}
      <div className="relative z-50">
        <div className="w-full h-1 bg-palm-green/20">
          <div 
            className="h-full transition-all duration-200 ease-out bg-palm-green"
            style={{ 
              width: `${scrollProgress}%`,
              minWidth: '1px' // Ensure it's always visible
            }}
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="container flex items-center justify-between h-16 mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 transition-colors font-heading hover:opacity-90"
        >
          <Image
            src="/logo.png"
            alt="SORSO-GO Logo"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="items-center hidden gap-6 md:flex">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-heading font-medium transition-colors relative group",
                isActive(route) 
                  ? "text-palm-green" 
                  : "text-deep-sea/90 hover:text-palm-green"
              )}
              onClick={() => {
                // Just close mobile menu, let Link handle navigation
                setIsOpen(false)
              }}
            >
              <span className="relative">
                {route.label}
                {isActive(route) && (
                  <span className="inline-block w-4 h-1 ml-2 rounded-full bg-palm-green" />
                )}
              </span>
            </Link>
          ))}
          {showAdminButton && (
            <Button 
              size="sm" 
              asChild
              className="bg-[#2E8B57] hover:bg-[#267349] text-white font-heading transition-colors"
            >
              <Link href="/admin-login">Admin Login</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Nav Toggle */}
        <button className="p-2 md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className={cn(
          "fixed inset-0 z-40 bg-sand-beige/95 backdrop-blur-sm md:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <nav className="flex flex-col gap-4 p-6">
            {routes.map((route) => (
              <div key={route.href} className="relative group">
                <Link
                  href={route.href}
                  onClick={() => {
                    // Just close mobile menu, let Link handle navigation
                    setIsOpen(false)
                  }}
                  className={cn(
                    "block text-lg font-heading font-medium py-2 px-4 rounded-lg transition-colors",
                    isActive(route) 
                      ? "bg-palm-green/10 text-palm-green" 
                      : "text-deep-sea hover:bg-palm-green/5 hover:text-palm-green"
                  )}
                >
                  {route.label}
                  {isActive(route) && (
                    <span className="inline-block w-4 h-1 ml-2 rounded-full bg-palm-green" />
                  )}
                </Link>
              </div>
            ))}
          </nav>
          {showAdminButton && (
            <Button 
              className="w-full bg-[#2E8B57] hover:bg-[#267349] text-white font-heading transition-colors" 
              size="lg" 
              asChild
            >
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
