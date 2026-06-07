import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-semibold text-xs mt-4">Initializing Session...</p>
      </div>
    )
  }

  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect to unauthorized if profile not found or user is inactive
  if (!profile || !profile.isActive) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
