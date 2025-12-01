"use client"

import { logoutAdmin } from "@/app/actions/admin-actions"
import { DashboardSkeleton } from "@/components/admin/AdminSkeletons"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useClearSelectedItems } from "@/lib/store/adminStore"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Suspense, lazy, useCallback, useEffect, useRef } from "react"

const AdminStoriesTab = lazy(() => import("@/components/admin/AdminStoriesTab"))
const AdminFestivalsTab = lazy(() => import("@/components/admin/AdminFestivalsTab"))
const AdminContactTab = lazy(() => import("@/components/admin/AdminContactTab"))
const AdminDestinationsTab = lazy(() => import("@/components/admin/AdminDestinationsTab"))
const AdminAboutTab = lazy(() => import("@/components/admin/AdminAboutTab"))

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const clearSelectedItems = useClearSelectedItems()

  // Use ref to store the latest clearSelectedItems to avoid dependency issues
  const clearSelectedItemsRef = useRef(clearSelectedItems)
  
  // Update ref in effect to avoid state updates during render
  useEffect(() => {
    clearSelectedItemsRef.current = clearSelectedItems
  }, [clearSelectedItems])

  // Memoize the clearSelectedItems callback to prevent infinite re-renders
  const handleTabChange = useCallback(() => {
    // Use setTimeout to defer state update to avoid React error #185
    setTimeout(() => {
      clearSelectedItemsRef.current()
    }, 0)
  }, [])

  const handleLogout = async () => {
    await logoutAdmin()
    clearSelectedItems()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/admin-login")
    router.refresh()
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Manage content for Sorso-Go</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Dashboard Tabs */}
        <ErrorBoundary>
          <Tabs
            defaultValue="destinations"
            className="space-y-6"
            onValueChange={handleTabChange}
          >
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                <TabsTrigger value="destinations">Destinations</TabsTrigger>
                <TabsTrigger value="stories">Stories</TabsTrigger>
                <TabsTrigger value="festivals">Festivals</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="contact">Messages</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="destinations">
              <Suspense fallback={<DashboardSkeleton />}>
                <AdminDestinationsTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="stories">
              <Suspense fallback={<DashboardSkeleton />}>
                <AdminStoriesTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="festivals">
              <Suspense fallback={<DashboardSkeleton />}>
                <AdminFestivalsTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="about">
              <Suspense fallback={<DashboardSkeleton />}>
                <AdminAboutTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="contact">
              <Suspense fallback={<DashboardSkeleton />}>
                <AdminContactTab />
              </Suspense>
            </TabsContent>
          </Tabs>
        </ErrorBoundary>
      </div>
    </div>
  )
}

