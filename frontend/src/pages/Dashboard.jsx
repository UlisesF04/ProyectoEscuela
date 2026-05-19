import { Box, Flex, Text, SimpleGrid, Card, Badge, VStack } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import StaggerContainer from '../components/StaggerContainer'

export default function Dashboard() {
  const { user } = useAuth()

  // Redirect by role (RN-08)
  if (user?.rol === 'docente') return <Navigate to="/teacher" replace />
  if (user?.rol === 'tutor') return <Navigate to="/parent" replace />
  if (user?.rol === 'preceptor') return <Navigate to="/absences/register" replace />

  const roleLabels = {
    admin: 'Administrador',
    docente: 'Docente',
    tutor: 'Tutor / Padre',
    preceptor: 'Preceptor',
  }

  return (
    <Box maxW="container-max" mx="auto">
      {/* Welcome */}
      <Card.Root
        bg="bg.card"
        borderRadius="xl"
        shadow="card"
        p={8}
        mb={6}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          right="-32px"
          top="-32px"
          w="140px"
          h="140px"
          borderRadius="full"
          bg="linear-gradient(135deg, {colors.primary-container}, {colors.secondary-container})"
          opacity={0.08}
        />
        <Box position="relative" zIndex={1}>
          <Text textStyle="heading-xl" color="fg" mb={1}>
            ¡Bienvenido, {user?.email?.split('@')[0] || 'Usuario'}!
          </Text>
          <Text textStyle="body-lg" color="fg.muted">
            {roleLabels[user?.rol] || user?.rol} · ProyectoEscuela
          </Text>
          <Badge
            mt={3}
            borderRadius="full"
            px={3}
            py={1}
            colorPalette="orange"
            textTransform="capitalize"
          >
            {user?.rol}
          </Badge>
        </Box>
      </Card.Root>

      {/* Quick access by role */}
      <Text textStyle="heading-md" color="fg" mb={4}>Acceso Rápido</Text>
      <StaggerContainer>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
          {getQuickLinks(user?.rol).map((link) => (
            <StaggerContainer.Item key={link.path}>
              <Card.Root
            key={link.path}
            as="a"
            href={link.path}
            bg="bg.card"
            borderRadius="xl"
            shadow="card"
            p={6}
            _hover={{ shadow: 'card-hover', transform: 'translateY(-2px)', textDecor: 'none' }}
            transition="all 0.2s"
          >
            <Flex align="center" gap={3} mb={2}>
              <Box w={10} h={10} borderRadius="full" bg="surface-container-low" display="flex" alignItems="center" justifyContent="center">
                <Box as="span" className="material-symbols-outlined" color="primary" fontSize="22px">{link.icon}</Box>
              </Box>
              <Text fontWeight="semibold" color="fg">{link.label}</Text>
            </Flex>
            <Text textStyle="body-md" color="fg.muted">{link.desc}</Text>
          </Card.Root>
            </StaggerContainer.Item>
          ))}
        </SimpleGrid>
      </StaggerContainer>
    </Box>
  )
}

function getQuickLinks(rol) {
  const common = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard', desc: 'Panel principal' },
  ]
  const byRole = {
    admin: [
      { label: 'Inasistencias', path: '/absences/register', icon: 'event_busy', desc: 'Registrar inasistencias' },
      { label: 'Panel Docente', path: '/teacher', icon: 'badge', desc: 'Ver dashboard del docente' },
      { label: 'Portal Padres', path: '/parent', icon: 'family_history', desc: 'Vista como padre' },
    ],
    docente: [
      { label: 'Cargar Notas', path: '/grades/entry', icon: 'edit_note', desc: 'Ingresar calificaciones' },
      { label: 'Mis Tareas', path: '/tasks', icon: 'assignment', desc: 'Gestionar trabajos prácticos' },
      { label: 'Mensajería', path: '/inbox', icon: 'chat', desc: 'Comunicarte con padres' },
    ],
    tutor: [
      { label: 'Mis Hijos', path: '/parent', icon: 'family_history', desc: 'Resumen académico' },
      { label: 'Mensajería', path: '/inbox', icon: 'chat', desc: 'Contactar a la escuela' },
      { label: 'Certificados', path: '/certificates', icon: 'description', desc: 'Subir certificados' },
    ],
    preceptor: [
      { label: 'Inasistencias', path: '/absences/register', icon: 'event_busy', desc: 'Registrar ausencias' },
      { label: 'Certificados', path: '/certificates', icon: 'description', desc: 'Revisar certificados' },
    ],
  }
  return [...common, ...(byRole[rol] || byRole.admin)]
}
