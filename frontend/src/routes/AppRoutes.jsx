import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProtectedRoute from './ProtectedRoute';

// Admin
import AdminLayout from '../pages/admin/AdminLayout';
import DashboardOverview from '../pages/admin/DashboardOverview';
import UsersPage from '../pages/admin/UsersPage';
import CoursesPage from '../pages/admin/CoursesPage';
import StudentsPage from '../pages/admin/StudentsPage';
import AssignmentsPage from '../pages/admin/AssignmentsPage';
import LeavesPage from '../pages/admin/LeavesPage';
import NotificationLogsPage from '../pages/admin/NotificationLogsPage';
import ConfigurationPage from '../pages/admin/ConfigurationPage';

// Preceptor
import PreceptorLayout from '../pages/preceptor/PreceptorLayout';
import AttendanceRegisterPage from '../pages/preceptor/AttendanceRegisterPage';
import AttendanceHistoryPage from '../pages/preceptor/AttendanceHistoryPage';
import JustificacionesPage from '../pages/preceptor/JustificacionesPage';
import PreceptorMyLeavesPage from '../pages/preceptor/MyLeavesPage';

// Docente
import DocenteLayout from '../pages/docente/DocenteLayout';
import GradesPage from '../pages/docente/GradesPage';
import StudentEvolutionPage from '../pages/docente/student-evolution-page';

import MyLeavesPage from '../pages/docente/MyLeavesPage';
import ProfileSection from '../pages/docente/ProfileSection';

// Padre
import PadreLayout from '../pages/padre/PadreLayout';
import ChildGradesPage from '../pages/padre/ChildGradesPage';
import ChildAttendancesPage from '../pages/padre/ChildAttendancesPage';
import JustificativosPage from '../pages/padre/JustificativosPage';
import ChildEvolutionPage from '../pages/padre/child-evolution-page';

function DashboardRedirect({ user }) {
  const roleMap = {
    admin: '/admin',
    preceptor: '/preceptor',
    docente: '/docente',
    padre: '/padre',
  };
  return <Navigate to={roleMap[user?.role] || '/login'} replace />;
}

export default function AppRoutes() {
  const { user, token, loading } = useAuth();

  // Mientras restauramos sesión del localStorage, mostramos un spinner
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={token ? <DashboardRedirect user={user} /> : <Login />}
      />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="leaves" element={<LeavesPage />} />
        <Route path="notifications" element={<NotificationLogsPage />} />
        <Route path="config" element={<ConfigurationPage />} />
      </Route>

      {/* Preceptor routes */}
      <Route
        path="/preceptor"
        element={
          <ProtectedRoute requiredRoles={['preceptor', 'admin']}>
            <PreceptorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="attendance/register" replace />} />
        <Route path="attendance/register" element={<AttendanceRegisterPage />} />
        <Route path="attendance/history" element={<AttendanceHistoryPage />} />
        <Route path="justify" element={<JustificacionesPage />} />
        <Route path="leaves" element={<PreceptorMyLeavesPage />} />
      </Route>

      {/* Docente routes */}
      <Route
        path="/docente"
        element={
          <ProtectedRoute requiredRoles={['docente']}>
            <DocenteLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="grades" replace />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="evolution" element={<StudentEvolutionPage />} />
        <Route path="leaves" element={<MyLeavesPage />} />
        <Route path="profile" element={<ProfileSection />} />
      </Route>

      {/* Padre routes */}
      <Route
        path="/padre"
        element={
          <ProtectedRoute requiredRoles={['padre']}>
            <PadreLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="grades" replace />} />
        <Route path="grades" element={<ChildGradesPage />} />
        <Route path="evolution" element={<ChildEvolutionPage />} />
        <Route path="attendances" element={<ChildAttendancesPage />} />
        <Route path="justificativos" element={<JustificativosPage />} />
      </Route>

      {/* Root and catch-all */}
      <Route
        path="/"
        element={
          token ? <DashboardRedirect user={user} /> : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
