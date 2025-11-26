import { createClient } from "@supabase/supabase-js"

import { assertEnv } from "@/lib/assertEnv"
assertEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Use service role key for server-side admin operations (bypasses RLS)
// If not available, fall back to anon key (may have RLS restrictions)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Server-side admin client that bypasses RLS
// Use this for admin operations that need to bypass row-level security
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

