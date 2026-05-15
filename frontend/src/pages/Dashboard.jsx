import { Box, Flex, Heading, Badge } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <Flex
      minH="calc(100vh - 64px)"
      align="center"
      justify="center"
      bg="#f4f8f9"
    >
      <Box textAlign="center">
        <Heading size="xl" color="#2d3e50" mb={4}>
          Bienvenido, {user?.email}
        </Heading>
        <Badge colorPalette="blue" px={3} py={1} fontSize="md">
          {user?.rol}
        </Badge>
      </Box>
    </Flex>
  )
}
