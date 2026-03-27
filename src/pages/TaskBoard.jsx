import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { taskService }     from '../services/taskService'
import { useTaskStore }    from '../store/taskStore'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore }    from '../store/authStore'
import TaskColumn          from '../components/task/TaskColumn'
import CreateTaskModal     from '../components/task/CreateTaskModal'
import toast               from 'react-hot-toast'
import { LayoutGrid, RefreshCw } from 'lucide-react'

const COLUMNS = [
  { id: 'TODO',        title: 'To Do',       color: 'bg-gray-400'   },
  { id: 'IN_PROGRESS', title: 'In Progress',  color: 'bg-blue-500'   },
  { id: 'IN_REVIEW',   title: 'In Review',   color: 'bg-yellow-500' },
  { id: 'DONE',        title: 'Done',        color: 'bg-green-500'  },
]

const VALID_STATUSES = new Set(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])

const TaskBoard = () => {
  const { id } = useParams()
  const { tasks, setTasks, moveTask } = useTaskStore()
  const { currentProject }           = useProjectStore()
  const { user }                     = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedStatus,    setSelectedStatus]    = useState('TODO')
  const [refreshing,        setRefreshing]        = useState(false)

    const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  )

  
  const columnFirstCollision = useCallback((args) => {
    const pointerHits = pointerWithin(args)
    const columnHit = pointerHits.find(({ id }) => VALID_STATUSES.has(String(id)))
    if (columnHit) return [columnHit]
    return closestCenter(args)
  }, [])

  const loadTasks = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true)
    try {
      const data = await taskService.getAll(id)
      setTasks(data)
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setRefreshing(false)
    }
  }, [id, setTasks])

  useEffect(() => {
    loadTasks()
    return () => setTasks([])
  }, [id])

  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = tasks
        .filter(t => t.status === col.id)
        .sort((a, b) => a.position - b.position)
      return acc
    }, {})
  }, [tasks])

 
const handleDragEnd = async (event) => {
  const { active, over } = event;
  if (!over) return;

  const taskId = String(active.id);
  const newStatus = String(over.id);

  // 1. Guard: Check if it's a valid column and if status actually changed
  if (!VALID_STATUSES.has(newStatus)) return;
  
  const task = tasks.find(t => String(t.id) === taskId);
  if (!task || task.status === newStatus) return;

  // 2. Optimistic Update: Update the UI immediately
  // We calculate the new position based on the target column's current length
  const newPosition = tasksByStatus[newStatus]?.length || 0;
  
  // Update local store immediately so it "moves" in the UI
  moveTask(taskId, newStatus, newPosition);

  try {
    // 3. Persist to Backend
    await taskService.updateStatus(taskId, { 
      status: newStatus, 
      position: newPosition 
    });
    
    toast.success(`Moved to ${newStatus.replace('_', ' ')}`, { id: taskId }); 
  } catch (error) {
  
    toast.error('Connection error: Syncing board...');
    loadTasks(true); 
  }
};

  const openCreateModal = (status) => {
    setSelectedStatus(status)
    setIsCreateModalOpen(true)
  }

  const doneCount  = tasksByStatus['DONE']?.length || 0
  const totalCount = tasks.length
  const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <LayoutGrid size={20} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentProject?.name || 'Task Board'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isAdmin
                ? `${totalCount} tasks · ${pct}% complete`
                : 'Drag cards to update their status'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalCount > 0 && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2">
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600">{pct}%</span>
            </div>
          )}
          <button
            onClick={() => loadTasks()}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>
      {totalCount > 0 && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-green-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={columnFirstCollision} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {COLUMNS.map(column => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              onAddTask={() => openCreateModal(column.id)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </DndContext>
      {isAdmin && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={id}
          initialStatus={selectedStatus}
          onSuccess={() => {
            setIsCreateModalOpen(false)
            loadTasks(true)
          }}
        />
      )}

    </div>
  )
}

export default TaskBoard