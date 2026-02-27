import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { projectService } from '../services/projectService'
import { taskService } from '../services/taskService'

const Dashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const projects = await projectService.getAll()
      setRecentProjects(projects.slice(0, 4))
      
      // Calculate stats (this is mock data - adjust based on your API)
      setStats({
        totalProjects: projects.length,
        totalTasks: 45,
        completedTasks: 28,
        pendingTasks: 17,
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: BarChart3,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: Clock,
      color: 'bg-purple-500',
      change: '+8%',
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: 'bg-green-500',
      change: '+23%',
    },
    {
      title: 'Pending',
      value: stats.pendingTasks,
      icon: AlertCircle,
      color: 'bg-orange-500',
      change: '-5%',
    },
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
          Welcome back, {user?.fullName || user?.username}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your projects today.</p>
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
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-green-500 font-medium">{stat.change}</span>
                <span className="text-gray-600 ml-2">from last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
          <Link to="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects yet. Create your first project to get started!</p>
            <Link to="/projects">
              <button className="mt-4 btn-primary">
                Create Project
              </button>
            </Link>
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
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  </div>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color || '#6366f1' }}
                  ></span>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Clock size={14} className="mr-1" />
                  <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Create New Project</h3>
          <p className="text-primary-100 text-sm mb-4">Start organizing your tasks with a new project</p>
          <button className="bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors">
            Get Started
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Invite Team Members</h3>
          <p className="text-purple-100 text-sm mb-4">Collaborate with your team on projects</p>
          <button className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors">
            Invite Now
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">View Analytics</h3>
          <p className="text-green-100 text-sm mb-4">Track your productivity and progress</p>
          <button className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
            View Stats
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
