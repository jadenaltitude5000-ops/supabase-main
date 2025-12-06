import { createBrowserClient as originalCreateBrowserClient } from '@supabase/ssr'
import { Database } from '../database.types'

export function createBrowserClient() {
  return originalCreateBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
