import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from './organisms/Layout'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && user && !roles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Layout>{children}</Layout>
}
