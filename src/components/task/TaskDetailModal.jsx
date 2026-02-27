import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Avatar from '../common/Avatar'
import { Calendar, User, MessageSquare, Paperclip, Trash2 } from 'lucide-react'
import { taskService } from '../../services/taskService'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const TaskDetailModal = ({ isOpen, onClose, taskId }) => {
  const [task, setTask] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && taskId) {
      loadTaskDetails()
      loadComments()
    }
  }, [isOpen, taskId])

  const loadTaskDetails = async () => {
    try {
      const data = await taskService.getById(taskId)
      setTask(data)
    } catch (error) {
      toast.error('Failed to load task details')
    }
  }

  const loadComments = async () => {
    try {
      const data = await taskService.getComments(taskId)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments')
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const comment = await taskService.addComment(taskId, newComment)
      setComments([...comments, comment])
      setNewComment('')
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    try {
      await taskService.delete(taskId)
      toast.success('Task deleted')
      onClose()
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  if (!task) return null

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      size="lg"
    >
      <div className="space-y-6">
        {/* Task Meta */}
        <div className="flex items-center gap-4 text-sm">
          <span className={`px-2.5 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-1" />
              <span>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
            </div>
          )}
          {task.assignedTo && (
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-600" />
              <Avatar src={task.assignedTo.avatarUrl} alt={task.assignedTo.fullName} size="sm" />
              <span className="text-gray-600">{task.assignedTo.fullName}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Comments Section */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={20} />
            Comments ({comments.length})
          </h3>
          
          {/* Comment List */}
          <div className="space-y-4 mb-4 max-h-64 overflow-y-auto custom-scrollbar">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar src={comment.user.avatarUrl} alt={comment.user.fullName} size="sm" />
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.user.fullName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM dd, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <Button type="submit" loading={loading} disabled={!newComment.trim()}>
              Comment
            </Button>
          </form>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            variant="danger"
            onClick={handleDeleteTask}
            icon={<Trash2 size={16} />}
          >
            Delete Task
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default TaskDetailModal
