import React, { useEffect, useState } from 'react'
import { Calendar, Clock, FolderOpen, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import { projectService } from '../services/projectService'

const CalendarPage = () => {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks/my-tasks'),
        projectService.getAll()
      ])
      setTasks(tasksRes.data.filter(t => t.dueDate))
      setProjects(projectsRes.filter(p => p.dueDate))
    } catch (error) {
      console.error('Failed to load calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get days in current month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDay = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    const dayTasks = tasks.filter(t => {
      const taskDate = new Date(t.dueDate).toISOString().split('T')[0]
      return taskDate === dateStr
    })

    const dayProjects = projects.filter(p => {
      if (!p.dueDate) return false
      const projectDate = new Date(p.dueDate).toISOString().split('T')[0]
      return projectDate === dateStr
    })

    return { tasks: dayTasks, projects: dayProjects }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const today = new Date()

  // Upcoming deadlines - next 7 days
  const upcomingTasks = tasks
    .filter(t => {
      const due = new Date(t.dueDate)
      const diff = (due - today) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 7
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < today && t.status !== 'DONE')

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
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-2">Track your task and project deadlines</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Clock className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Due This Week</p>
            <p className="text-2xl font-bold text-gray-900">{upcomingTasks.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Overdue Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{overdueTasks.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Deadlines</p>
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first day offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const events = getEventsForDay(day)
              const isToday =
                today.getDate() === day &&
                today.getMonth() === currentDate.getMonth() &&
                today.getFullYear() === currentDate.getFullYear()
              const hasEvents = events.tasks.length > 0 || events.projects.length > 0

              return (
                <div
                  key={day}
                  className={`h-16 rounded-lg p-1 border transition-all ${
                    isToday
                      ? 'border-primary-500 bg-primary-50'
                      : hasEvents
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-transparent'
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 ${
                    isToday ? 'text-primary-600' : 'text-gray-700'
                  }`}>
                    {day}
                  </p>

                  {/* Task dots */}
                  {events.tasks.slice(0, 2).map((task, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-1 rounded truncate mb-0.5 ${
                        task.status === 'DONE'
                          ? 'bg-green-100 text-green-700'
                          : new Date(task.dueDate) < today
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}

                  {/* Project dots */}
                  {events.projects.slice(0, 1).map((project, idx) => (
                    <div
                      key={idx}
                      className="text-xs px-1 rounded truncate bg-purple-100 text-purple-700"
                      title={project.name}
                    >
                      📁 {project.name}
                    </div>
                  ))}

                  {/* More indicator */}
                  {(events.tasks.length + events.projects.length) > 2 && (
                    <div className="text-xs text-gray-400">
                      +{events.tasks.length + events.projects.length - 2} more
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-100"></div>
              <span className="text-xs text-gray-600">Task Due</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-100"></div>
              <span className="text-xs text-gray-600">Overdue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-100"></div>
              <span className="text-xs text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-purple-100"></div>
              <span className="text-xs text-gray-600">Project</span>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines Sidebar */}
        <div className="space-y-4">

          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <AlertCircle size={16} />
                Overdue ({overdueTasks.length})
              </h3>
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="font-medium text-gray-900 text-sm truncate">{task.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                      <Clock size={12} />
                      <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <FolderOpen size={12} />
                      <span>{task.project?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming This Week */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Due This Week
            </h3>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming deadlines</p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="p-3 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm truncate">{task.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                      <Clock size={12} />
                      <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <FolderOpen size={12} />
                      <span>{task.project?.name}</span>
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default CalendarPage