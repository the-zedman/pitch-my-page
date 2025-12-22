'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function HeroCTA() {
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
    <div className="flex gap-4 justify-center flex-wrap">
      {isLoggedIn ? (
        <Link 
          href="/submit" 
          className="bg-white text-primary-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-accent-eggshell transition flex items-center gap-2"
        >
          Submit Pitch
          <ArrowRight className="w-5 h-5" />
        </Link>
      ) : (
        <Link 
          href="/auth/signup" 
          className="bg-white text-primary-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-accent-eggshell transition flex items-center gap-2"
        >
          Start Pitching Free
          <ArrowRight className="w-5 h-5" />
        </Link>
      )}
      <Link 
        href="/gallery" 
        className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition"
      >
        Explore Gallery
      </Link>
    </div>
  )
}



