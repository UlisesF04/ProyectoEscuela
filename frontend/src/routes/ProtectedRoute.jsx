import { Navigate, Outlet } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRoles }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
}
