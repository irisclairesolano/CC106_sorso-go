"use client"

import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useRef, useState } from "react"

// Set Mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

// Disable worker to avoid CSP issues
mapboxgl.workerClass = null

export default function DestinationMap({ address, destinationName }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState(null)

  // Initialize map
  useEffect(() => {
    if (map.current || typeof window === 'undefined' || !mapContainer.current) {
      return
    }

    if (!mapboxgl.accessToken) {
      setError('Mapbox token is not set. Please check your environment variables.')
      return
    }

    try {
      // Initialize map with simplified configuration
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [124.0, 12.97], // Sorsogon City coordinates
        zoom: 12,
        // Disable features that might cause CSP issues
        attributionControl: false,
        interactive: true,
        trackResize: true
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Set map as loaded when ready
      map.current.on('load', () => {
        setMapLoaded(true)
      })

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Map error:', e.error)
        setError('Failed to load the map. Please try again later.')
      })

    } catch (error) {
      console.error('Error initializing map:', error)
      setError('Failed to initialize the map. Please check your connection and try again.')
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Add/update marker when address changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return

    const addMarker = async () => {
      // Remove existing marker
      if (marker.current) {
        marker.current.remove()
      }

      if (!address) {
        // Add default marker if no address
        marker.current = new mapboxgl.Marker()
          .setLngLat([124.0, 12.97])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <h3 class="font-semibold">${destinationName || 'Sorsogon City'}</h3>
              <p class="text-sm text-gray-600">Default Location</p>
            `)
          )
          .addTo(map.current)
        return
      }

      try {
        // Geocode the address
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address + ', Sorsogon, Philippines')}.json?access_token=${mapboxgl.accessToken}`
        )
        const data = await response.json()

        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center
          
          // Update map view
          map.current.flyTo({
            center: [lng, lat],
            zoom: 14,
            essential: true
          })

          // Add marker
          marker.current = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <h3 class="font-semibold">${destinationName || 'Destination'}</h3>
                <p class="text-sm text-gray-600 mb-2">${address}</p>
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:underline text-sm"
                >
                  Get Directions
                </a>
              `)
            )
            .addTo(map.current)
            
          // Open popup by default
          marker.current.togglePopup()
        } else {
          setError('Could not find the specified location. Showing default location instead.')
          // Fallback to default marker
          marker.current = new mapboxgl.Marker()
            .setLngLat([124.0, 12.97])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <h3 class="font-semibold">${destinationName || 'Sorsogon City'}</h3>
                <p class="text-sm text-gray-600">Default Location</p>
              `)
            )
            .addTo(map.current)
        }
      } catch (error) {
        console.error('Error geocoding address:', error)
        setError('Failed to find the specified location. Showing default location instead.')
        // Fallback to default marker
        marker.current = new mapboxgl.Marker()
          .setLngLat([124.0, 12.97])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <h3 class="font-semibold">${destinationName || 'Sorsogon City'}</h3>
              <p class="text-sm text-gray-600">Default Location</p>
            `)
          )
          .addTo(map.current)
      }
    }

    addMarker()

    // Cleanup marker on unmount
    return () => {
      if (marker.current) {
        marker.current.remove()
        marker.current = null
      }
    }
  }, [address, destinationName, mapLoaded])

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-lg bg-gray-100 flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-gray-600 mt-2">Please check your internet connection and try again.</p>
        </div>
      </div>
    )
  }

  return (
  <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
    <div 
      ref={mapContainer} 
      className="w-full h-full rounded-lg overflow-hidden bg-gray-100"
      style={{ 
        height: '400px',
        position: 'relative',
        zIndex: 0
      }}
    />
  </div>
)
}