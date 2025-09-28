'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { KanbanBoard } from '@/components/deals/KanbanBoard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Deal = Database['public']['Tables']['deals']['Row']
type Note = Database['public']['Tables']['notes']['Row']
type Document = Database['public']['Tables']['documents']['Row']

export default function DealsPage() {
  const { authUser } = useAuth()
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [newNote, setNewNote] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [dealNotes, setDealNotes] = useState<Note[]>([])
  const [dealDocuments, setDealDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)

  const handleDealClick = async (deal: Deal) => {
    setSelectedDeal(deal)
    setNewStatus(deal.current_stage)
    await loadDealNotes(deal.id)
    await loadDealDocuments(deal.id)
  }

  const handleCloseDealModal = () => {
    setSelectedDeal(null)
    setNewNote('')
    setDealNotes([])
    setDealDocuments([])
  }

  const loadDealNotes = async (dealId: string) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDealNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  const loadDealDocuments = async (dealId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDealDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  const handleAddNote = async () => {
    if (!selectedDeal || !newNote.trim() || !authUser) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          deal_id: selectedDeal.id,
          author_id: authUser.id,
          author_type: authUser.userType,
          message: newNote.trim()
        })

      if (error) throw error

      setNewNote('')
      await loadDealNotes(selectedDeal.id)
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Error adding note. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedDeal || !newStatus || !authUser || authUser.userType !== 'broker') return
    if (newStatus === selectedDeal.current_stage) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          current_stage: newStatus,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedDeal.id)

      if (error) throw error

      // Add a note about the status change
      await supabase
        .from('notes')
        .insert({
          deal_id: selectedDeal.id,
          author_id: authUser.id,
          author_type: authUser.userType,
          message: `Status updated from "${selectedDeal.current_stage.replace('_', ' ')}" to "${newStatus.replace('_', ' ')}"`
        })

      // Update the selected deal state
      setSelectedDeal(prev => prev ? { ...prev, current_stage: newStatus } : null)

      // Reload notes to show the status change note
      await loadDealNotes(selectedDeal.id)

      // Show success message
      alert(`Deal status successfully updated to "${newStatus.replace('_', ' ')}"!`)

      // Note: The kanban board will refresh when the modal is closed due to the onDealClick handler
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    } finally {
      setLoading(false)
    }
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

                {/* Notes Section */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Notes & Comments
                  </h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {dealNotes.map((note) => (
                      <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <Badge variant="outline" className="text-xs">
                            {note.author_type.charAt(0).toUpperCase() + note.author_type.slice(1)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{note.message}</p>
                      </div>
                    ))}
                    {dealNotes.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
                    )}
                  </div>

                  {/* Add Note Form */}
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || loading}
                      size="sm"
                    >
                      {loading ? 'Adding...' : 'Add Note'}
                    </Button>
                  </div>
                </div>

                {/* Documents Section */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Documents ({dealDocuments.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {dealDocuments.map((doc) => (
                      <div key={doc.id} className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">📄</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{doc.file_name}</span>
                            <p className="text-xs text-gray-500">
                              Uploaded {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {doc.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() => {
                              // In a real app, this would download or open the file
                              alert(`Would open/download: ${doc.file_name}`)
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    {dealDocuments.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-gray-400 text-xl">📁</span>
                        </div>
                        <p className="text-sm text-gray-500">No documents uploaded yet</p>
                        <p className="text-xs text-gray-400 mt-1">Documents will appear here when uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Update (Brokers Only) */}
                {authUser?.userType === 'broker' && (
                  <div className="bg-gradient-to-r from-green-50 to-orange-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <span>⚡</span>
                      Update Deal Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Current Status:</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {selectedDeal.current_stage.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger className="flex-1 bg-white border-gray-200">
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New Application</SelectItem>
                            <SelectItem value="application">Application Submitted</SelectItem>
                            <SelectItem value="review">Under Review</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="funded">Funded</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleStatusUpdate}
                          disabled={newStatus === selectedDeal.current_stage || loading || !newStatus}
                          className="bg-gradient-to-r from-green-500 to-orange-500 hover:from-green-600 hover:to-orange-600 text-white shadow-md"
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </div>
                          ) : (
                            'Update Status'
                          )}
                        </Button>
                      </div>
                      {newStatus && newStatus !== selectedDeal.current_stage && (
                        <p className="text-xs text-gray-600 bg-white p-2 rounded">
                          💡 This will move the deal from &quot;{selectedDeal.current_stage.replace('_', ' ')}&quot; to &quot;{newStatus.replace('_', ' ')}&quot; and add a note to the activity log.
                        </p>
                      )}
                    </div>
                  </div>
                )}

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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}