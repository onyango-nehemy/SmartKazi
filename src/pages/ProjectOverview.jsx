import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, CheckCircle2, Clock, AlertCircle, TrendingUp, FolderOpen } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { projectService } from '../services/projectService'
import api from '../services/api'

const ProjectOverview = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [myTasks, setMyTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [projects, tasksRes] = await Promise.all([
        projectService.getAll(),
        api.get('/tasks/my-tasks')
      ])

      const tasks = tasksRes.data

      setRecentProjects(projects.slice(0, 4))
      setMyTasks(tasks.slice(0, 5)) // show latest 5 tasks

      // Real stats
      setStats({
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'DONE').length,
        pendingTasks: tasks.filter(t => t.status !== 'DONE').length,
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      TODO: 'bg-gray-100 text-gray-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      IN_REVIEW: 'bg-yellow-100 text-yellow-700',
      DONE: 'bg-green-100 text-green-700',
    }
    const labels = {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      IN_REVIEW: 'In Review',
      DONE: 'Done',
    }
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.TODO}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const styles = {
      LOW: 'bg-gray-100 text-gray-600',
      MEDIUM: 'bg-blue-100 text-blue-600',
      HIGH: 'bg-orange-100 text-orange-600',
      URGENT: 'bg-red-100 text-red-600',
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority] || styles.MEDIUM}`}>
        {priority}
      </span>
    )
  }

  const statCards = [
    { title: 'My Projects', value: stats.totalProjects, icon: BarChart3, color: 'bg-blue-500' },
    { title: 'Total Tasks', value: stats.totalTasks, icon: Clock, color: 'bg-purple-500' },
    { title: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'bg-green-500' },
    { title: 'Pending', value: stats.pendingTasks, icon: AlertCircle, color: 'bg-orange-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName || user?.username} 
        </h1>
        <p className="text-gray-600 mt-2">Here's an overview of your tasks and projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              {/* Progress bar */}
              {stat.title === 'Completed' && stats.totalTasks > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* My Tasks Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
          <span className="text-sm text-gray-500">{myTasks.length} recent tasks</span>
        </div>

        {myTasks.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle2 size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tasks assigned to you yet.</p>
            <p className="text-gray-400 text-sm mt-1">Tasks assigned by your admin will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-medium text-gray-900 truncate ${
                      task.status === 'DONE' ? 'line-through text-gray-400' : ''
                    }`}>
                      {task.title}
                    </p>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FolderOpen size={12} />
                      {task.project?.name || 'Unknown Project'}
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {getStatusBadge(task.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
          <Link to="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-10">
            <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No projects assigned yet.</p>
            <p className="text-gray-400 text-sm mt-1">Projects assigned by your admin will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                  </div>
                  <span
                    className="w-3 h-3 rounded-full ml-2 mt-1 flex-shrink-0"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  ></span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {project.tasks?.length || 0} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    {project.members?.length || 0} members
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default ProjectOverview