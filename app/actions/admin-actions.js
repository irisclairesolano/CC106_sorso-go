"use server"

import { supabase } from "@/lib/supabaseClient"
import { createHmac, randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

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
export async function signAdminSession(payload) {
  const header = { alg: "HS256", typ: "JWT" }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url")

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// --- Helper: Verify session token ---
export async function verifyAdminSession(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    
    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }

    const expectedSignature = createHmac("sha256", ADMIN_SESSION_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    if (expectedSignature !== signature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    
    // Ensure required fields exist
    if (!payload.issuedAt || !payload.sessionId) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Error verifying session token:", error);
    return null;
  }
}

// --- Server action: Verify login ---
export async function verifyAdmin(email, password) {
  try {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate values once to prevent hydration mismatches
      const issuedAt = Date.now();
      const sessionId = randomUUID();
      
      const sessionToken = await signAdminSession({
        email,
        issuedAt,
        sessionId,
      });

      const cookieStore = await cookies();
      await cookieStore.set({
        name: "admin_session",
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      revalidatePath("/admin");
      return { 
        success: true,
        session: { issuedAt, sessionId } // Return session info for debugging
      };
    }

    return { 
      success: false, 
      error: "Invalid credentials" 
    };
  } catch (error) {
    console.error("Error in verifyAdmin:", error);
    return { 
      success: false, 
      error: error.message || "An error occurred during login" 
    };
  }
}

// --- Check if admin is logged in (read-only) ---
export async function isAdmin() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;
    
    // Check if sessionToken exists and is a string
    if (!sessionToken || typeof sessionToken !== 'string') {
      return false;
    }

    // Verify the session token (read-only operation)
    const session = await verifyAdminSession(sessionToken);
    if (!session) {
      return false;
    }

    // Check if session is not expired (24 hours)
    const sessionAge = Date.now() - session.issuedAt;
    return sessionAge <= 24 * 60 * 60 * 1000;
  } catch (error) {
    console.error("Error verifying admin session:", error);
    return false;
  }
}

// --- Server action to validate and clean session ---
export async function validateAdminSession() {
  'use server';
  
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  
  if (!sessionToken || typeof sessionToken !== 'string') {
    await cookieStore.delete("admin_session");
    return { isValid: false };
  }

  const session = await verifyAdminSession(sessionToken);
  if (!session) {
    await cookieStore.delete("admin_session");
    return { isValid: false };
  }

  // Check if session is not expired (24 hours)
  const sessionAge = Date.now() - session.issuedAt;
  if (sessionAge > 24 * 60 * 60 * 1000) {
    await cookieStore.delete("admin_session");
    return { isValid: false };
  }

  return { isValid: true, session };
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
