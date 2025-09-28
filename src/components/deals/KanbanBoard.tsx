'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/types/database'

type Deal = Database['public']['Tables']['deals']['Row']

interface KanbanColumn {
  id: string
  title: string
  deals: Deal[]
}

const DEAL_STAGES = [
  { id: 'new', title: 'New Applications', color: 'bg-gradient-to-r from-blue-500 to-blue-600', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
  { id: 'application', title: 'Application Submitted', color: 'bg-gradient-to-r from-indigo-500 to-indigo-600', textColor: 'text-indigo-700', bgColor: 'bg-indigo-50' },
  { id: 'review', title: 'Under Review', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
  { id: 'approved', title: 'Approved', color: 'bg-gradient-to-r from-orange-500 to-red-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
  { id: 'funded', title: 'Funded', color: 'bg-gradient-to-r from-green-500 to-emerald-600', textColor: 'text-green-700', bgColor: 'bg-green-50' },
  { id: 'declined', title: 'Declined', color: 'bg-gradient-to-r from-red-500 to-red-600', textColor: 'text-red-700', bgColor: 'bg-red-50' },
]

interface DealCardProps {
  deal: Deal
}

function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPrequalificationColor = (score: string | null) => {
    switch (score) {
      case 'green': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
      case 'yellow': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
      case 'red': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md'
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''} hover:shadow-lg transition-all duration-200 border-l-4 border-l-gradient-to-b border-l-green-500 bg-white`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-bold text-gray-900">{deal.customer_name}</CardTitle>
          {deal.prequalification_score && (
            <Badge className={`${getPrequalificationColor(deal.prequalification_score)} font-semibold px-3 py-1`}>
              {deal.prequalification_score.toUpperCase()}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm font-medium text-gray-600 bg-gradient-to-r from-green-50 to-orange-50 px-2 py-1 rounded-lg mt-2">
          {deal.equipment_type}
        </CardDescription>
        {(deal as Deal & { vendor?: { company_name: string; first_name: string; last_name: string } }).vendor && (
          <div className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded">
            <span className="font-medium">Vendor:</span> {(deal as Deal & { vendor: { company_name: string } }).vendor.company_name}
          </div>
        )}
      </CardHeader>
      <CardContent className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg">
        <div className="space-y-3">
          <div className="flex justify-between text-sm bg-white p-2 rounded-lg shadow-sm">
            <span className="text-gray-600 font-medium">Amount:</span>
            <span className="font-bold text-green-700">${Number(deal.deal_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm bg-white p-2 rounded-lg shadow-sm">
            <span className="text-gray-600 font-medium">Created:</span>
            <span className="text-gray-700">{new Date(deal.created_at).toLocaleDateString()}</span>
          </div>
          {deal.last_activity && (
            <div className="flex justify-between text-sm bg-white p-2 rounded-lg shadow-sm">
              <span className="text-gray-600 font-medium">Last Activity:</span>
              <span className="text-orange-600 font-medium">{new Date(deal.last_activity).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface KanbanColumnProps {
  column: KanbanColumn
  onDealClick: (deal: Deal) => void
}

function KanbanColumn({ column, onDealClick }: KanbanColumnProps) {
  const stage = DEAL_STAGES.find(s => s.id === column.id)

  return (
    <div className={`flex flex-col rounded-xl p-4 min-w-[300px] max-w-[300px] shadow-lg border ${stage?.bgColor || 'bg-gray-50'} border-white`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-4 h-4 rounded-full ${stage?.color} shadow-md`} />
        <h3 className={`font-bold text-sm ${stage?.textColor || 'text-gray-700'}`}>{column.title}</h3>
        <Badge className={`ml-auto ${stage?.color} text-white border-0 shadow-md`}>
          {column.deals.length}
        </Badge>
      </div>
      
      <SortableContext items={column.deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {column.deals.map((deal) => (
            <div key={deal.id} onClick={() => onDealClick(deal)}>
              <DealCard deal={deal} />
            </div>
          ))}
          {column.deals.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              No deals in this stage
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

interface KanbanBoardProps {
  onDealClick?: (deal: Deal) => void
}

export function KanbanBoard({ onDealClick = () => {} }: KanbanBoardProps) {
  const { authUser } = useAuth()
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const loadDeals = useCallback(async () => {
    if (!authUser) return

    try {
      let query = supabase.from('deals').select(`
        *,
        vendor:vendors(company_name, first_name, last_name)
      `)

      if (authUser.userType === 'broker') {
        query = query.eq('broker_id', authUser.id)
      } else {
        query = query.eq('vendor_id', authUser.id)
      }

      const { data: deals, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading deals:', error)
        throw error
      }

      console.log(`[KanbanBoard] Loaded ${deals?.length || 0} deals for ${authUser.userType} ${authUser.id}`)

      // Group deals by stage
      const dealsByStage = DEAL_STAGES.reduce((acc, stage) => {
        acc[stage.id] = deals?.filter(deal => deal.current_stage === stage.id) || []
        return acc
      }, {} as Record<string, Deal[]>)

      const newColumns = DEAL_STAGES.map(stage => ({
        id: stage.id,
        title: stage.title,
        deals: dealsByStage[stage.id],
      }))

      setColumns(newColumns)
    } catch (error) {
      console.error('Error loading deals:', error)
    } finally {
      setLoading(false)
    }
  }, [authUser])

  useEffect(() => {
    loadDeals()
  }, [loadDeals])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the deal being dragged
    const activeDeal = columns
      .flatMap(col => col.deals)
      .find(deal => deal.id === activeId)

    if (!activeDeal) return

    // Find source and destination columns
    const sourceColumn = columns.find(col => 
      col.deals.some(deal => deal.id === activeId)
    )
    const destColumn = columns.find(col => col.id === overId) || 
      columns.find(col => col.deals.some(deal => deal.id === overId))

    if (!sourceColumn || !destColumn) return

    // Only brokers can move deals between stages
    if (authUser?.userType !== 'broker' && sourceColumn.id !== destColumn.id) {
      return
    }

    // If dropping on a different column, update the deal stage
    if (sourceColumn.id !== destColumn.id) {
      try {
        const { error } = await supabase
          .from('deals')
          .update({ 
            current_stage: destColumn.id,
            updated_at: new Date().toISOString(),
            last_activity: new Date().toISOString()
          })
          .eq('id', activeId)

        if (error) throw error

        // Update local state
        const updatedColumns = columns.map(col => {
          if (col.id === sourceColumn.id) {
            return {
              ...col,
              deals: col.deals.filter(deal => deal.id !== activeId)
            }
          }
          if (col.id === destColumn.id) {
            return {
              ...col,
              deals: [...col.deals, { ...activeDeal, current_stage: destColumn.id }]
            }
          }
          return col
        })

        setColumns(updatedColumns)
      } catch (error) {
        console.error('Error updating deal stage:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Check if there are no deals at all
  const totalDeals = columns.reduce((sum, col) => sum + col.deals.length, 0)

  if (totalDeals === 0 && authUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">💼</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {authUser.userType === 'broker' ? 'No Deals Yet' : 'No Deals Found'}
          </h3>
          <p className="text-gray-500 text-sm">
            {authUser.userType === 'broker'
              ? 'Your vendors haven\'t submitted any deals yet. Encourage them to start their applications!'
              : 'You haven\'t submitted any deals yet. Click "New Application" to get started!'
            }
          </p>
          {authUser.userType === 'vendor' && (
            <div className="mt-4">
              <a href="/application" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-orange-500 text-white rounded-lg hover:from-green-600 hover:to-orange-600 transition-all">
                Create New Application
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  const activeDeal = activeId 
    ? columns.flatMap(col => col.deals).find(deal => deal.id === activeId)
    : null

  return (
    <div className="w-full">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn 
              key={column.id} 
              column={column} 
              onDealClick={onDealClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}