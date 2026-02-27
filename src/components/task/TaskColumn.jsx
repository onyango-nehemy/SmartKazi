import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'

const TaskColumn = ({ column, tasks, onAddTask }) => {
  const { setNodeRef } = useDroppable({
    id: `${column.id}-column`,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`} />
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="text-sm text-gray-500">({tasks.length})</span>
          </div>
          <button
            onClick={onAddTask}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className="flex-1 bg-gray-50 rounded-lg p-3 min-h-[500px] custom-scrollbar overflow-y-auto"
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No tasks</p>
                <button
                  onClick={onAddTask}
                  className="text-primary-600 hover:text-primary-700 text-sm mt-2"
                >
                  Add a task
                </button>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

export default TaskColumn
