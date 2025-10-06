'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  const { authUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('LoginPage: useEffect triggered', { loading, authUser: authUser?.email })
    if (!loading && authUser) {
      console.log('LoginPage: Redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [authUser, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-green-600 bg-gradient-to-r from-green-600 to-orange-600 supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:text-transparent forced-colors:bg-none forced-colors:text-current">
            VendorHub OS
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            New to VendorHub OS?{' '}
            <Link
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Create your broker account
            </Link>
          </p>
        </div>
        <LoginForm />
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