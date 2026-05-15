import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from './Layout'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && user && !roles.includes(user.rol)) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', marginTop: '4rem', color: '#2d3e50' }}>
          <h2>No autorizado</h2>
          <p>No tenés permisos para acceder a esta página.</p>
        </div>
      </Layout>
    )
  }

  return <Layout>{children}</Layout>
}
