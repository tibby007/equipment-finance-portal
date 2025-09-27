'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PrequalificationTool } from '@/components/prequalification/PrequalificationTool'

export default function PrequalificationPage() {
  const { authUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!authUser) {
        router.push('/login')
        return
      }

      // Only vendors can access this page
      if (authUser.userType !== 'vendor') {
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

  if (!authUser || authUser.userType !== 'vendor') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Deal Prequalification</h2>
          <p className="text-gray-600 mt-2">
            Get instant scoring to determine deal approval likelihood before submitting applications
          </p>
        </div>

        <PrequalificationTool />
      </div>
    </DashboardLayout>
  )
}