import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aaroniaystighbdelips.supabase.co"
// Use service role key for server-side admin operations (bypasses RLS)
// If not available, fall back to anon key (may have RLS restrictions)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcm9uaWF5c3RpZ2hiZGVsaXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MzA5NTYsImV4cCI6MjA3OTAwNjk1Nn0.Rq94y_cWudYGBluB1vwSC5pv17iVZUwGrcww1lNpMOk"

// Server-side admin client that bypasses RLS
// Use this for admin operations that need to bypass row-level security
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

