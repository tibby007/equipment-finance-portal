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
import jsPDF from 'jspdf'

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
  const [showEditMode, setShowEditMode] = useState(false)
  const [editData, setEditData] = useState<{
    customer_name?: string;
    equipment_type?: string;
    deal_amount?: number;
  }>({})

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
    setShowEditMode(false)
    setEditData({})
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

      // Reset the new status selection
      setNewStatus('')

      // Note: The kanban board will refresh when the modal is closed due to the onDealClick handler
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    } finally {
      setLoading(false)
      console.log('Status update completed, loading set to false')
    }
  }

  const handleEditDeal = () => {
    if (!selectedDeal) return
    setEditData({
      customer_name: selectedDeal.customer_name,
      equipment_type: selectedDeal.equipment_type,
      deal_amount: selectedDeal.deal_amount,
    })
    setShowEditMode(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedDeal || !authUser) return

    // Check permissions: broker can edit any deal, vendor can only edit their own
    if (authUser.userType === 'vendor' && selectedDeal.vendor_id !== authUser.id) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          customer_name: editData.customer_name,
          equipment_type: editData.equipment_type,
          deal_amount: editData.deal_amount,
          updated_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', selectedDeal.id)

      if (error) throw error

      // Update local state
      setSelectedDeal(prev => prev ? {
        ...prev,
        customer_name: editData.customer_name || prev.customer_name,
        equipment_type: editData.equipment_type || prev.equipment_type,
        deal_amount: editData.deal_amount || prev.deal_amount,
      } : null)

      setShowEditMode(false)
      alert('Deal updated successfully!')
    } catch (error) {
      console.error('Error updating deal:', error)
      alert('Error updating deal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDeal = async () => {
    if (!selectedDeal || !authUser || authUser.userType !== 'broker') return

    const confirmed = confirm(`Are you sure you want to delete the deal for ${selectedDeal.customer_name}? This action cannot be undone.`)
    if (!confirmed) return

    setLoading(true)
    try {
      // Delete related documents and notes first
      await supabase.from('documents').delete().eq('deal_id', selectedDeal.id)
      await supabase.from('notes').delete().eq('deal_id', selectedDeal.id)

      // Delete the deal
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', selectedDeal.id)

      if (error) throw error

      handleCloseDealModal()
      alert('Deal deleted successfully!')

      // Refresh the page to update the kanban board
      window.location.reload()
    } catch (error) {
      console.error('Error deleting deal:', error)
      alert('Error deleting deal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = () => {
    if (!selectedDeal) return

    const doc = new jsPDF()
    const applicationData = (selectedDeal.application_data as Record<string, unknown>) || {}

    // Header
    doc.setFontSize(20)
    doc.text('Equipment Finance Application', 20, 20)

    doc.setFontSize(12)
    doc.text(`Application ID: ${selectedDeal.id}`, 20, 35)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45)

    // Customer Information
    doc.setFontSize(16)
    doc.text('Customer Information', 20, 65)
    doc.setFontSize(10)
    doc.text(`Business Name: ${applicationData.businessLegalName || selectedDeal.customer_name}`, 20, 80)
    doc.text(`Contact Name: ${applicationData.contactName || 'N/A'}`, 20, 90)
    doc.text(`Phone: ${applicationData.businessPhone || 'N/A'}`, 20, 100)
    doc.text(`Email: ${applicationData.businessEmail || 'N/A'}`, 20, 110)
    doc.text(`Address: ${applicationData.businessAddress || 'N/A'}`, 20, 120)
    doc.text(`City: ${applicationData.businessCity || 'N/A'}, State: ${applicationData.businessState || 'N/A'}, ZIP: ${applicationData.businessZip || 'N/A'}`, 20, 130)

    // Equipment Information
    doc.setFontSize(16)
    doc.text('Equipment Information', 20, 150)
    doc.setFontSize(10)
    doc.text(`Equipment Type: ${selectedDeal.equipment_type}`, 20, 165)
    doc.text(`Equipment Description: ${applicationData.equipmentDescription || 'N/A'}`, 20, 175)
    doc.text(`Condition: ${applicationData.equipmentCondition || 'N/A'}`, 20, 185)
    doc.text(`Cost: $${Number(selectedDeal.deal_amount).toLocaleString()}`, 20, 195)
    doc.text(`Salesperson: ${applicationData.salespersonName || 'N/A'}`, 20, 205)

    // Financial Information
    doc.setFontSize(16)
    doc.text('Financial Information', 20, 225)
    doc.setFontSize(10)
    doc.text(`Annual Revenue: $${applicationData.annualRevenue ? Number(applicationData.annualRevenue).toLocaleString() : 'N/A'}`, 20, 240)
    doc.text(`Years in Business: ${applicationData.yearsInBusiness || 'N/A'}`, 20, 250)
    doc.text(`Credit Score: ${applicationData.creditScore || 'N/A'}`, 20, 260)
    doc.text(`Down Payment: $${applicationData.downPayment ? Number(applicationData.downPayment).toLocaleString() : 'N/A'}`, 20, 270)

    // Credit Authorization
    doc.setFontSize(16)
    doc.text('Credit Authorization', 20, 290)
    doc.setFontSize(10)
    doc.text(`Credit Authorization: ${applicationData.creditAuthConsent ? 'AUTHORIZED' : 'NOT AUTHORIZED'}`, 20, 305)
    if (applicationData.creditAuthConsent) {
      doc.text(`Social Security Number: ${applicationData.socialSecurityNumber || 'N/A'}`, 20, 315)
      doc.text(`Date of Birth: ${applicationData.dateOfBirth || 'N/A'}`, 20, 325)
      doc.text(`Authorized Date: ${applicationData.creditAuthDate || new Date().toLocaleDateString()}`, 20, 335)
      doc.text(`Electronic Signature: ${applicationData.creditAuthSignature || 'N/A'}`, 20, 345)
      doc.text('The applicant authorizes the broker and lenders to obtain credit reports and', 20, 355)
      doc.text('verify employment, income, and other information for credit evaluation purposes.', 20, 365)
    }

    // Electronic Signature
    doc.setFontSize(16)
    doc.text('Electronic Signature', 20, 385)
    doc.setFontSize(10)
    doc.text(`Electronic Signature: ${applicationData.electronicSignature ? 'SIGNED ELECTRONICALLY' : 'NOT SIGNED'}`, 20, 400)
    if (applicationData.electronicSignature) {
      doc.text(`Signature Date: ${applicationData.signatureDate || new Date().toLocaleDateString()}`, 20, 410)
      doc.text(`Signed by: ${applicationData.contactName || selectedDeal.customer_name}`, 20, 420)
      doc.text('By providing electronic signature, the applicant agrees to the terms and', 20, 430)
      doc.text('conditions of this equipment finance application.', 20, 440)
    }

    // Save the PDF
    doc.save(`application-${selectedDeal.customer_name.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
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
                  <div className="flex gap-2">
                    {authUser?.userType === 'broker' && (
                      <>
                        <Button variant="outline" size="sm" onClick={generatePDF} className="text-green-600 hover:text-green-700">
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleEditDeal}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDeleteDeal} className="text-red-600 hover:text-red-700">
                          Delete
                        </Button>
                      </>
                    )}
                    {authUser?.userType === 'vendor' && selectedDeal.vendor_id === authUser.id && (
                      <Button variant="outline" size="sm" onClick={handleEditDeal} className="text-blue-600 hover:text-blue-700">
                        Edit Application
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleCloseDealModal}>
                      ✕
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showEditMode && (authUser?.userType === 'broker' || (authUser?.userType === 'vendor' && selectedDeal.vendor_id === authUser.id)) ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">
                      {authUser?.userType === 'broker' ? 'Edit Deal' : 'Edit Application'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={editData.customer_name || ''}
                          onChange={(e) => setEditData({...editData, customer_name: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Equipment Type
                        </label>
                        <input
                          type="text"
                          value={editData.equipment_type || ''}
                          onChange={(e) => setEditData({...editData, equipment_type: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deal Amount ($)
                        </label>
                        <input
                          type="number"
                          value={editData.deal_amount || ''}
                          onChange={(e) => setEditData({...editData, deal_amount: parseFloat(e.target.value) || 0})}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit} disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" onClick={() => setShowEditMode(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
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
                )}

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
                            onClick={async () => {
                              try {
                                if (doc.file_path && doc.file_path.startsWith('#file-')) {
                                  // Fallback file (demo mode)
                                  alert(`Demo file: ${doc.file_name}\nIn production, this would open the actual uploaded document.`)
                                  return
                                }

                                if (doc.file_path && doc.file_path.startsWith('/documents/')) {
                                  // Mock data files (demo mode)
                                  alert(`Demo document: ${doc.file_name}\nPath: ${doc.file_path}\n\nThis is sample data. In production, this would open the actual uploaded document from Supabase storage.`)
                                  return
                                }

                                // Clean the file path - remove leading slash if present
                                let cleanPath = doc.file_path
                                if (cleanPath.startsWith('/')) {
                                  cleanPath = cleanPath.substring(1)
                                }

                                console.log('Attempting to access file path:', cleanPath)

                                // Try to get public URL first
                                const { data } = supabase.storage
                                  .from('documents')
                                  .getPublicUrl(cleanPath)

                                if (data?.publicUrl) {
                                  console.log('Opening public URL:', data.publicUrl)
                                  window.open(data.publicUrl, '_blank')
                                  return
                                }

                                // Fallback: try direct download
                                const { data: downloadData, error } = await supabase.storage
                                  .from('documents')
                                  .download(cleanPath)

                                if (error) {
                                  console.error('Download error:', error)
                                  throw new Error(`File not found in storage: ${error.message}`)
                                }

                                // Create download link
                                const url = URL.createObjectURL(downloadData)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = doc.file_name
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                              } catch (error) {
                                console.error('Error viewing document:', error)
                                const errorMsg = error instanceof Error ? error.message : 'Unknown error'
                                alert(`Error opening document: ${doc.file_name}\n\nDetails: ${errorMsg}\n\nPath: ${doc.file_path}`)
                              }
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