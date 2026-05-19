import { Box, Flex, Text, Button, IconButton } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const { user, logout } = useAuth()

  return (
    <Flex minH="100vh" bg="bg">
      <Sidebar />
      <Box
        as="main"
        flex={1}
        ml={{ base: 0, md: '260px' }}
        minH="100vh"
        display="flex"
        flexDir="column"
      >
        {/* Top header */}
        <Flex
          as="header"
          h="64px"
          align="center"
          justify="space-between"
          px={6}
          borderBottom="1px solid"
          borderColor="border.default"
          bg="bg.card"
        >
          <Text
            display={{ base: 'block', md: 'none' }}
            textStyle="heading-md"
            color="fg"
          >
            ProyectoEscuela
          </Text>
          <Box flex={1} />
          <Flex align="center" gap={4}>
            <Text textStyle="label-md" color="fg.muted" display={{ base: 'none', sm: 'block' }}>
              {user?.email}
            </Text>
            <Button
              size="sm"
              variant="ghost"
              borderRadius="full"
              color="fg.muted"
              _hover={{ bg: 'error-container', color: 'on-error-container' }}
              onClick={logout}
            >
              <Box as="span" className="material-symbols-outlined" fontSize="18px" mr={1}>
                logout
              </Box>
              <Text display={{ base: 'none', sm: 'inline' }}>Salir</Text>
            </Button>
          </Flex>
        </Flex>

        {/* Page content */}
        <Box flex={1} p={6} overflow="auto">
          {children}
        </Box>
      </Box>
    </Flex>
  )
}
