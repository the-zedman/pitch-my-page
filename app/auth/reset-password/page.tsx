'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    // Supabase password reset uses hash fragments in the URL
    // We need to process the hash to establish a session
    const supabase = createSupabaseClient()
    
    const processHash = async () => {
      // Check if there's a hash fragment (Supabase password reset token)
      if (window.location.hash) {
        try {
          // Process the hash to establish a session
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            // Try to exchange the hash for a session
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const accessToken = hashParams.get('access_token')
            const refreshToken = hashParams.get('refresh_token')
            
            if (accessToken && refreshToken) {
              // Set the session manually
              const { error: setError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              })
              
              if (setError) {
                throw setError
              }
              
              setHasToken(true)
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname)
            } else {
              throw new Error('Invalid reset token in URL')
            }
          } else if (data.session) {
            setHasToken(true)
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname)
          }
        } catch (err: any) {
          console.error('Session processing error:', err)
          setError('Invalid or expired reset token. Please request a new password reset.')
        }
      } else {
        // Check if there's already a session
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setHasToken(true)
        } else {
          setError('Invalid or missing reset token. Please request a new password reset.')
        }
      }
    }
    
    processHash()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createSupabaseClient()

      // Update password - Supabase handles the token from the URL hash
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)
      
      // Redirect to login after a moment
      setTimeout(() => {
        router.push('/auth/login?message=Password reset successfully')
      }, 2000)
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.message || 'Failed to reset password. The link may have expired. Please request a new one.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-eggshell rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-semibold">Password reset successfully!</p>
              <p className="text-sm text-green-700 mt-1">Redirecting to login...</p>
            </div>
          </div>
        )}

        {hasToken && !success && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {!hasToken && !success && (
          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary-500 hover:text-primary-200 font-semibold"
            >
              Request a new password reset link
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-gray-700"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

