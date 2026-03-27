import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, CheckCircle2, Clock, AlertCircle, TrendingUp,
  UserPlus, Shield, Users, Activity, FolderOpen,
  ArrowRight, Zap
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { projectService } from '../services/projectService'
import api from '../services/api'
import AssignUsersModal from '../components/project/AssignUsersModal'
import CreateProjectModal from '../components/project/CreateProjectModal'

const AdminDashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalUsers: 0,
    activeUsers: 0,
  })
  const [recentProjects, setRecentProjects] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [projects, usersRes] = await Promise.all([
        projectService.getAll(),
        api.get('/users')
      ])

      const allTasks = projects.flatMap(p => p.tasks || [])
      const completedTasks = allTasks.filter(t => t.status === 'DONE').length
      const pendingTasks = allTasks.filter(t => t.status !== 'DONE').length
      const activeUsers = usersRes.data.users.filter(u => u.isActive).length

      setAllProjects(projects)
      setRecentProjects(projects.slice(0, 4))
      setUsers(usersRes.data.users.slice(0, 5))

      setStats({
        totalProjects: projects.length,
        totalTasks: allTasks.length,
        completedTasks,
        pendingTasks,
        totalUsers: usersRes.data.users.length,
        activeUsers,
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = () => {
    setShowCreateModal(false)
    loadDashboardData()
  }

  const handleAssignClose = () => {
    setSelectedProject(null)
    loadDashboardData()
  }

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  const getProjectCompletion = (project) => {
    const tasks = project.tasks || []
    if (tasks.length === 0) return 0
    const done = tasks.filter(t => t.status === 'DONE').length
    return Math.round((done / tasks.length) * 100)
  }

  const getProjectHealthColor = (percent) => {
    if (percent >= 75) return 'bg-green-500'
    if (percent >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getUserTaskCount = (userId) => {
    return allProjects
      .flatMap(p => p.tasks || [])
      .filter(t => t.assignedTo === userId).length
  }

  const getUserCompletedCount = (userId) => {
    return allProjects
      .flatMap(p => p.tasks || [])
      .filter(t => t.assignedTo === userId && t.status === 'DONE').length
  }

  // Generate recent activity from projects and tasks
  const getRecentActivity = () => {
    const activities = []
    allProjects.forEach(project => {
      activities.push({
        id: `project-${project.id}`,
        type: 'project',
        text: `Project "${project.name}" was created`,
        time: project.createdAt,
        color: 'bg-blue-500'
      })
      project.tasks?.forEach(task => {
        if (task.status === 'DONE') {
          activities.push({
            id: `task-${task.id}`,
            type: 'task',
            text: `Task "${task.title}" was completed`,
            time: task.createdAt,
            color: 'bg-green-500'
          })
        } else if (task.status === 'IN_PROGRESS') {
          activities.push({
            id: `task-progress-${task.id}`,
            type: 'task',
            text: `Task "${task.title}" is in progress`,
            time: task.createdAt,
            color: 'bg-yellow-500'
          })
        }
      })
    })
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 6)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ✅ System Overview Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Shield size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.fullName || user?.username}! 👋
              </h1>
              <p className="text-red-100 mt-1">SmartKazi Admin Panel — Full system access active</p>
            </div>
          </div>

          {/* System Health */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-red-100 text-xs">Total Users</p>
            </div>
            <div className="w-px h-10 bg-white bg-opacity-30" />
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
              <p className="text-red-100 text-xs">Active Users</p>
            </div>
            <div className="w-px h-10 bg-white bg-opacity-30" />
            <div className="text-center">
              <p className="text-2xl font-bold">{completionRate}%</p>
              <p className="text-red-100 text-xs">Completion Rate</p>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-red-100 mb-1">
            <span>Overall Task Completion</span>
            <span>{stats.completedTasks} of {stats.totalTasks} tasks done</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Projects', value: stats.totalProjects, icon: BarChart3, color: 'bg-blue-500', sub: `${allProjects.length} active` },
          { title: 'Total Tasks', value: stats.totalTasks, icon: Clock, color: 'bg-purple-500', sub: `${stats.pendingTasks} pending` },
          { title: 'Completed Tasks', value: stats.completedTasks, icon: CheckCircle2, color: 'bg-green-500', sub: `${completionRate}% rate` },
          { title: 'Team Members', value: stats.totalUsers, icon: Users, color: 'bg-orange-500', sub: `${stats.activeUsers} active` },
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-sm`}>
                  <Icon className="text-white" size={22} />
                </div>
              </div>
              {stat.title === 'Completed Tasks' && stats.totalTasks > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Middle Row - Project Health + User Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ✅ Project Health with Progress Bars */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen size={20} className="text-primary-600" />
              Project Health
            </h2>
            <Link
              to="/admin/projects"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {allProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No projects yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 text-primary-600 text-sm hover:text-primary-700 font-medium"
              >
                + Create first project
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {allProjects.slice(0, 5).map(project => {
                const completion = getProjectCompletion(project)
                const healthColor = getProjectHealthColor(completion)
                const taskCount = project.tasks?.length || 0
                const doneCount = project.tasks?.filter(t => t.status === 'DONE').length || 0

                return (
                  <div key={project.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color || '#6366f1' }}
                        />
                        <Link
                          to={`/admin/projects/${project.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate max-w-[160px]"
                        >
                          {project.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{doneCount}/{taskCount} tasks</span>
                        <span className="text-xs font-semibold text-gray-700">{completion}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${healthColor} h-2 rounded-full transition-all`}
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ✅ User Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-purple-600" />
              User Overview
            </h2>
            <Link
              to="/admin/settings"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No users yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(u => {
                const taskCount = getUserTaskCount(u.id)
                const completedCount = getUserCompletedCount(u.id)
                const userCompletion = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0

                return (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {u.fullName?.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.fullName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full"
                            style={{ width: `${userCompletion}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {completedCount}/{taskCount}
                        </span>
                      </div>
                    </div>

                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      u.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row - Recent Projects + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <Link to="/admin/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-3">No projects yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors"
              >
                + Create Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color || '#6366f1' }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
                      <p className="text-xs text-gray-400">{project.members?.length || 0} members · {project.tasks?.length || 0} tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-primary-50 border border-primary-200 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors"
                    >
                      <UserPlus size={12} />
                      Assign
                    </button>
                    <Link
                      to={`/admin/projects/${project.id}`}
                      className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <Activity size={20} className="text-green-600" />
            Recent Activity
          </h2>

          {getRecentActivity().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getRecentActivity().map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-1">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(activity.time).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Team Members */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-lg">
            <Users size={20} />
          </div>
          <h3 className="text-lg font-semibold">Assign Team Members</h3>
        </div>
        <p className="text-purple-100 text-sm mb-4">
          Add users to your projects and build your team.
        </p>
        {recentProjects.length === 0 ? (
          <button
            disabled
            className="bg-white text-purple-300 px-4 py-2 rounded-lg cursor-not-allowed font-medium text-sm"
          >
            No Projects Yet
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-purple-200 text-xs">Select a project to assign members:</p>
            <div className="flex flex-wrap gap-2">
              {recentProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors text-xs font-medium"
                >
                  {project.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleProjectCreated}
      />

      {/* Assign Users Modal */}
      {selectedProject && (
        <AssignUsersModal
          project={selectedProject}
          onClose={handleAssignClose}
        />
      )}

    </div>
  )
}

export default AdminDashboard