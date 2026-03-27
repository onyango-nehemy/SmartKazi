import React, { useEffect, useState } from 'react'
import { Users, CheckCircle2, Clock, AlertCircle, FolderOpen } from 'lucide-react'
import api from '../services/api'
import { projectService } from '../services/projectService'
import toast from 'react-hot-toast'

const TeamPage = () => {
  const [teamData, setTeamData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      const projects = await projectService.getAll()

      
      const memberMap = {}

      projects.forEach(project => {
        project.members?.forEach(member => {
          const u = member.user
          if (!u) return

          if (!memberMap[u.id]) {
            memberMap[u.id] = {
              id: u.id,
              fullName: u.fullName,
              email: u.email,
              role: u.role,
              projects: [],
              tasks: []
            }
          }

          // Add project if not already added
          if (!memberMap[u.id].projects.find(p => p.id === project.id)) {
            memberMap[u.id].projects.push({
              id: project.id,
              name: project.name,
              color: project.color
            })
          }

          // Add tasks assigned to this member in this project
          project.tasks?.forEach(task => {
            if (task.assignedTo === u.id) {
              memberMap[u.id].tasks.push(task)
            }
          })
        })
      })

      setTeamData(Object.values(memberMap))
    } catch (error) {
      toast.error('Failed to load team data')
    } finally {
      setLoading(false)
    }
  }

  const getTaskStats = (tasks) => {
    const total = tasks.length
    const done = tasks.filter(t => t.status === 'DONE').length
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const overdue = tasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
    ).length
    const completion = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, inProgress, overdue, completion }
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
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.TODO}`}>
        {labels[status] || status}
      </span>
    )
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

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Progress</h1>
        <p className="text-gray-600 mt-2">Track your teammates' tasks and progress</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Team Members</p>
            <p className="text-2xl font-bold text-gray-900">{teamData.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Tasks Completed</p>
            <p className="text-2xl font-bold text-gray-900">
              {teamData.reduce((acc, m) => acc + m.tasks.filter(t => t.status === 'DONE').length, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="text-orange-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Overdue Tasks</p>
            <p className="text-2xl font-bold text-gray-900">
              {teamData.reduce((acc, m) => acc + getTaskStats(m.tasks).overdue, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Team Members */}
      {teamData.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No team members found.</p>
          <p className="text-gray-400 text-sm mt-1">You are not assigned to any projects yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {teamData.map((member) => {
            const stats = getTaskStats(member.tasks)
            return (
              <div key={member.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">

                {/* Member Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
                        {member.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{member.fullName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            member.role === 'ADMIN'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        {/* Projects */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {member.projects.map(p => (
                            <span
                              key={p.id}
                              className="flex items-center gap-1 text-xs text-gray-500"
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: p.color || '#6366f1' }}
                              />
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-green-600">{stats.done}</p>
                        <p className="text-xs text-gray-500">Done</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
                        <p className="text-xs text-gray-500">In Progress</p>
                      </div>
                      {stats.overdue > 0 && (
                        <div>
                          <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
                          <p className="text-xs text-gray-500">Overdue</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {stats.total > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Completion</span>
                        <span>{stats.completion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${stats.completion}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Member Tasks */}
                {member.tasks.length > 0 && (
                  <div className="p-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Assigned Tasks ({member.tasks.length})
                    </h4>
                    <div className="space-y-2">
                      {member.tasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <FolderOpen size={12} />
                                {task.project?.name || 'Unknown'}
                              </span>
                              {task.dueDate && (
                                <span className={`flex items-center gap-1 text-xs ${
                                  new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                                    ? 'text-red-600'
                                    : 'text-gray-500'
                                }`}>
                                  <Clock size={12} />
                                  {new Date(task.dueDate).toLocaleDateString()}
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
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default TeamPage