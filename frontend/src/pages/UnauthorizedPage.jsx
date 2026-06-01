import {
  Box, Heading, Text, Button, Icon, VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';   
import { FiLock, FiArrowLeft, FiLogOut } from 'react-icons/fi';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const roleMap = {
    admin: '/admin',
    preceptor: '/preceptor',
    docente: '/docente',
    padre: '/padre',
  };

  const handleBack = () => {
    navigate(roleMap[user?.role] || '/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="surface"
      px={6}
    >
      <VStack spacing={6} textAlign="center" maxW="400px">
        <Icon as={FiLock} boxSize={16} color="amber" opacity={0.8} />
        <Box>
          <Heading as="h1" size="lg" color="onSurface" mb={2}>
            Acceso no autorizado
          </Heading>
          <Text color="onSurfaceVariant">
            No tenés permisos para acceder a esta sección.
          </Text>
        </Box>
        <Button
          leftIcon={<Icon as={FiArrowLeft} />}
          onClick={handleBack}
          variant="outline"
        >
          Volver a mi dashboard
        </Button>
        <Button
          leftIcon={<Icon as={FiLogOut} />}
          onClick={handleLogout}
          variant="ghost"
          color="error"
          _hover={{ bg: 'error', color: 'white' }}
        >
          Cerrar sesión
        </Button>
      </VStack>
    </Box>
  );
}
