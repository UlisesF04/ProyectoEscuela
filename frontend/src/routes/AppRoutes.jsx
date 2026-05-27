import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import ProtectedRoute from './ProtectedRoute';
import DashboardHeader from '../components/DashboardHeader';
import AdminDashboard from '../pages/AdminDashboard';
import PreceptorDashboard from '../pages/PreceptorDashboard';
import DocenteDashboard from '../pages/DocenteDashboard';

function DashboardRedirect({ user }) {
  const roleMap = {
    admin: '/admin',
    preceptor: '/preceptor',
    docente: '/docente',
    padre: '/padre',
  };
  return <Navigate to={roleMap[user?.role] || '/login'} replace />;
}

function DashboardPlaceholder({ title }) {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <DashboardHeader />
      <VStack p={8} align="flex-start" spacing={4}>
        <Heading>{title}</Heading>
        <Text>Bienvenido al sistema de gestión académica</Text>
      </VStack>
    </Box>
  );
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
            <DashboardPlaceholder title="Portal para Padres" />
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
