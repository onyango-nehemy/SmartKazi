import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare, Paperclip, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Avatar from '../common/Avatar'
import TaskDetailModal from './TaskDetailModal'

const TaskCard = ({ task }) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setIsDetailModalOpen(true)}
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Priority Badge */}
        {task.priority && (
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        )}

        {/* Title */}
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {/* Comments Count */}
            {task.commentsCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span>{task.commentsCount}</span>
              </div>
            )}
            
            {/* Attachments Count */}
            {task.attachmentsCount > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip size={14} />
                <span>{task.attachmentsCount}</span>
              </div>
            )}
          </div>

          {/* Assigned User */}
          {task.assignedTo && (
            <Avatar
              src={task.assignedTo.avatarUrl}
              alt={task.assignedTo.fullName}
              size="sm"
            />
          )}
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-500'
          }`}>
            <Calendar size={12} />
            <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            {new Date(task.dueDate) < new Date() && (
              <AlertCircle size={12} className="ml-1" />
            )}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        taskId={task.id}
      />
    </>
  )
}

export default TaskCard
