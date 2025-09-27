'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalDeals: number
  activeDeals: number
  completedDeals: number
  totalValue: number
}

export default function DashboardPage() {
  const { authUser } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalDeals: 0,
    activeDeals: 0,
    completedDeals: 0,
    totalValue: 0
  })
  const [loading, setLoading] = useState(true)

  const loadDashboardStats = useCallback(async () => {
    if (!authUser) return
    try {
      let query = supabase.from('deals').select('current_stage, deal_amount')

      if (authUser?.userType === 'broker') {
        query = query.eq('broker_id', authUser.id)
      } else {
        query = query.eq('vendor_id', authUser?.id)
      }

      const { data: deals, error } = await query

      if (error) throw error

      const totalDeals = deals?.length || 0
      const activeDeals = deals?.filter(deal => 
        deal.current_stage !== 'completed' && deal.current_stage !== 'rejected'
      ).length || 0
      const completedDeals = deals?.filter(deal => 
        deal.current_stage === 'completed'
      ).length || 0
      const totalValue = deals?.reduce((sum, deal) => sum + Number(deal.deal_amount), 0) || 0

      setStats({
        totalDeals,
        activeDeals,
        completedDeals,
        totalValue
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }, [authUser])

  useEffect(() => {
    loadDashboardStats()
  }, [loadDashboardStats])

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            {authUser?.userType === 'broker' 
              ? 'Overview of your vendor network and deal pipeline'
              : 'Your deal submissions and application status'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Deals
              </CardTitle>
              <span className="text-2xl">💼</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalDeals}
              </div>
              <p className="text-xs text-muted-foreground">
                All time deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Deals
              </CardTitle>
              <span className="text-2xl">🔄</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.activeDeals}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Deals
              </CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.completedDeals}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully closed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Value
              </CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : `$${stats.totalValue.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Portfolio value
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {authUser?.userType === 'broker' ? (
                <>
                  <Link
                    href="/vendors"
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Manage Vendors</div>
                    <div className="text-sm text-muted-foreground">
                      Invite new vendors or view existing ones
                    </div>
                  </Link>
                  <Link
                    href="/deals"
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">View Deal Pipeline</div>
                    <div className="text-sm text-muted-foreground">
                      Review and manage incoming deals
                    </div>
                  </Link>
                  <Link
                    href="/resources"
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Upload Resources</div>
                    <div className="text-sm text-muted-foreground">
                      Share guides and documents with vendors
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/application"
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">New Application</div>
                    <div className="text-sm text-muted-foreground">
                      Submit a new equipment finance application
                    </div>
                  </Link>
                  <Link
                    href="/deals"
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">View My Deals</div>
                    <div className="text-sm text-muted-foreground">
                      Track status of your submitted applications
                    </div>
                  </Link>
                  <Link
                    href="/resources"
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Resources</div>
                    <div className="text-sm text-muted-foreground">
                      View guides and documentation
                    </div>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="text-sm">
                    Welcome to Equipment Finance Portal!
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <div className="text-sm text-muted-foreground">
                    Set up your profile to get started
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}