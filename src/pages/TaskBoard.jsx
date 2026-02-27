import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { taskService } from '../services/taskService'
import { useTaskStore } from '../store/taskStore'
import { useProjectStore } from '../store/projectStore'
import TaskColumn from '../components/task/TaskColumn'
import CreateTaskModal from '../components/task/CreateTaskModal'
import toast from 'react-hot-toast'

const TaskBoard = () => {
  const { id } = useParams()
  const { tasks, setTasks, moveTask } = useTaskStore()
  const { currentProject, setCurrentProject } = useProjectStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('TODO')

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-gray-500' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'IN_REVIEW', title: 'In Review', color: 'bg-yellow-500' },
    { id: 'DONE', title: 'Done', color: 'bg-green-500' },
  ]

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    loadTasks()
  }, [id])

  const loadTasks = async () => {
    try {
      const data = await taskService.getAll(id)
      setTasks(data)
    } catch (error) {
      toast.error('Failed to load tasks')
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over) return

    const taskId = active.id
    const newStatus = over.id.split('-')[0] // Extract status from column id

    const task = tasks.find(t => t.id === taskId)
    if (task && task.status !== newStatus) {
      try {
        moveTask(taskId, newStatus, 0)
        await taskService.updateStatus(taskId, newStatus)
        toast.success('Task moved successfully')
      } catch (error) {
        toast.error('Failed to move task')
        loadTasks() // Reload to revert
      }
    }
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const openCreateModal = (status) => {
    setSelectedStatus(status)
    setIsCreateModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentProject?.name || 'Task Board'}
          </h1>
          <p className="text-gray-600 mt-2">Manage and track your tasks</p>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 custom-scrollbar">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              onAddTask={() => openCreateModal(column.id)}
            />
          ))}
        </div>
      </DndContext>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={id}
        initialStatus={selectedStatus}
        onSuccess={loadTasks}
      />
    </div>
  )
}

export default TaskBoard
