import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Flex, Text, VStack, IconButton, Button, Separator } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Inasistencias', path: '/absences/register', icon: 'event_busy' },
    { label: 'Calificaciones', path: '/grades/overview', icon: 'grade' },
    { label: 'Tareas', path: '/tasks', icon: 'assignment' },
    { label: 'Docentes', path: '/teacher', icon: 'badge' },
    { label: 'Portal Padres', path: '/parent', icon: 'family_history' },
    { label: 'Mensajería', path: '/inbox', icon: 'chat' },
    { label: 'Certificados', path: '/certificates', icon: 'description' },
    { label: 'Analítica', path: '/analytics', icon: 'analytics' },
  ],
  docente: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Inasistencias', path: '/absences/register', icon: 'event_busy' },
    { label: 'Cargar Notas', path: '/grades/entry', icon: 'edit_note' },
    { label: 'Tareas', path: '/tasks', icon: 'assignment' },
    { label: 'Mi Panel', path: '/teacher', icon: 'badge' },
    { label: 'Mensajería', path: '/inbox', icon: 'chat' },
    { label: 'Analítica', path: '/analytics', icon: 'analytics' },
  ],
  tutor: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Mis Hijos', path: '/parent', icon: 'family_history' },
    { label: 'Calificaciones', path: '/grades/overview', icon: 'grade' },
    { label: 'Tareas', path: '/tasks', icon: 'assignment' },
    { label: 'Mensajería', path: '/inbox', icon: 'chat' },
    { label: 'Certificados', path: '/certificates', icon: 'description' },
    { label: 'Analítica', path: '/analytics', icon: 'analytics' },
  ],
  preceptor: [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Inasistencias', path: '/absences/register', icon: 'event_busy' },
    { label: 'Certificados', path: '/certificates', icon: 'description' },
    { label: 'Mensajería', path: '/inbox', icon: 'chat' },
    { label: 'Analítica', path: '/analytics', icon: 'analytics' },
  ],
}

function NavIcon({ icon }) {
  return (
    <Box as="span" className="material-symbols-outlined" fontSize="20px" lineHeight="1">
      {icon}
    </Box>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const role = user?.rol || 'admin'
  const items = NAV_ITEMS[role] || NAV_ITEMS.admin

  return (
    <Box
      as="aside"
      w={collapsed ? '72px' : '260px'}
      bg="bg.sidebar"
      borderRight="1px solid"
      borderColor="border.default"
      minH="100vh"
      display="flex"
      flexDir="column"
      transition="width 0.2s ease-in-out"
      position="fixed"
      left={0}
      top={0}
      zIndex={100}
      shadow="warm-ambient"
    >
      {/* Logo */}
      <Flex
        h="64px"
        align="center"
        justify={collapsed ? 'center' : 'flex-start'}
        px={collapsed ? 0 : 5}
        gap={2}
        borderBottom="1px solid"
        borderColor="border.default"
      >
        <Box
          w={8}
          h={8}
          borderRadius="lg"
          bg="linear-gradient(135deg, {colors.primary-container}, {colors.secondary-container})"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          fontSize="sm"
          fontWeight="bold"
          flexShrink={0}
        >
          PE
        </Box>
        {!collapsed && (
          <Text textStyle="heading-md" color="fg" truncate>
            ProyectoEscuela
          </Text>
        )}
      </Flex>

      {/* Navigation */}
      <VStack as="nav" flex={1} p={3} gap={1} overflowY="auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          return (
            <Button
              key={item.path}
              variant="ghost"
              justifyContent={collapsed ? 'center' : 'flex-start'}
              w="full"
              h="auto"
              minH="44px"
              px={collapsed ? 2 : 4}
              py={2.5}
              borderRadius="full"
              color={isActive ? 'on-secondary-container' : 'fg'}
              bg={isActive ? 'secondary-container' : 'transparent'}
              fontWeight={isActive ? 'bold' : 'normal'}
              boxShadow={isActive ? 'inset 4px 0 0 {colors.primary}' : 'none'}
              transform={isActive ? 'translateX(4px)' : 'none'}
              transition="all 0.2s ease-in-out"
              _hover={{ bg: isActive ? 'secondary-container' : 'surface-variant' }}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
            >
              <NavIcon icon={item.icon} />
              {!collapsed && <Text>{item.label}</Text>}
            </Button>
          )
        })}
      </VStack>

      {/* Bottom section */}
      <VStack p={3} gap={1} borderTop="1px solid" borderColor="border.default">
        {!collapsed && user && (
          <Text textStyle="label-md" color="fg.muted" px={2} py={1} truncate>
            {user.email}
          </Text>
        )}
        <Button
          variant="ghost"
          justifyContent={collapsed ? 'center' : 'flex-start'}
          w="full"
          h="auto"
          minH="44px"
          px={collapsed ? 2 : 4}
          py={2.5}
          borderRadius="full"
          color="fg.muted"
          _hover={{ bg: 'error-container', color: 'on-error-container' }}
          onClick={logout}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <NavIcon icon="logout" />
          {!collapsed && <Text>Cerrar sesión</Text>}
        </Button>
      </VStack>

      {/* Collapse toggle */}
      <IconButton
        aria-label="Toggle sidebar"
        position="absolute"
        right="-12px"
        top="50%"
        transform="translateY(-50%)"
        size="sm"
        borderRadius="full"
        bg="bg.card"
        shadow="warm-ambient"
        border="1px solid"
        borderColor="border.default"
        onClick={() => setCollapsed(!collapsed)}
        _hover={{ bg: 'surface-container' }}
      >
        <Box
          as="span"
          className="material-symbols-outlined"
          fontSize="16px"
          transform={collapsed ? 'rotate(180deg)' : 'none'}
          transition="transform 0.2s"
        >
          chevron_left
        </Box>
      </IconButton>
    </Box>
  )
}
