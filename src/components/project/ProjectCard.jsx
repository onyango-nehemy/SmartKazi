import React from 'react'
import { Link } from 'react-router-dom'
import { MoreVertical, Users, Calendar, Kanban } from 'lucide-react'
import { format } from 'date-fns'
import Avatar from '../common/Avatar'
import Dropdown from '../common/Dropdown'

const ProjectCard = ({ project, onUpdate }) => {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      // Delete logic here
      onUpdate()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      {/* Color Bar */}
      <div 
        className="h-2" 
        style={{ backgroundColor: project.color || '#6366f1' }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link 
              to={`/projects/${project.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            >
              {project.name}
            </Link>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {project.description || 'No description'}
            </p>
          </div>
          
          <Dropdown
            trigger={
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreVertical size={20} />
              </button>
            }
          >
            <Dropdown.Item>
              <Link to={`/projects/${project.id}`}>View Details</Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <Link to={`/projects/${project.id}/board`}>Open Board</Link>
            </Dropdown.Item>
            <Dropdown.Item>Edit Project</Dropdown.Item>
            <Dropdown.Item onClick={handleDelete} danger>
              Delete Project
            </Dropdown.Item>
          </Dropdown>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Kanban size={16} className="mr-1" />
            <span>12 tasks</span>
          </div>
          <div className="flex items-center">
            <Users size={16} className="mr-1" />
            <span>3 members</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex -space-x-2">
            {/* Mock members - replace with actual data */}
            <Avatar size="sm" alt="Member 1" className="border-2 border-white" />
            <Avatar size="sm" alt="Member 2" className="border-2 border-white" />
            <Avatar size="sm" alt="Member 3" className="border-2 border-white" />
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={14} className="mr-1" />
            <span>{format(new Date(project.createdAt), 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
            ${project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : ''}
            ${project.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' : ''}
          `}>
            {project.status}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard
