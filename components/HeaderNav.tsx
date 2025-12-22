'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function HeaderNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setIsLoggedIn(!!session)
      } catch (error) {
        console.error('Session check error:', error)
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

          if (loading) {
            // Show a neutral state while loading
            return (
              <nav className="flex items-center justify-between">
                <Link href="/" className="flex items-center hover:opacity-80 transition">
                  <Image
                    src="/pitch-my-page-logo-compressed.png"
                    alt="Pitch My Page"
                    width={150}
                    height={40}
                    className="h-8 w-auto"
                    priority
                  />
                </Link>
        <div className="flex gap-6 items-center">
          <Link href="/gallery" className="text-white hover:text-accent-apricot">Gallery</Link>
          <a href="#pricing" className="text-white hover:text-accent-apricot">Pricing</a>
          <Link href="/auth/login" className="text-white hover:text-accent-apricot">Login</Link>
          <Link 
            href="/auth/signup" 
            className="bg-white text-primary-400 px-4 py-2 rounded-lg font-semibold hover:bg-accent-eggshell transition"
          >
            Get Started
          </Link>
        </div>
      </nav>
    )
  }

          return (
            <nav className="flex items-center justify-between">
              <Link href="/" className="flex items-center hover:opacity-80 transition">
                <Image
                  src="/pitch-my-page-logo-compressed.png"
                  alt="Pitch My Page"
                  width={150}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </Link>
      <div className="flex gap-6 items-center">
        <Link href="/gallery" className="text-white hover:text-accent-apricot">Gallery</Link>
        <a href="#pricing" className="text-white hover:text-accent-apricot">Pricing</a>
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="text-white hover:text-accent-apricot">Dashboard</Link>
            <Link 
              href="/submit" 
              className="bg-white text-primary-400 px-4 py-2 rounded-lg font-semibold hover:bg-accent-eggshell transition"
            >
              Submit Pitch
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="text-white hover:text-accent-apricot">Login</Link>
            <Link 
              href="/auth/signup" 
              className="bg-white text-primary-400 px-4 py-2 rounded-lg font-semibold hover:bg-accent-eggshell transition"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

