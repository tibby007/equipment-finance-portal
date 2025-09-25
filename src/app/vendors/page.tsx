'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { VendorInviteForm } from '@/components/vendors/VendorInviteForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Vendor = Database['public']['Tables']['vendors']['Row']

export default function VendorsPage() {
  const { authUser } = useAuth()
  const router = useRouter()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)

  useEffect(() => {
    if (authUser?.userType !== 'broker') {
      router.push('/dashboard')
      return
    }
    loadVendors()
  }, [authUser, router])

  const loadVendors = useCallback(async () => {
    if (!authUser) return

    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('broker_id', authUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVendors(data || [])
    } catch (error) {
      console.error('Error loading vendors:', error)
    } finally {
      setLoading(false)
    }
  }, [authUser])

  const handleInviteSuccess = () => {
    setShowInviteForm(false)
    loadVendors()
  }

  if (authUser?.userType !== 'broker') {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Vendors</h2>
            <p className="text-muted-foreground">
              Manage your vendor network and send invitations
            </p>
          </div>
          <Button 
            onClick={() => setShowInviteForm(!showInviteForm)}
          >
            {showInviteForm ? 'Cancel' : 'Invite Vendor'}
          </Button>
        </div>

        {showInviteForm && (
          <VendorInviteForm onSuccess={handleInviteSuccess} />
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Vendors</CardTitle>
              <CardDescription>
                {vendors.length === 0 
                  ? 'No vendors invited yet. Start by inviting your first vendor.'
                  : `You have ${vendors.length} vendor${vendors.length === 1 ? '' : 's'} in your network.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No vendors found.</p>
                  <p className="mt-2">
                    Use the &quot;Invite Vendor&quot; button above to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vendors.map((vendor) => (
                    <div 
                      key={vendor.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {vendor.first_name.charAt(0)}{vendor.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {vendor.first_name} {vendor.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.company_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {vendor.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          vendor.must_change_password 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {vendor.must_change_password ? 'Pending Setup' : 'Active'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Joined {new Date(vendor.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}