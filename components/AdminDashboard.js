"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { logoutAdmin } from "@/app/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Plus, Edit, Trash2, Check, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import AdminStoriesTab from "@/components/admin/AdminStoriesTab"
import AdminFestivalsTab from "@/components/admin/AdminFestivalsTab"
import AdminContactTab from "@/components/admin/AdminContactTab"
import AdminDestinationsTab from "@/components/admin/AdminDestinationsTab"
import AdminAboutTab from "@/components/admin/AdminAboutTab"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    await logoutAdmin()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/admin-login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container py-8 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage content for Sorso-Go</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="destinations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="festivals">Festivals & Celebrations</TabsTrigger>
            <TabsTrigger value="about">About Page</TabsTrigger>
            <TabsTrigger value="contact">Contact Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="destinations">
            <AdminDestinationsTab />
          </TabsContent>

          <TabsContent value="stories">
            <AdminStoriesTab />
          </TabsContent>

          <TabsContent value="festivals">
            <AdminFestivalsTab />
          </TabsContent>

          <TabsContent value="about">
            <AdminAboutTab />
          </TabsContent>

          <TabsContent value="contact">
            <AdminContactTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

