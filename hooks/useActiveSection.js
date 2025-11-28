"use client"

import throttle from "lodash.throttle"
import { useCallback, useEffect, useState } from "react"

export function useActiveSection(sections = []) {
  const [activeSection, setActiveSection] = useState("")

  const throttledSet = useCallback(
    throttle((id) => setActiveSection(id), 100),
    []
  )

  const handleIntersection = useCallback((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
        throttledSet(entry.target.id)
      }
    })
  }, [throttledSet])

  useEffect(() => {
    if (typeof window === 'undefined' || sections.length === 0) {
      setActiveSection("")
      return
    }
    
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

    // Initial setup with delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setupObservers()
    }, 500)

    // Cleanup
    return () => {
      clearTimeout(timer)
      observer.disconnect()
      setActiveSection("")
    }
  }, [handleIntersection, sections])

  return activeSection
}
