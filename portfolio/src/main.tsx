import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AdminLogin } from './components/AdminLogin.tsx'
import { AdminDashboard } from './components/AdminDashboard.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'

// Simple router - checks URL path and renders appropriate component
function Router() {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname)
    }
    
    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', handleLocationChange)
    
    // Custom event for navigation
    const handleNavigate = (e: CustomEvent<string>) => {
      window.history.pushState({}, '', e.detail)
      setPath(e.detail)
    }
    window.addEventListener('navigate' as any, handleNavigate as EventListener)
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('navigate' as any, handleNavigate as EventListener)
    }
  }, [])

  // Navigation helper function
  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath)
    setPath(newPath)
    window.dispatchEvent(new CustomEvent('navigate', { detail: newPath }))
  }

  if (path === '/admin') {
    return <AdminLogin navigate={navigate} />
  } else if (path === '/admin/dashboard') {
    return (
      <ProtectedRoute navigate={navigate}>
        <AdminDashboard navigate={navigate} />
      </ProtectedRoute>
    )
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
