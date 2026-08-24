import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps a page and enforces access rules:
 * - Must be logged in
 * - If requireApproved, the pastor must have approved the account
 * - If requireAdmin, the user's profile role must be 'admin'
 */
export default function ProtectedRoute({ children, requireApproved = true, requireAdmin = false }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="page-loading">Inapakia…</div>

  if (!user) return <Navigate to="/login" replace />

  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  if (requireApproved && !requireAdmin && profile?.status !== 'approved') {
    return <Navigate to="/pending-approval" replace />
  }

  return children
}
