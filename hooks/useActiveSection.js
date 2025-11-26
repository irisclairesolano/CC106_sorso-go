"use client"

import { useCallback, useEffect, useState } from "react"

export function useActiveSection(sections = []) {
  const [activeSection, setActiveSection] = useState("")

  const handleIntersection = useCallback((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
        setActiveSection(entry.target.id)
      }
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || sections.length === 0) return
    
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -70% 0px',
      threshold: [0, 0.1, 0.2, 0.5, 1.0],
    }

    const observer = new IntersectionObserver(handleIntersection, observerOptions)

    // Function to set up observers
    const setupObservers = () => {
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId)
        if (element) {
          observer.observe(element)
        }
      })
    }

    // Initial setup with delay
    const timer = setTimeout(() => {
      setupObservers()
    }, 500)

    // Cleanup
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [handleIntersection, sections])

  return activeSection
}
