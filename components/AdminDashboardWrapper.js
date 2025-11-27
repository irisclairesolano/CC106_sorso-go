"use client"

import dynamic from "next/dynamic"

// Dynamically import AdminDashboard with SSR disabled to prevent hydration mismatch
// This is because Radix UI components (Tabs, Dialog, etc.) generate auto-IDs that
// can differ between server and client renders
const AdminDashboard = dynamic(
  () => import("@/components/AdminDashboard"),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-background w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }
)

export default function AdminDashboardWrapper() {
  return <AdminDashboard />
}

