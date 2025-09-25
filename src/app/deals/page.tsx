'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { KanbanBoard } from '@/components/deals/KanbanBoard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database } from '@/types/database'

type Deal = Database['public']['Tables']['deals']['Row']

export default function DealsPage() {
  const { authUser } = useAuth()
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal)
  }

  const handleCloseDealModal = () => {
    setSelectedDeal(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {authUser?.userType === 'broker' ? 'Deal Pipeline' : 'My Deals'}
            </h2>
            <p className="text-muted-foreground">
              {authUser?.userType === 'broker' 
                ? 'Manage deals from all your vendors'
                : 'Track the status of your submitted applications'}
            </p>
          </div>
          {authUser?.userType === 'vendor' && (
            <Button asChild>
              <a href="/application">New Application</a>
            </Button>
          )}
        </div>

        <KanbanBoard onDealClick={handleDealClick} />

        {/* Deal Detail Modal/Sidebar */}
        {selectedDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedDeal.customer_name}</CardTitle>
                    <CardDescription>{selectedDeal.equipment_type}</CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleCloseDealModal}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                      Deal Amount
                    </h4>
                    <p className="text-2xl font-bold">
                      ${Number(selectedDeal.deal_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                      Current Stage
                    </h4>
                    <p className="text-lg font-medium capitalize">
                      {selectedDeal.current_stage.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {selectedDeal.prequalification_score && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                      Prequalification
                    </h4>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedDeal.prequalification_score === 'green' 
                        ? 'bg-green-100 text-green-800'
                        : selectedDeal.prequalification_score === 'yellow'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDeal.prequalification_score.toUpperCase()} LIGHT
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-1">
                      Created
                    </h4>
                    <p>{new Date(selectedDeal.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-muted-foreground mb-1">
                      Last Activity
                    </h4>
                    <p>{new Date(selectedDeal.last_activity || selectedDeal.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedDeal.application_data && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      Application Details
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(selectedDeal.application_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    View Documents
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Add Note
                  </Button>
                  {authUser?.userType === 'broker' && (
                    <Button className="flex-1">
                      Update Status
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}