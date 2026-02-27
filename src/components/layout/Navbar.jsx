import React from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search, Menu } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Avatar from '../common/Avatar'
import Dropdown from '../common/Dropdown'
import { LogOut, User, Settings } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SK</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">SmartKazi</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search projects, tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <Dropdown
              trigger={
                <button className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 transition-colors">
                  <Avatar 
                    src={user?.avatarUrl} 
                    alt={user?.fullName || user?.username} 
                    size="sm"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.fullName || user?.username}
                  </span>
                </button>
              }
            >
              <Dropdown.Item icon={<User size={16} />}>
                <Link to="/profile">Profile</Link>
              </Dropdown.Item>
              <Dropdown.Item icon={<Settings size={16} />}>
                Settings
              </Dropdown.Item>
              <div className="border-t border-gray-200 my-1"></div>
              <Dropdown.Item 
                icon={<LogOut size={16} />} 
                onClick={handleLogout}
                danger
              >
                Logout
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
