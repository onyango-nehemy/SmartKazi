import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import AdminSidebar from './AdminSidebar'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:ml-64 mt-16">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
