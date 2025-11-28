"use client"

import Navigation from "@/components/Navigation"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function NavigationWrapper() {
  const [showAdminButton, setShowAdminButton] = useState(true)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin') || pathname === '/admin-login'

  useEffect(() => {
    const checkAdminStatus = async () => {
      setLoading(true)
      try {
        const { isAdmin } = await import("@/app/actions/admin-actions")
        const adminLoggedIn = await isAdmin()
        // Hide admin button if admin is logged in and not on admin pages
        setShowAdminButton(!adminLoggedIn || isAdminPage)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setShowAdminButton(true)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [pathname, isAdminPage])

  // Don't show admin button while loading
  if (loading) {
    return <Navigation showAdminButton={false} />
  }

  return <Navigation showAdminButton={showAdminButton} />
}

