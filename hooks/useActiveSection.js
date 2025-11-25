"use client"

import { useCallback, useEffect, useState } from "react"

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState("")

  const handleIntersection = useCallback((entries) => {
    entries.forEach(entry => {
      console.log('Intersection entry:', {
        id: entry.target.id,
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
        boundingClientRect: entry.boundingClientRect
      })
      
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
        console.log('Setting active section to:', entry.target.id)
        setActiveSection(entry.target.id)
      }
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const sections = ["hero", "destinations", "stories", "festivals", "about", "contact"]
    console.log('Setting up intersection observers for sections:', sections)
    
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -70% 0px', // Changed to only trigger when section enters from bottom
      threshold: [0, 0.1, 0.2, 0.5, 1.0], // Multiple thresholds for better detection
    }

    const observers = sections.map((sectionId, index) => {
      return new IntersectionObserver(handleIntersection, observerOptions)
    })

    // Function to set up observers
    const setupObservers = () => {
      console.log('Setting up observers...')
      sections.forEach((sectionId, index) => {
        const element = document.getElementById(sectionId)
        console.log(`Element for ${sectionId}:`, element)
        if (element && observers[index]) {
          console.log(`Observing section: ${sectionId}`)
          observers[index].observe(element)
        } else if (!element) {
          console.warn(`Element not found for section: ${sectionId}`)
        }
      })
    }

    // Initial setup with delay
    let timer = setTimeout(() => {
      setupObservers()
      
      // Set up a mutation observer to handle dynamic content
      const observer = new MutationObserver((mutations) => {
        const shouldReconnect = mutations.some(mutation => 
          mutation.type === 'childList' || 
          mutation.type === 'attributes' ||
          mutation.attributeName === 'class'
        )
        
        if (shouldReconnect) {
          console.log('DOM changed, reconnecting observers...')
          setupObservers()
        }
      })
      
      // Start observing the document with the configured parameters
      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id']
      })
      
      return () => observer.disconnect()
    }, 500) // Increased delay for better reliability

    // Cleanup
    return () => {
      console.log('Cleaning up observers...')
      clearTimeout(timer)
      sections.forEach((sectionId, index) => {
        const element = document.getElementById(sectionId)
        if (element && observers[index]) {
          observers[index].unobserve(element)
        }
      })
    }
  }, [handleIntersection])

  return activeSection
}
