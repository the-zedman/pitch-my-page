'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { LogOut, Menu, X } from 'lucide-react'

export default function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const supabase = createSupabaseClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', active: pathname === '/dashboard' },
    { href: '/dashboard/pitches', label: 'My Pitches', active: pathname?.startsWith('/dashboard/pitches') },
    { href: '/dashboard/backlinks', label: 'Backlinks', active: pathname?.startsWith('/dashboard/backlinks') },
    { href: '/submit', label: 'Submit Pitch', active: pathname === '/submit' },
    { href: '/gallery', label: 'Gallery', active: pathname === '/gallery' },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-500 hover:text-primary-200 transition">
            Pitch My Page
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  link.active
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    link.active
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                disabled={loading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

