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


import Layout from './components/layout/Layout'

// Route Protection Component
// Route Protection Component
const PrivateRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token)
  
  // TEMPORARY: Bypass authentication for development

  const isDevelopment = true;
  
  if (isDevelopment) {
    // Set mock user data for preview
    const setAuth = useAuthStore((state) => state.setAuth)
    const user = useAuthStore((state) => state.user)
    
    if (!user) {
      setAuth({
        id: 1,
        username: 'demo_user',
        email: 'demo@smartkazi.com',
        fullName: 'Demo User',
        avatarUrl: null
      }, 'mock-token-for-development')
    }
    
    return children
  }
  
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/board" element={<TaskBoard />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
