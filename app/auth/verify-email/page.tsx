'use client'

import Link from 'next/link'
import { Mail, CheckCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-400 to-primary-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-accent-eggshell rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
          <p className="text-gray-600">
            We've sent a verification link to your email address
          </p>
        </div>

        <div className="bg-accent-eggshell border border-primary-300 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm text-primary-400 font-semibold mb-1">What's next?</p>
              <ol className="text-sm text-primary-400 space-y-1 list-decimal list-inside">
                <li>Check your inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return here to sign in</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/auth/login"
            className="block w-full bg-primary-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-200 transition"
          >
            Go to Sign In
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Didn't receive the email? Check your spam folder or{' '}
          <Link href="/auth/resend-verification" className="text-primary-500 hover:underline">
            resend verification email
          </Link>
        </p>
      </div>
    </div>
  )
}

