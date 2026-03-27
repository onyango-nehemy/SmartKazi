import React, { useEffect, useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { projectService } from '../services/projectService'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import Button from '../components/common/Button'
import ProjectCard from '../components/project/ProjectCard'
import CreateProjectModal from '../components/project/CreateProjectModal'
import toast from 'react-hot-toast'

const Projects = () => {
  const { projects, setProjects, setLoading } = useProjectStore()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const data = await projectService.getAll()
      setProjects(data)
    } catch (error) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

const filteredProjects = projects.filter(project => {
  const matchesSearch = 
    (project.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  const matchesFilter = filterStatus === 'all' || project.status === filterStatus
  return matchesSearch && matchesFilter
})

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">
            {isAdmin ? 'Manage and track all your projects' : 'Your assigned projects'}
          </p>
        </div>
        {isAdmin && (
          <Button
            icon={<Plus size={20} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Project
          </Button>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : isAdmin
                  ? 'Get started by creating your first project'
                  : 'You have not been assigned to any projects yet'
              }
            </p>
            {!searchQuery && isAdmin && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Create Your First Project
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={loadProjects}
              isAdmin={isAdmin}  
            />
          ))}
        </div>
      )}
      {isAdmin && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={loadProjects}
        />
      )}

    </div>
  )
}

export default Projects