import React, { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import { taskService } from '../../services/taskService'
import { projectService } from '../../services/projectService'
import { useTaskStore } from '../../store/taskStore'
import toast from 'react-hot-toast'

const CreateTaskModal = ({ isOpen, onClose, projectId, initialStatus = 'TODO', onSuccess }) => {
  const { addTask } = useTaskStore()
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState([])  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    status: initialStatus,
    assignedTo: '' 
  })
  const [errors, setErrors] = useState({})
  useEffect(() => {
    if (isOpen && projectId) {
      loadMembers()
    }
  }, [isOpen, projectId])

  const loadMembers = async () => {
    try {
      const projectMembers = await projectService.getMembers(projectId)
      setMembers(projectMembers)
    } catch (error) {
      console.error('Failed to load members:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required'
    }
    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Please assign this task to a team member'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const task = await taskService.create(projectId, {
        ...formData,
        assignedTo: parseInt(formData.assignedTo)
      })
      addTask(task)
      toast.success('Task created and assigned successfully!')
      onClose()
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        status: initialStatus,
        assignedTo: ''
      })
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">

        <Input
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Enter task title e.g. Build Login Page"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add more details about this task..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        {/* ✅ Assign To Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To <span className="text-red-500">*</span>
          </label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${
              errors.assignedTo ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">-- Select team member --</option>
            {members.length === 0 ? (
              <option disabled>No members in this project yet</option>
            ) : (
              members.map((member) => (
                <option key={member.id} value={member.user?.id || member.userId}>
                  {member.user?.fullName} ({member.user?.email})
                </option>
              ))
            )}
          </select>
          {errors.assignedTo && (
            <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>
          )}
          {members.length === 0 && (
            <p className="text-orange-500 text-xs mt-1">
              ⚠️ No members assigned to this project yet. Add members first before creating tasks.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <Input
            label="Due Date"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create & Assign Task
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateTaskModal