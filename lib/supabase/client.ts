import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client-side Supabase client for browser usage
export const createSupabaseClient = () => {
  return createClientComponentClient()
}

