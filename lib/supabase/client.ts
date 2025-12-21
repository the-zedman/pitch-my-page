import { createBrowserClient } from '@supabase/ssr'

// Singleton Supabase client for browser usage
// This prevents multiple GoTrueClient instances
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const createSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
  return supabaseClient
}

