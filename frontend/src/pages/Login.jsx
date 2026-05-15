import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Field, Flex, Heading, Input } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Flex
      minH="100vh"
      w="100vw"
      align="center"
      justify="center"
      bg="#f4f8f9"
    >
      <Box
        as="form"
        bg="#2d3e50"
        p={8}
        rounded="xl"
        boxShadow="0 4px 16px rgba(0,0,80,0.10)"
        w={{ base: '90vw', sm: '380px' }}
        display="flex"
        flexDirection="column"
        gap={4}
        onSubmit={handleSubmit}
      >
        <Heading size="2xl" textAlign="center" mb={1}>
          🏫
        </Heading>
        <Heading size="lg" color="#f4f8f9" textAlign="center" mb={2}>
          Iniciar sesión
        </Heading>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Box bg="#fef2f2" color="#b91c1c" px={4} py={2} rounded="md" fontSize="sm" textAlign="center">
                {error}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        <Field.Root>
          <Field.Label fontWeight={500} color="#f4f8f9">Email</Field.Label>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            focusBorderColor="#1976d2"
            borderColor="#90bfe8"
            bg="white"
            _placeholder={{ color: '#999' }}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label fontWeight={500} color="#f4f8f9">Contraseña</Field.Label>
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            focusBorderColor="#1976d2"
            borderColor="#90bfe8"
            bg="white"
            _placeholder={{ color: '#999' }}
          />
        </Field.Root>

        <Button
          mt={4}
          type="submit"
          fontWeight={600}
          fontSize="md"
          bg="#1976d2"
          color="white"
          _hover={{ bg: '#1565c0', transform: 'translateY(-1px)' }}
          _active={{ transform: 'translateY(0)' }}
          loading={isLoading}
          loadingText="Ingresando..."
        >
          Ingresar
        </Button>
      </Box>
    </Flex>
  )
}
