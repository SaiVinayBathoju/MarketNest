import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: 'brand' | 'user'
  guestOnly?: boolean
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  guestOnly = false
}: ProtectedRouteProps) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream">
        <div className="animate-spin w-12 h-12 border-2 border-charcoal/20 border-t-ink rounded-full mb-4" />
        <p className="text-charcoal/60 text-sm">Loading...</p>
      </div>
    )
  }

  if (guestOnly && session) {
    const redirectTo = profile?.role === 'brand' ? '/brand/dashboard' : '/marketplace'
    return <Navigate to={redirectTo} replace />
  }

  if (requireAuth && !session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireRole && profile?.role !== requireRole) {
    const redirectTo = profile?.role === 'brand' ? '/brand/dashboard' : '/marketplace'
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
