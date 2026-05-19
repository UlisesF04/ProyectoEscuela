import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* CHANGE-009: Inasistencias */}
      <Route path="/absences/register" element={<ProtectedRoute roles={['admin', 'docente', 'preceptor']}><AbsenceRegister /></ProtectedRoute>} />
      <Route path="/absences/student/:id" element={<ProtectedRoute roles={['admin', 'docente', 'tutor', 'preceptor']}><AbsenceHistory /></ProtectedRoute>} />

      {/* CHANGE-010: Calificaciones */}
      <Route path="/grades/entry" element={<ProtectedRoute roles={['admin', 'docente']}><GradeEntry /></ProtectedRoute>} />
      <Route path="/grades/overview" element={<ProtectedRoute roles={['admin', 'docente', 'tutor']}><GradeOverview /></ProtectedRoute>} />

      {/* CHANGE-011: Tareas */}
      <Route path="/tasks" element={<ProtectedRoute roles={['admin', 'docente', 'tutor']}><TaskManager /></ProtectedRoute>} />
      <Route path="/tasks/:id/tracking" element={<ProtectedRoute roles={['admin', 'docente']}><TaskTracking /></ProtectedRoute>} />

      {/* CHANGE-012: Dashboard Docente */}
      <Route path="/teacher" element={<ProtectedRoute roles={['admin', 'docente']}><TeacherDashboard /></ProtectedRoute>} />

      {/* CHANGE-013: Portal Padres */}
      <Route path="/parent" element={<ProtectedRoute roles={['admin', 'tutor']}><ParentDashboard /></ProtectedRoute>} />

      {/* CHANGE-022: Mensajería */}
      <Route path="/inbox" element={<ProtectedRoute roles={['admin', 'docente', 'tutor', 'preceptor']}><InboxPage /></ProtectedRoute>} />
      <Route path="/inbox/:conversationId" element={<ProtectedRoute roles={['admin', 'docente', 'tutor', 'preceptor']}><InboxPage /></ProtectedRoute>} />

      {/* CHANGE-020: Tablero Analítico */}
      <Route path="/analytics" element={<ProtectedRoute roles={['admin', 'docente', 'tutor', 'preceptor']}><AnalyticsDashboard /></ProtectedRoute>} />

      {/* CHANGE-024: Certificados */}
      <Route path="/certificates" element={<ProtectedRoute roles={['admin', 'tutor', 'preceptor']}><CertificatePage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
