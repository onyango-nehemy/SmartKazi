import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Calendar, Users, Settings, Shield } from 'lucide-react'
import CreateProjectModal from '../project/CreateProjectModal'

const AdminSidebar = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/admin/overview', icon: Calendar, label: 'Projects Overview' },
    { path: '/admin/team', icon: Users, label: 'Team' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 hidden lg:block">

      {/* Admin Badge */}
      <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
        <Shield size={16} className="text-red-500" />
        <span className="text-red-600 text-sm font-medium">Admin Panel</span>
      </div>

      {/* Nav Links */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      
      <div className="p-4 border-t border-gray-200 absolute bottom-0 w-full">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + New Project
        </button>
      </div>

  
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => setShowCreateModal(false)}
      />

    </aside>
  )
}

export default AdminSidebar