"use server"

import { createHmac, randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabaseClient"

// Get credentials from environment variables (required)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD

// Validate that required environment variables are set
if (!ADMIN_PASSWORD || !ADMIN_EMAIL) {
  throw new Error(
    "Missing required environment variables: ADMIN_PASSWORD and ADMIN_EMAIL must be set in .env.local"
  )
}

if (!ADMIN_SESSION_SECRET) {
  throw new Error(
    "Missing required environment variable: ADMIN_SESSION_SECRET (or ADMIN_PASSWORD) must be set in .env.local"
  )
}

// --- Helper: Create JWT-like session ---
function signAdminSession(payload) {
  const header = { alg: "HS256", typ: "JWT" }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url")

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// --- Helper: Verify session token ---
function verifyAdminSession(token) {
  if (!token) return null
  const [encodedHeader, encodedPayload, signature] = token.split(".")
  if (!encodedHeader || !encodedPayload || !signature) return null

  const expectedSignature = createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url")

  if (expectedSignature !== signature) return null

  try {
    return JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"))
  } catch {
    return null
  }
}

// --- Server action: Verify login ---
export async function verifyAdmin(email, password) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const sessionToken = signAdminSession({
      email,
      issuedAt: Date.now(),
      sessionId: randomUUID(),
    })

    const cookieStore = await cookies()
    await cookieStore.set({
      name: "admin_session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    revalidatePath("/admin")
    return { success: true }
  }

  return { success: false, error: "Invalid credentials" }
}

// --- Check if admin is logged in ---
export async function isAdmin() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("admin_session")
  const session = sessionCookie?.value

  if (!session) return false

  const payload = verifyAdminSession(session)
  return payload?.email === ADMIN_EMAIL
}

// --- Logout admin ---
export async function logoutAdmin() {
  const cookieStore = await cookies()
  await cookieStore.delete("admin_session")
  revalidatePath("/")
  return { success: true }
}

// --- Get all stories (admin view) ---
export async function getAllStories() {
  const { data, error } = await supabase
    .from("story")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching stories:", error)
    return []
  }

  return data || []
}

// --- Approve story ---
export async function approveStory(id) {
  const { data, error } = await supabase
    .from("story")
    .update({ approved: true })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/stories")
  revalidatePath(`/stories/${id}`)
  revalidatePath("/admin")
  return { success: true, data }
}

// --- Delete story ---
export async function deleteStory(id) {
  const { error } = await supabase.from("story").delete().eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/stories")
  revalidatePath("/admin")
  return { success: true }
}

// --- Get all contact messages (admin view) ---
export async function getAllContactMessages() {
  const { data, error } = await supabase
    .from("contact")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contact messages:", error)
    return []
  }

  return data || []
}

// --- Delete contact message ---
export async function deleteContactMessage(id) {
  const { error } = await supabase.from("contact").delete().eq("contact_id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/admin")
  return { success: true }
}
