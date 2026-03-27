import React, { useEffect, useState } from 'react'
import { Shield, User, Users, ChevronDown, CheckCircle, XCircle, Loader } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
  })

  useEffect(() => {
    if (activeTab === 'users') loadUsers()
  }, [activeTab])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data.users)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    setActionLoading(`role-${userId}`)
    try {
      const res = await api.patch(`/users/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ))
      toast.success(res.data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role')
    } finally {
      setActionLoading(null)
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = !currentStatus
    setActionLoading(`status-${userId}`)
    try {
      const res = await api.patch(`/users/${userId}/status`, { isActive: newStatus })
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isActive: newStatus } : u
      ))
      toast.success(res.data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const res = await api.patch('/users/profile', profileData)
      updateUser(res.data.user)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'profile', label: 'My Profile', icon: User },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 p-2 rounded-lg">
          <Shield className="text-gray-600" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage users and your account</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
            <p className="text-sm text-gray-500 mt-1">Manage user roles and account status</p>
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className={`hover:bg-gray-50 ${!u.isActive ? 'opacity-60' : ''}`}>

                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {u.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {u.fullName}
                              {u.id === user?.id && (
                                <span className="ml-2 text-xs text-primary-600 font-normal">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.role === 'ADMIN'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${
                          u.isActive ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {u.isActive
                            ? <><CheckCircle size={14} /> Active</>
                            : <><XCircle size={14} /> Suspended</>
                          }
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        {u.id === user?.id ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {/* Role Toggle */}
                            <button
                              onClick={() => handleRoleToggle(u.id, u.role)}
                              disabled={actionLoading === `role-${u.id}`}
                              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                                u.role === 'ADMIN'
                                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                                  : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              {actionLoading === `role-${u.id}` ? (
                                <Loader size={12} className="animate-spin" />
                              ) : (
                                u.role === 'ADMIN' ? 'Demote' : 'Make Admin'
                              )}
                            </button>

                            {/* Status Toggle */}
                            <button
                              onClick={() => handleStatusToggle(u.id, u.isActive)}
                              disabled={actionLoading === `status-${u.id}`}
                              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                                u.isActive
                                  ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                  : 'border-green-200 text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {actionLoading === `status-${u.id}` ? (
                                <Loader size={12} className="animate-spin" />
                              ) : (
                                u.isActive ? 'Suspend' : 'Activate'
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Update Profile</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                {profileLoading ? (
                  <><Loader size={16} className="animate-spin" /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}

export default Settings