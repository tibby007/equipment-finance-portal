'use client'

import { useState, useEffect } from 'react'
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
  { id: 'new', title: 'New Applications', color: 'bg-blue-500' },
  { id: 'review', title: 'Under Review', color: 'bg-yellow-500' },
  { id: 'documentation', title: 'Documentation', color: 'bg-purple-500' },
  { id: 'approval', title: 'Pending Approval', color: 'bg-orange-500' },
  { id: 'completed', title: 'Completed', color: 'bg-green-500' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500' },
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
      case 'green': return 'bg-green-100 text-green-800'
      case 'yellow': return 'bg-yellow-100 text-yellow-800'  
      case 'red': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{deal.customer_name}</CardTitle>
          {deal.prequalification_score && (
            <Badge className={getPrequalificationColor(deal.prequalification_score)}>
              {deal.prequalification_score.toUpperCase()}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          {deal.equipment_type}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">${Number(deal.deal_amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{new Date(deal.created_at).toLocaleDateString()}</span>
          </div>
          {deal.last_activity && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Activity:</span>
              <span>{new Date(deal.last_activity).toLocaleDateString()}</span>
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
    <div className="flex flex-col bg-gray-50 rounded-lg p-4 min-w-[300px] max-w-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${stage?.color}`} />
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <Badge variant="secondary" className="ml-auto">
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

  useEffect(() => {
    loadDeals()
  }, [authUser])

  const loadDeals = async () => {
    if (!authUser) return

    try {
      let query = supabase.from('deals').select('*')

      if (authUser.userType === 'broker') {
        query = query.eq('broker_id', authUser.id)
      } else {
        query = query.eq('vendor_id', authUser.id)
      }

      const { data: deals, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

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
  }

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