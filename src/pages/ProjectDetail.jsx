import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, Kanban, BarChart3 } from 'lucide-react'
import { projectService } from '../services/projectService'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import Button from '../components/common/Button'
import Avatar from '../components/common/Avatar'
import AssignUsersModal from '../components/project/AssignUsersModal'
import toast from 'react-hot-toast'

const ProjectDetail = () => {
  const { id } = useParams()
  const { currentProject, setCurrentProject } = useProjectStore()
  const { user } = useAuthStore()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false) // ← modal state

  useEffect(() => {
    loadProjectDetails()
  }, [id])

  const loadProjectDetails = async () => {
    setLoading(true)
    try {
      const [project, projectMembers] = await Promise.all([
        projectService.getById(id),
        projectService.getMembers(id)
      ])
      setCurrentProject(project)
      setMembers(projectMembers)
    } catch (error) {
      toast.error('Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

  // Refresh members after modal closes
  const handleModalClose = async () => {
    setShowAssignModal(false)
    try {
      const updatedMembers = await projectService.getMembers(id)
      setMembers(updatedMembers)
    } catch (error) {
      console.error('Failed to refresh members')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Link to="/projects">
          <Button variant="secondary" className="mt-4">Back to Projects</Button>
        </Link>
      </div>
    )
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="space-y-6">

      {/* Back Button */}
      <Link
        to={isAdmin ? "/admin/projects" : "/projects"}
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: currentProject.color || '#6366f1' }}
              />
              <h1 className="text-3xl font-bold text-gray-900">{currentProject.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                ${currentProject.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                ${currentProject.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : ''}
                ${currentProject.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' : ''}
              `}>
                {currentProject.status}
              </span>
            </div>
            <p className="text-gray-600 mt-2">{currentProject.description}</p>
          </div>
          <Link to={`${isAdmin ? '/admin' : ''}/projects/${id}/board`}>
            <Button icon={<Kanban size={20} />}>Open Board</Button>
          </Link>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Kanban className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{currentProject.tasks?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentProject.tasks?.filter(t => t.status === 'DONE').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users size={20} />
            Team Members
          </h2>

          {/* ✅ Only Admin sees Assign Users button */}
          {isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAssignModal(true)}
            >
              + Assign Users
            </Button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No members assigned yet.</p>
            {isAdmin && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Assign users to this project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <Avatar src={member.user?.avatarUrl} alt={member.user?.fullName} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.user?.fullName}</p>
                  <p className="text-sm text-gray-500">{member.user?.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
            <div>
              <p className="text-gray-900">
                <span className="font-medium">John Doe</span> created task "Design homepage"
              </p>
              <p className="text-gray-500 text-xs">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-gray-900">
                <span className="font-medium">Jane Smith</span> completed task "API Integration"
              </p>
              <p className="text-gray-500 text-xs">5 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Assign Users Modal */}
      {showAssignModal && currentProject && (
        <AssignUsersModal
          project={currentProject}
          onClose={handleModalClose}
        />
      )}

    </div>
  )
}

export default ProjectDetail