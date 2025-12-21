import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

// Server-side Supabase client for API routes (handles cookies)
// For API routes, pass the request object to read cookies from request
// For server components, call without request (uses cookies() function)
export async function createServerSupabaseClient(request?: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  // For API routes, we need to use request cookies
  if (request) {
    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Can't set cookies in API routes - handled by middleware
        },
        remove(name: string, options: CookieOptions) {
          // Can't remove cookies in API routes - handled by middleware
        },
      },
    })
  }
  
  // For server components, use cookies() function
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Ignore - handled by middleware
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // Ignore - handled by middleware
        }
      },
    },
  })
}

