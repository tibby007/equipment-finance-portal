'use client'

import { BrokerSignupForm } from '@/components/auth/BrokerSignupForm'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-green-600 bg-gradient-to-r from-green-600 to-orange-600 supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:text-transparent">
            VendorHub OS
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Your Broker Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
        <BrokerSignupForm />
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}