"use client"

import Navigation from "@/components/Navigation"
import { useEffect, useState } from "react"

export default function NavigationWrapper() {
  const [showAdminButton, setShowAdminButton] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { isAdmin } = await import("@/app/actions/admin-actions")
        const adminLoggedIn = await isAdmin()
        setShowAdminButton(!adminLoggedIn)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setShowAdminButton(true)
      }
    }

    checkAdminStatus()
  }, [])

  return <Navigation showAdminButton={showAdminButton} />
}

