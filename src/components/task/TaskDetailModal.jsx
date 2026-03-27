import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Avatar from '../common/Avatar'
import {
  Calendar, User, MessageSquare,
  Trash2, Clock, Tag, AlertCircle
} from 'lucide-react'
import { taskService } from '../../services/taskService'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const PRIORITY_COLORS = {
  LOW:    { bg:'#F3F4F6', color:'#6B7280', border:'#E5E7EB' },
  MEDIUM: { bg:'#EFF6FF', color:'#3B82F6', border:'#BFDBFE' },
  HIGH:   { bg:'#FFF7ED', color:'#F97316', border:'#FED7AA' },
  URGENT: { bg:'#FEF2F2', color:'#EF4444', border:'#FECACA' },
}

const STATUS_COLORS = {
  TODO:        { bg:'#F3F4F6', color:'#6B7280' },
  IN_PROGRESS: { bg:'#EFF6FF', color:'#3B82F6' },
  IN_REVIEW:   { bg:'#FEFCE8', color:'#CA8A04' },
  DONE:        { bg:'#F0FDF4', color:'#16A34A' },
}

const STATUS_LABELS = {
  TODO:        'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW:   'In Review',
  DONE:        'Done',
}

const TaskDetailModal = ({ isOpen, onClose, taskId, isAdmin, onTaskDeleted }) => {
  const [task,       setTask]       = useState(null)
  const [comments,   setComments]   = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  useEffect(() => {
    if (isOpen && taskId) {
      setLoading(true)
      // Load both in parallel
      Promise.all([
        taskService.getById(taskId),
        taskService.getComments(taskId),
      ])
        .then(([taskData, commentsData]) => {
          setTask(taskData)
          setComments(commentsData)
        })
        .catch(() => toast.error('Failed to load task details'))
        .finally(() => setLoading(false))
    }
    // Reset state when modal closes
    if (!isOpen) {
      setTask(null)
      setComments([])
      setNewComment('')
      setLoading(true)
    }
  }, [isOpen, taskId])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      const comment = await taskService.addComment(taskId, newComment.trim())
      setComments(prev => [...prev, comment])
      setNewComment('')
      // Update comments count on task
      setTask(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }))
      toast.success('Comment added')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This cannot be undone.')) return
    setDeleting(true)
    try {
      await taskService.delete(taskId)
      toast.success('Task deleted successfully')
      onClose()
      // Tell the board to refresh
      if (onTaskDeleted) onTaskDeleted()
    } catch {
      toast.error('Failed to delete task')
    } finally {
      setDeleting(false)
    }
  }

  const priority = task ? PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM : null
  const status   = task ? STATUS_COLORS[task.status]     || STATUS_COLORS.TODO      : null
  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={loading ? 'Loading…' : (task?.title || 'Task Details')}
      size="lg"
    >
      {/* ── Loading state ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
        </div>
      )}

      {/* ── Task not found ── */}
      {!loading && !task && (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Task not found</p>
          <p className="text-sm mt-1">It may have been deleted.</p>
        </div>
      )}
      {!loading && task && (
        <div className="space-y-5">

        
          <div className="flex flex-wrap items-center gap-2">
           
            <span style={{
              background: priority.bg, color: priority.color,
              border: `1px solid ${priority.border}`,
              padding: '3px 10px', borderRadius: 99,
              fontSize: 11, fontWeight: 700,
            }}>
              {task.priority}
            </span>

            {/* Status */}
            <span style={{
              background: status.bg, color: status.color,
              padding: '3px 10px', borderRadius: 99,
              fontSize: 11, fontWeight: 700,
              border: `1px solid ${status.color}30`,
            }}>
              {STATUS_LABELS[task.status] || task.status}
            </span>

           
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full
                ${isOverdue
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                <Calendar size={11} />
                {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                {isOverdue && <AlertCircle size={11} />}
              </span>
            )}
          </div>

          
          {task.assignedTo && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User size={15} className="text-primary-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Assigned to</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Avatar
                    src={task.assignedTo.avatarUrl}
                    alt={task.assignedTo.fullName || task.assignedTo.username}
                    size="sm"
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    {task.assignedTo.fullName || task.assignedTo.username}
                  </span>
                </div>
              </div>
            </div>
          )}
          {task.description ? (
            <div>
              <h3 className="text-sm font-700 text-gray-700 mb-2 flex items-center gap-2">
                <Tag size={14} className="text-gray-400" /> Description
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">
                {task.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No description provided.</p>
          )}

          {/* ── Timestamps ── */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              Created {format(new Date(task.createdAt), 'MMM dd, yyyy')}
            </span>
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                Updated {format(new Date(task.updatedAt), 'MMM dd, h:mm a')}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-700 text-gray-700 mb-3 flex items-center gap-2">
              <MessageSquare size={14} className="text-gray-400" />
              Comments
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-semibold">
                {comments.length}
              </span>
            </h3>
            <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No comments yet. Be the first!</p>
                </div>
              ) : comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar
                    src={comment.user?.avatarUrl}
                    alt={comment.user?.fullName || comment.user?.username}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-700 text-gray-800">
                          {comment.user?.fullName || comment.user?.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(comment.createdAt), 'MMM dd, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none transition-all
                  focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
              <Button
                type="submit"
                loading={submitting}
                disabled={!newComment.trim()}
              >
                Post
              </Button>
            </form>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {isAdmin ? (
              <Button
                variant="danger"
                onClick={handleDeleteTask}
                loading={deleting}
              >
                <Trash2 size={14} /> Delete Task
              </Button>
            ) : (
              <div /> 
            )}

            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default TaskDetailModal