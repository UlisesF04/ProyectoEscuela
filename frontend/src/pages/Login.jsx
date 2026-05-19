import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Flex, Text, Button, Input, VStack, Field, Alert } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'

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
      const userData = await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Box minH="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box
        w="full"
        maxW="5xl"
        display="flex"
        flexDir={{ base: 'column', md: 'row' }}
        gap={{ base: 4, md: 8 }}
        alignItems="stretch"
      >
        {/* Left — Visual branding (hidden on mobile) */}
        <Box
          display={{ base: 'none', md: 'flex' }}
          flex={1}
          borderRadius="card"
          bg="surface-container-low"
          overflow="hidden"
          position="relative"
          flexDir="column"
          justifyContent="space-between"
          p={8}
          border="1px solid"
          borderColor="border.default"
          shadow="warm-ambient"
        >
          <Box position="absolute" inset={0} zIndex={0}>
            <Box
              position="absolute"
              inset={0}
              css={{ background: 'linear-gradient(135deg, {colors.primary-container}, {colors.secondary-container})' }}
              opacity={0.06}
            />
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              h="60%"
              bg="linear-gradient(to top, {colors.surface}, transparent)"
            />
          </Box>
          <Box position="relative" zIndex={1} mt="auto" pb={8}>
            <Text
              textStyle="heading-xl"
              color="fg"
              mb={4}
              as="h2"
            >
              Transformando la<br />gestión escolar.
            </Text>
            <Text textStyle="body-lg" color="fg.muted" maxW="md">
              Una experiencia intuitiva y cálida para educadores, estudiantes y familias.
            </Text>
          </Box>
        </Box>

        {/* Right — Login card */}
        <Box
          flex={1}
          w="full"
          maxW="md"
          mx="auto"
          bg="bg.card"
          borderRadius="card"
          shadow="warm-ambient"
          p={{ base: 6, md: 10 }}
          border="1px solid"
          borderColor="border.default"
          display="flex"
          flexDir="column"
          justifyContent="center"
        >
          {/* Logo */}
          <VStack mb={8} textAlign="center" gap={3}>
            <Flex
              w={14}
              h={14}
              borderRadius="full"
              bg="linear-gradient(135deg, {colors.primary-container}, {colors.secondary-container})"
              color="white"
              align="center"
              justify="center"
              fontSize="2xl"
              fontWeight="bold"
              boxShadow="warm-glow"
            >
              <Box as="span" className="material-symbols-outlined" fontSize="28px" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </Box>
            </Flex>
            <Text textStyle="heading-lg" color="fg">
              ProyectoEscuela
            </Text>
            <Text textStyle="body-md" color="fg.muted">Bienvenido de vuelta</Text>
          </VStack>

          {/* Error alert */}
          <AnimatePresence>
            {error && (
              <Box
                as={motion.div}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                mb={4}
              >
                <Alert.Root status="error" borderRadius="full" p={3}>
                  <Alert.Indicator />
                  <Alert.Title textStyle="label-md">{error}</Alert.Title>
                </Alert.Root>
              </Box>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <VStack gap={5}>
              <Field.Root>
                <Field.Label textStyle="label-md" color="fg">Correo Electrónico</Field.Label>
                <Box position="relative" w="full">
                  <Box
                    as="span"
                    className="material-symbols-outlined"
                    position="absolute"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    color="outline"
                    fontSize="20px"
                  >
                    mail
                  </Box>
                  <Input
                    pl={12}
                    pr={4}
                    py={3}
                    borderRadius="input"
                    border="1px solid"
                    borderColor="border.default"
                    bg="bg.subtle"
                    placeholder="usuario@escuela.edu"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    _focus={{ ring: 2, ringColor: 'primary-container/50', borderColor: 'primary-container' }}
                  />
                </Box>
              </Field.Root>

              <Field.Root>
                <Field.Label textStyle="label-md" color="fg">Contraseña</Field.Label>
                <Box position="relative" w="full">
                  <Box
                    as="span"
                    className="material-symbols-outlined"
                    position="absolute"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    color="outline"
                    fontSize="20px"
                  >
                    lock
                  </Box>
                  <Input
                    pl={12}
                    pr={4}
                    py={3}
                    borderRadius="input"
                    border="1px solid"
                    borderColor="border.default"
                    bg="bg.subtle"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    _focus={{ ring: 2, ringColor: 'primary-container/50', borderColor: 'primary-container' }}
                  />
                </Box>
              </Field.Root>

              <Box w="full" textAlign="right">
                <Text
                  as="a"
                  href="#"
                  textStyle="label-md"
                  color="tertiary"
                  _hover={{ color: 'primary' }}
                >
                  ¿Olvidé mi contraseña?
                </Text>
              </Box>

              <Button
                type="submit"
                w="full"
                borderRadius="full"
                py={4}
                h="auto"
                bg="linear-gradient(135deg, {colors.primary-container}, {colors.secondary-container})"
                color="white"
                fontWeight="semibold"
                _hover={{ transform: 'scale(1.02)', boxShadow: 'warm-glow' }}
                _active={{ transform: 'scale(0.98)' }}
                loading={isLoading}
                loadingText="Ingresando..."
              >
                Iniciar Sesión
              </Button>
            </VStack>
          </form>

          <Box mt={8} pt={6} borderTop="1px solid" borderColor="border.default" textAlign="center">
            <Text textStyle="body-md" color="fg.muted" mb={4}>¿Necesitás ayuda para acceder?</Text>
            <Button
              variant="outline"
              borderRadius="full"
              borderColor="primary-container"
              color="primary-container"
              _hover={{ bg: 'primary-container', color: 'white' }}
            >
              Contactar Soporte
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
