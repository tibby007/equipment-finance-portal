'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ApplicationBuilder } from '@/components/application/ApplicationBuilder'

function ApplicationContent() {
  const { authUser, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prequalData, setPrequalData] = useState<{
    customerName: string;
    equipmentType: string;
    dealAmount: number;
    ficoScore: number;
    annualRevenue: number;
    yearsInBusiness: number;
  } | null>(null)

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

  useEffect(() => {
    // Check if coming from prequalification with data
    const prequalDataParam = searchParams.get('prequalData')
    if (prequalDataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(prequalDataParam))
        setPrequalData(data)
      } catch (error) {
        console.error('Error parsing prequalification data:', error)
      }
    }
  }, [searchParams])

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
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Equipment Finance Application</h2>
          <p className="text-gray-600 mt-2">
            Complete your equipment finance application with all required business and financial information
          </p>
        </div>

        <ApplicationBuilder prequalData={prequalData} />
      </div>
    </DashboardLayout>
  )
}

export default function ApplicationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    }>
      <ApplicationContent />
    </Suspense>
  )
}