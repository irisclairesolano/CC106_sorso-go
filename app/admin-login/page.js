import AdminLoginForm from "@/components/AdminLoginForm"
import { redirect } from "next/navigation"
import { isAdmin } from "../actions/admin-actions"

export default async function AdminLoginPage() {
  // Check if admin is already logged in
  const loggedIn = await isAdmin()

  if (loggedIn) {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Sign In
          </h2>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}
