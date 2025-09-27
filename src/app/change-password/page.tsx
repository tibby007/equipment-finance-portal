'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PasswordChangeForm } from '@/components/auth/PasswordChangeForm'

export default function ChangePasswordPage() {
  const { authUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!authUser) {
        router.push('/login')
        return
      }

      // Only vendors who must change password should access this page
      if (authUser.userType !== 'vendor' || !authUser.profile.must_change_password) {
        router.push('/dashboard')
        return
      }
    }
  }, [authUser, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!authUser || authUser.userType !== 'vendor' || !authUser.profile.must_change_password) {
    return null
  }

  return <PasswordChangeForm forced={true} />
}