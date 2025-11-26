"use client"

import { Button } from "@/components/ui/button"
import { useActiveSection } from "@/hooks/useActiveSection"
import { cn } from "@/lib/utils"
import { MapPin, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export default function Navigation({ showAdminButton = true }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const isHomePage = pathname === "/"
  
  // Only observe sections that exist on the current page
  const sections = ["hero", "destinations", "stories", "festivals", "about", "contact"]
    .filter(section => {
      if (typeof document !== 'undefined') {
        return !!document.getElementById(section)
      }
      return false
    })
  
  const activeSection = useActiveSection(sections)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll progress and navbar background
  useEffect(() => {
    console.log('Setting up scroll listener...')
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = windowHeight > 0 ? Math.min(100, (scrollTop / windowHeight) * 100) : 0
      
      console.log('Scroll event - Progress:', {
        scrollTop,
        windowHeight,
        scrollProgress: scrolled,
        isScrolled: scrollTop > 10
      })
      
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
    const timer = setTimeout(() => {
      console.log('Initial scroll check')
      handleScroll()
    }, 300)
    
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
    { href: "/about", label: "About", section: "about" },
    { href: "/contact", label: "Contact", section: "contact" },
  ]

  const scrollToSection = useCallback((sectionId) => {
    if (typeof window === 'undefined') return
    
    const element = document.getElementById(sectionId)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      })
    }
  }, [])

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
            className="h-full bg-palm-green transition-all duration-200 ease-out"
            style={{ 
              width: `${scrollProgress}%`,
              minWidth: '1px' // Ensure it's always visible
            }}
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-xl text-palm-green hover:text-palm-green/90 transition-colors">
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
                "text-sm font-heading font-medium transition-colors relative group",
                isActive(route) 
                  ? "text-palm-green" 
                  : "text-deep-sea/90 hover:text-palm-green"
              )}
              onClick={(e) => {
                if (isHomePage && route.section) {
                  e.preventDefault()
                  scrollToSection(route.section)
                }
                setIsOpen(false)
              }}
            >
              <span className="relative">
                {route.label}
                {isActive(route) && (
                  <span className="ml-2 inline-block h-1 w-4 rounded-full bg-palm-green" />
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
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                  onClick={(e) => {
                    if (isHomePage && route.section) {
                      e.preventDefault()
                      scrollToSection(route.section)
                    }
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
                    <span className="ml-2 inline-block h-1 w-4 rounded-full bg-palm-green" />
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
