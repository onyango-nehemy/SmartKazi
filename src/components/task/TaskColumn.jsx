import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'

const TaskColumn = ({ column, tasks, onAddTask, isAdmin }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`} />
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
            <span className="bg-gray-200 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={onAddTask}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Add task"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 rounded-xl p-3 min-h-[500px] overflow-y-auto custom-scrollbar bg-gray-50 border-2 border-transparent"
      >
        <SortableContext
          items={tasks.map(t => String(t.id))}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm font-medium">No tasks yet</p>

                {isAdmin && (
                  <button
                    onClick={onAddTask}
                    className="text-primary-500 hover:text-primary-600 text-sm mt-2 font-medium"
                  >
                    + Add first task
                  </button>
                )}
              </div>
            ) : (
              tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

export default TaskColumn