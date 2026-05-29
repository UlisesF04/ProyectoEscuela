import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import ProtectedRoute from './ProtectedRoute';
import AdminDashboard from '../pages/AdminDashboard';
import PreceptorDashboard from '../pages/PreceptorDashboard';
import DocenteDashboard from '../pages/DocenteDashboard';
import PadreDashboard from '../pages/PadreDashboard';

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
  const { user, token } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <DashboardRedirect user={user} /> : <Login />}
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/preceptor"
        element={
          <ProtectedRoute requiredRoles={['preceptor', 'admin']}>
            <PreceptorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/docente"
        element={
          <ProtectedRoute requiredRoles={['docente']}>
            <DocenteDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/padre"
        element={
          <ProtectedRoute requiredRoles={['padre']}>
            <PadreDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <Box p={8}>
            <Heading>Acceso no autorizado</Heading>
            <Text>No tienes permisos para acceder a esta sección</Text>
          </Box>
        }
      />

      <Route
        path="/"
        element={
          token ? <DashboardRedirect user={user} /> : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
