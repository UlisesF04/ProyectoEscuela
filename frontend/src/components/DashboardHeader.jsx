import {
  Box,
  Flex,
  Heading,
  Button,
  Badge,
  Text,
  Avatar,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabels = {
  admin: { label: 'Administrador', color: 'red' },
  preceptor: { label: 'Preceptor/a', color: 'orange' },
  docente: { label: 'Docente', color: 'blue' },
  padre: { label: 'Padre/Madre', color: 'green' },
};

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const roleInfo = roleLabels[user?.role] || { label: 'Usuario', color: 'gray' };

  return (
    <Box
      bg="linear-gradient(135deg, #2d3e50 0%, #1a2332 100%)"
      color="white"
      px={6}
      py={4}
      boxShadow="0 2px 8px rgba(0,0,0,0.15)"
    >
      <Flex justify="space-between" align="center" w="100%">
        {/* Left side - User info */}
        <HStack spacing={4} flex={1}>
          <Avatar
            size="md"
            name={`${user?.first_name} ${user?.last_name}`}
            bg="blue.500"
          />
          <VStack align="flex-start" spacing={0}>
            <Heading size="sm">
              {user?.first_name} {user?.last_name}
            </Heading>
            <Text fontSize="xs" color="gray.300">
              {user?.email}
            </Text>
          </VStack>
        </HStack>

        {/* Center - Role display */}
        <Flex justify="center" flex={1}>
          <Badge colorScheme={roleInfo.color} px={3} py={1} borderRadius="full">
            {roleInfo.label}
          </Badge>
        </Flex>

        {/* Right side - Logout button */}
        <Flex justify="flex-end" flex={1}>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={handleLogout}
            _hover={{ bg: 'red.500', color: 'white' }}
          >
            Cerrar sesión
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
