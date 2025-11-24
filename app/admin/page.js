import { redirect } from "next/navigation"
import { isAdmin } from "@/app/actions/admin-actions"
import AdminDashboard from "@/components/AdminDashboard"

export const metadata = {
  title: "Admin Dashboard | SORSO-GO",
  description: "Content management dashboard for Sorso-Go.",
}

export default async function AdminPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect("/admin-login")
  }

  return <AdminDashboard />
}

