// lib/assertEnv.js
// Guards critical environment variables at runtime.
// Throws a clear error during build/start if any are missing.

const REQUIRED_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const OPTIONAL_VARS = ['MAPBOX_TOKEN', 'NEXT_PUBLIC_MAPBOX_TOKEN']

export function assertEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key])
  if (missing.length) {
    throw new Error(
      `Missing required env variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
    )
  }

  const optMissing = OPTIONAL_VARS.filter((key)=>!process.env[key])
  if (optMissing.length) {
    // Log once – do not throw
    console.warn(`Optional env variable${optMissing.length>1?'s':''} missing: ${optMissing.join(', ')}`)
  }
}
