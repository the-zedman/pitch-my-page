'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { LogOut, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HeaderNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()
  const router = useRouter()

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    // Show a neutral state while loading
    return (
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-80 transition">
          <Image
            src="/pitch-my-page-logo-compressed.png"
            alt="Pitch My Page"
            width={200}
            height={60}
            className="h-12 w-auto rounded-lg"
            priority
          />
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/gallery" className="text-white hover:text-accent-apricot">Gallery</Link>
          <a href="#pricing" className="text-white hover:text-accent-apricot">Pricing</a>
          <div className="w-20 h-8 bg-white/20 rounded-lg animate-pulse"></div> {/* Placeholder */}
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
              className="bg-white text-primary-400 px-4 py-2 rounded-lg font-semibold hover:bg-accent-eggshell transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Submit Pitch
            </Link>
            <button
              onClick={handleLogout}
              className="text-white hover:text-accent-apricot flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
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
