import { isAdmin } from "@/app/actions/admin-actions"
import AdminDashboardWrapper from "@/components/AdminDashboardWrapper"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "Admin Dashboard | SORSO-GO",
  description: "Content management dashboard for Sorso-Go.",
}

export default async function AdminPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/admin-login")
  }

  return <AdminDashboardWrapper />
}

