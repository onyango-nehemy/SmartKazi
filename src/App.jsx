import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import TaskBoard from './pages/TaskBoard'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import Settings from './pages/Settings'
import CalendarPage from './pages/CalendarPage'
import TeamPage from './pages/TeamPage'
import UserSettings from './pages/UserSettings'
import ProjectOverview from './pages/ProjectOverview'

// Layouts
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token)
  return token ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace /> // ← fixed path
  return children
}

const RoleBasedRedirect = () => {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* ✅ User Routes - NO admin routes here */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/board" element={<TaskBoard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="settings" element={<UserSettings />} />
          
        </Route>

        {/* ✅ Admin Routes - ALL admin pages here with AdminLayout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="overview" element={<ProjectOverview/>}/>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<RoleBasedRedirect />} />

      </Routes>
    </Router>
  )
}

export default App