import React, { useEffect, useState } from 'react'
import { X, UserPlus, UserMinus, Search, Loader } from 'lucide-react'
import { projectService } from '../../services/projectService'
import api from '../../services/api'
import toast from 'react-hot-toast'

const AssignUsersModal = ({ project, onClose }) => {
  const [allUsers, setAllUsers] = useState([])
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log("=== LOADING MODAL DATA ===")
      
      const [usersRes, membersRes] = await Promise.all([
        api.get('/auth/users'), 
        projectService.getMembers(project.id)
      ])

      console.log("Users:", usersRes.data)
      console.log("Members:", membersRes)

      setAllUsers(usersRes.data)
      setMembers(membersRes)
    } catch (error) {
      console.log("Error:", error.response?.data || error.message)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const isMember = (userId) => members.some(m => m.userId === userId || m.user?.id === userId)

  const handleAdd = async (userId) => {
    setActionLoading(userId)
    try {
      await projectService.addMember(project.id, userId)
      const updatedMembers = await projectService.getMembers(project.id)
      setMembers(updatedMembers)
      toast.success('User added to project!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (userId) => {
    setActionLoading(userId)
    try {
      await projectService.removeMember(project.id, userId)
      const updatedMembers = await projectService.getMembers(project.id)
      setMembers(updatedMembers)
      toast.success('User removed from project!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove user')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = allUsers.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assign Users</h2>
            <p className="text-sm text-gray-500 mt-1">Project: <span className="font-medium text-primary-600">{project.name}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Members Count */}
        <div className="px-6 py-2 bg-gray-50 text-sm text-gray-600">
          <span className="font-medium text-primary-600">{members.length}</span> member{members.length !== 1 ? 's' : ''} assigned to this project
        </div>

        {/* Users List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No users found</p>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const assigned = isMember(user.id)
                const isLoading = actionLoading === user.id
                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      assigned ? 'border-primary-200 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => assigned ? handleRemove(user.id) : handleAdd(user.id)}
                      disabled={isLoading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        assigned
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                      }`}
                    >
                      {isLoading ? (
                        <Loader size={14} className="animate-spin" />
                      ) : assigned ? (
                        <><UserMinus size={14} /> Remove</>
                      ) : (
                        <><UserPlus size={14} /> Assign</>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssignUsersModal