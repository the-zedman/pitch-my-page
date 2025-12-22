'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function CTASection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <>
      {isLoggedIn ? (
        <Link 
          href="/dashboard" 
          className="inline-block bg-white text-primary-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-accent-eggshell transition"
        >
          Go to Dashboard
        </Link>
      ) : (
        <Link 
          href="/auth/signup" 
          className="inline-block bg-white text-primary-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-accent-eggshell transition"
        >
          Get Started Free
        </Link>
      )}
    </>
  )
}


