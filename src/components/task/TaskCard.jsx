import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare, Paperclip, AlertCircle, GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import Avatar from '../common/Avatar'
import TaskDetailModal from './TaskDetailModal'

const PRIORITY_STYLES = {
  LOW:    { dot: '#9CA3AF' },
  MEDIUM: { dot: '#3B82F6' },
  HIGH:   { dot: '#F97316' },
  URGENT: { dot: '#EF4444' },
}

const TaskCard = ({ task, isAdmin }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(task.id) })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'pointer',
    touchAction: 'none', 
  }

  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setIsDetailOpen(true)}
        className={`bg-white rounded-xl border shadow-sm transition-all group relative
          ${isDragging 
            ? 'z-50 shadow-2xl border-primary-400 ring-2 ring-primary-100 scale-[1.02]' 
            : 'border-gray-200 hover:shadow-md hover:border-primary-300'
          }`}
      >
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={14} className="text-gray-300" />
        </div>

        <div className="p-4 pl-7"> 
          {task.priority && (
            <div className="mb-2">
              <span 
                className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border"
                style={{
                  background: `${priority.dot}12`,
                  color: priority.dot,
                  borderColor: `${priority.dot}30`,
                }}
              >
                {task.priority}
              </span>
            </div>
          )}

          <h4 className="font-semibold text-gray-900 mb-1 text-sm leading-snug">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                  <Calendar size={12} />
                  {format(new Date(task.dueDate), 'MMM d')}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-gray-400">
                {task.commentsCount > 0 && (
                  <div className="flex items-center gap-0.5 text-[11px]">
                    <MessageSquare size={12} />
                    {task.commentsCount}
                  </div>
                )}
              </div>
            </div>

            {task.assignedTo && (
              <Avatar 
                src={task.assignedTo.avatarUrl} 
                alt={task.assignedTo.username} 
                size="xs" 
              />
            )}
          </div>
        </div>
      </div>

      <TaskDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        taskId={task.id}
        isAdmin={isAdmin}
      />
    </>
  )
}

export default TaskCard