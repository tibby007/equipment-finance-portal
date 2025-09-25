'use client'

import { BrokerSignupForm } from '@/components/auth/BrokerSignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in here
            </a>
          </p>
        </div>
        <BrokerSignupForm />
      </div>
    </div>
  )
}