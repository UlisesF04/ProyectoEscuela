import { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  Text,
  Button,
  Icon,
  Avatar,
  HStack,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiChevronLeft, FiChevronRight, FiUser } from 'react-icons/fi';

const roleColors = {
  admin: { label: 'Administrador', color: 'red.400', bg: 'red.900' },
  preceptor: { label: 'Preceptor/a', color: 'orange.400', bg: 'orange.900' },
  docente: { label: 'Docente', color: 'blue.400', bg: 'blue.900' },
  padre: { label: 'Padre/Madre', color: 'green.400', bg: 'green.900' },
};

export default function DashboardLayout({ sections }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const [collapsed, setCollapsed] = useState(false);

  const roleInfo = roleColors[user?.role] || { label: 'Usuario', color: 'gray.400', bg: 'gray.900' };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || null;

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <Box
        w={collapsed ? '72px' : '260px'}
        bg="#1a1f2e"
        color="white"
        transition="width 200ms ease-out"
        display="flex"
        flexDirection="column"
        position="fixed"
        h="100vh"
        zIndex={100}
      >
        {/* User info */}
        <VStack p={collapsed ? 3 : 4} spacing={3} align={collapsed ? 'center' : 'flex-start'}>
          <HStack spacing={3} w="full">
            <Avatar
              size="sm"
              name={`${user?.first_name} ${user?.last_name}`}
              bg={roleInfo.color}
            />
            {!collapsed && (
              <Box flex={1} minW={0}>
                <Text fontSize="sm" fontWeight="semibold" isTruncated>
                  {user?.first_name} {user?.last_name}
                </Text>
                <Badge colorScheme={roleInfo.color.split('.')[0]} fontSize="xs" variant="subtle">
                  {roleInfo.label}
                </Badge>
              </Box>
            )}
          </HStack>
        </VStack>

        <Divider borderColor="whiteAlpha.200" />

        {/* Navigation items */}
        <VStack flex={1} p={2} spacing={1} align="stretch" overflowY="auto">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <Button
                key={section.id}
                variant="ghost"
                justifyContent={collapsed ? 'center' : 'flex-start'}
                leftIcon={section.icon ? <Icon as={section.icon} boxSize={5} /> : undefined}
                onClick={() => setActiveSection(section.id)}
                bg={isActive ? 'whiteAlpha.200' : 'transparent'}
                color={isActive ? 'white' : 'whiteAlpha.700'}
                _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                _active={{ transform: 'scale(0.97)' }}
                transition="all 160ms ease-out"
                h={10}
                px={collapsed ? 0 : 3}
                fontSize="sm"
                title={collapsed ? section.label : ''}
              >
                {collapsed ? null : section.label}
              </Button>
            );
          })}
        </VStack>

        <Divider borderColor="whiteAlpha.200" />

        {/* Bottom actions */}
        <VStack p={2} spacing={1}>
          <Button
            variant="ghost"
            justifyContent={collapsed ? 'center' : 'flex-start'}
            leftIcon={<Icon as={FiLogOut} boxSize={5} />}
            onClick={handleLogout}
            color="whiteAlpha.600"
            _hover={{ bg: 'red.500', color: 'white' }}
            _active={{ transform: 'scale(0.97)' }}
            transition="all 160ms ease-out"
            w="full"
            h={10}
            px={collapsed ? 0 : 3}
            fontSize="sm"
            title={collapsed ? 'Cerrar sesión' : ''}
          >
            {collapsed ? null : 'Cerrar sesión'}
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => setCollapsed(!collapsed)}
            color="whiteAlpha.500"
            _hover={{ color: 'white' }}
            _active={{ transform: 'scale(0.97)' }}
            transition="all 160ms ease-out"
            w="full"
          >
            <Icon as={collapsed ? FiChevronRight : FiChevronLeft} />
          </Button>
        </VStack>
      </Box>

      {/* Main content */}
      <Box
        ml={collapsed ? '72px' : '260px'}
        flex={1}
        transition="margin-left 200ms ease-out"
        minH="100vh"
      >
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <Flex h="100vh" align="center" justify="center" color="gray.400">
            <Text>Seleccioná una opción del menú lateral</Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
}
