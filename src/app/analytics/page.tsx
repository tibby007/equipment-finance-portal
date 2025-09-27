'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AnalyticsPage() {
  const { authUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!authUser) {
        router.push('/login')
        return
      }

      // Only brokers can access this page
      if (authUser.userType !== 'broker') {
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

  if (!authUser || authUser.userType !== 'broker') {
    return null
  }

  const metrics = [
    {
      title: "Total Applications",
      value: "156",
      change: "+12%",
      trend: "up",
      description: "This month"
    },
    {
      title: "Approval Rate",
      value: "78%",
      change: "+5%",
      trend: "up",
      description: "Last 30 days"
    },
    {
      title: "Average Deal Size",
      value: "$75K",
      change: "-2%",
      trend: "down",
      description: "This quarter"
    },
    {
      title: "Active Vendors",
      value: "42",
      change: "+8%",
      trend: "up",
      description: "This month"
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-2">
            Monitor performance metrics and trends for your equipment finance operations
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardDescription className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500">{metric.description}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and detailed analytics would go here */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Application Volume Trend</CardTitle>
              <CardDescription>Monthly application submissions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Chart visualization would be implemented here</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
              <CardDescription>Vendors with highest approval rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div key={rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {rank}
                      </span>
                      <span className="font-medium">Vendor Name {rank}</span>
                    </div>
                    <span className="text-green-600 font-semibold">{90 - rank * 2}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}