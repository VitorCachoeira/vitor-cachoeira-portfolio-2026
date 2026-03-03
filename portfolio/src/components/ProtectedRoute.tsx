import { isAuthenticated } from '../services/api'

type NavigateFunction = (path: string) => void

export function ProtectedRoute({ 
  children, 
  navigate 
}: { 
  children: React.ReactNode
  navigate?: NavigateFunction
}) {
  const handleNavigate = navigate || ((path: string) => {
    window.location.href = path
  })

  if (!isAuthenticated()) {
    handleNavigate('/admin')
    return null
  }
  return <>{children}</>
}

