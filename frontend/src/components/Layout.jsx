import { Box, Flex, Button, Text } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()

  return (
    <Box minH="100vh" bg="#f4f8f9">
      <Flex
        as="header"
        bg="#2d3e50"
        color="white"
        px={6}
        py={4}
        align="center"
        justify="space-between"
      >
        <Text fontSize="lg" fontWeight="bold">
          ProyectoEscuela
        </Text>
        <Flex align="center" gap={4}>
          <Text fontSize="sm">{user?.email}</Text>
          <Button
            size="sm"
            variant="outline"
            color="white"
            borderColor="white"
            _hover={{ bg: 'white', color: '#2d3e50' }}
            onClick={logout}
          >
            Cerrar sesión
          </Button>
        </Flex>
      </Flex>
      <Box as="main" p={6}>
        {children}
      </Box>
    </Box>
  )
}
