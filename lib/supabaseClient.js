import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aaroniaystighbdelips.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcm9uaWF5c3RpZ2hiZGVsaXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MzA5NTYsImV4cCI6MjA3OTAwNjk1Nn0.Rq94y_cWudYGBluB1vwSC5pv17iVZUwGrcww1lNpMOk"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
