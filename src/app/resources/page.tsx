'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ResourcesPage() {
  const { authUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/login')
    }
  }, [authUser, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!authUser) {
    return null
  }

  const resources = [
    {
      title: "Equipment Finance Guide",
      description: "Complete guide to equipment financing options and requirements",
      type: "PDF Guide",
      action: "Download"
    },
    {
      title: "Application Checklist",
      description: "Ensure you have all required documents before applying",
      type: "Checklist",
      action: "View"
    },
    {
      title: "Industry Resources",
      description: "Specific financing information for your industry",
      type: "Web Resource",
      action: "Browse"
    },
    {
      title: "Contact Support",
      description: "Get help with your application or financing questions",
      type: "Support",
      action: "Contact"
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Resources</h2>
          <p className="text-gray-600 mt-2">
            Access helpful guides, checklists, and support resources for equipment financing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {resource.title}
                  </CardTitle>
                  <span className="text-xs bg-gradient-to-r from-green-100 to-orange-100 text-gray-700 px-2 py-1 rounded-full">
                    {resource.type}
                  </span>
                </div>
                <CardDescription>
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                >
                  {resource.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Need Additional Help?</CardTitle>
            <CardDescription>
              Our team is here to assist you throughout the financing process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Phone Support</h3>
                <p className="text-gray-600">Call us at (555) 123-4567</p>
                <p className="text-sm text-gray-500">Monday - Friday, 9 AM - 6 PM EST</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-gray-600">support@vendorhubos.com</p>
                <p className="text-sm text-gray-500">Response within 24 hours</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700 text-white">
              Contact Support Team
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}