"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

const MAPBOX_TOKEN = "pk.eyJ1IjoiaXJpc3RoZWZsbG93ZXIiLCJhIjoiY21pOGMyejFnMDh6aTJrczlrMnVpeHhnOCJ9.cVwqkA5utJ3L31h0QlL7AQ"

export default function DestinationMap({ address, destinationName }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)

  useEffect(() => {
    if (map.current) return // Initialize map only once

    mapboxgl.accessToken = MAPBOX_TOKEN

    // Initialize map centered on Sorsogon City (default location)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [124.0, 12.97], // Sorsogon City coordinates
      zoom: 12,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Geocode address if provided
    if (address) {
      // Use Mapbox Geocoding API to get coordinates
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address + ", Sorsogon, Philippines")}.json?access_token=${MAPBOX_TOKEN}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center

            // Update map center
            map.current.setCenter([lng, lat])
            map.current.setZoom(14)

            // Add marker
            if (marker.current) {
              marker.current.remove()
            }

            marker.current = new mapboxgl.Marker({ color: "#3b82f6" })
              .setLngLat([lng, lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(
                  `<h3 class="font-semibold">${destinationName || "Destination"}</h3><p class="text-sm text-muted-foreground">${address}</p>`
                )
              )
              .addTo(map.current)

            // Open popup by default
            marker.current.togglePopup()
          }
        })
        .catch((error) => {
          console.error("Geocoding error:", error)
          // Fallback: add marker at default location
          if (marker.current) {
            marker.current.remove()
          }
          marker.current = new mapboxgl.Marker({ color: "#3b82f6" })
            .setLngLat([124.0, 12.97])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<h3 class="font-semibold">${destinationName || "Destination"}</h3><p class="text-sm text-muted-foreground">Sorsogon City</p>`
              )
            )
            .addTo(map.current)
        })
    } else {
      // No address provided, show default marker
      marker.current = new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([124.0, 12.97])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3 class="font-semibold">${destinationName || "Destination"}</h3><p class="text-sm text-muted-foreground">Sorsogon City</p>`
          )
        )
        .addTo(map.current)
    }

    // Cleanup
    return () => {
      if (marker.current) {
        marker.current.remove()
      }
      if (map.current) {
        map.current.remove()
      }
    }
  }, [address, destinationName])

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  )
}

