import Navigation from "@/components/Navigation"
import { isAdmin } from "@/app/actions/admin-actions"

export default async function NavigationWrapper() {
  const adminLoggedIn = await isAdmin()
  return <Navigation showAdminButton={!adminLoggedIn} />
}

