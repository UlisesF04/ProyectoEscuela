import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AbsenceRegister from './pages/AbsenceRegister'
import AbsenceHistory from './pages/AbsenceHistory'
import GradeEntry from './pages/GradeEntry'
import GradeOverview from './pages/GradeOverview'
import TaskManager from './pages/TaskManager'
import TaskTracking from './pages/TaskTracking'
import TeacherDashboard from './pages/TeacherDashboard'
import ParentDashboard from './pages/ParentDashboard'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import InboxPage from './pages/InboxPage'
import CertificatePage from './pages/CertificatePage'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const P = (children) => <PageTransition>{children}</PageTransition>

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : P(<Login />)} />

        <Route path="/dashboard" element={<ProtectedRoute>{P(<Dashboard />)}</ProtectedRoute>} />

        {/* CHANGE-009: Inasistencias — solo admin, preceptor */}
        <Route path="/absences/register" element={<ProtectedRoute roles={['admin', 'preceptor']}>{P(<AbsenceRegister />)}</ProtectedRoute>} />
        <Route path="/absences/student/:id" element={<ProtectedRoute roles={['admin', 'preceptor']}>{P(<AbsenceHistory />)}</ProtectedRoute>} />

        {/* CHANGE-010: Calificaciones — solo admin, docente */}
        <Route path="/grades/entry" element={<ProtectedRoute roles={['admin', 'docente']}>{P(<GradeEntry />)}</ProtectedRoute>} />
        <Route path="/grades/overview" element={<ProtectedRoute roles={['admin', 'docente']}>{P(<GradeOverview />)}</ProtectedRoute>} />

        {/* CHANGE-011: Tareas — solo admin, docente */}
        <Route path="/tasks" element={<ProtectedRoute roles={['admin', 'docente']}>{P(<TaskManager />)}</ProtectedRoute>} />
        <Route path="/tasks/:id/tracking" element={<ProtectedRoute roles={['admin', 'docente']}>{P(<TaskTracking />)}</ProtectedRoute>} />

        {/* CHANGE-012: Dashboard Docente */}
        <Route path="/teacher" element={<ProtectedRoute roles={['admin', 'docente']}>{P(<TeacherDashboard />)}</ProtectedRoute>} />

        {/* CHANGE-013: Portal Padres */}
        <Route path="/parent" element={<ProtectedRoute roles={['admin', 'tutor']}>{P(<ParentDashboard />)}</ProtectedRoute>} />

        {/* CHANGE-022: Mensajería */}
        <Route path="/inbox" element={<ProtectedRoute roles={['admin', 'docente', 'tutor', 'preceptor']}>{P(<InboxPage />)}</ProtectedRoute>} />
        <Route path="/inbox/:conversationId" element={<ProtectedRoute roles={['admin', 'docente', 'tutor', 'preceptor']}>{P(<InboxPage />)}</ProtectedRoute>} />

        {/* CHANGE-020: Tablero Analítico */}
        <Route path="/analytics" element={<ProtectedRoute roles={['admin', 'docente', 'tutor', 'preceptor']}>{P(<AnalyticsDashboard />)}</ProtectedRoute>} />

        {/* CHANGE-024: Certificados */}
        <Route path="/certificates" element={<ProtectedRoute roles={['admin', 'tutor', 'preceptor']}>{P(<CertificatePage />)}</ProtectedRoute>} />

        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  // Global 403 handler: dispatched from api.js interceptor
  useEffect(() => {
    const handler = (e) => window.alert(`⛔ Acceso denegado: ${e.detail.message}`)
    window.addEventListener('api:forbidden', handler)
    return () => window.removeEventListener('api:forbidden', handler)
  }, [])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
