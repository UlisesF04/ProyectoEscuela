import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, error, loading, clearError } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const roleMap = {
    admin: '/admin',
    preceptor: '/preceptor',
    docente: '/docente',
    padre: '/padre',
  };

  const emailError = touched.email && !email.trim();
  const passwordError = touched.password && !password.trim();
  const isValid = email.trim() && password.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email.trim() || !password.trim()) return;
    try {
      const user = await login(email, password);
      const target = roleMap[user?.role] || '/login';
      navigate(target, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || '';
      if (status === 429) {
        toast({
          title: 'Demasiados intentos',
          description: 'Espere unos minutos e intente nuevamente',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      }
      if (msg.toLowerCase().includes('desactivada') || msg.toLowerCase().includes('inactiva')) {
        toast({
          title: 'Cuenta desactivada',
          description: 'Su cuenta ha sido desactivada. Contacte al administrador.',
          status: 'error',
          duration: 6000,
          isClosable: true,
          position: 'top-right',
        });
      }
    }
  };

  const handleEmailChange = (e) => {
    if (error) clearError();
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    if (error) clearError();
    setPassword(e.target.value);
  };

  return (
    <Flex
      minH="100vh"
      w="100vw"
      align="center"
      justify="center"
      position="relative"
      overflow="hidden"
      sx={{
        background: 'linear-gradient(-135deg, #2D1B08 0%, #5C3A21 35%, #FF6B35 70%, #F7C59F 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
      }}
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        className="glass-panel"
        p={10}
        w={{ base: '90vw', sm: '420px' }}
        maxW="450px"
        animation="fadeSlideIn 500ms ease-out"
        sx={{
          '@starting-style': {
            opacity: 0,
            transform: 'translateY(6px)',
          },
        }}
      >
        <VStack spacing={6}>
          <Flex
            w="72px"
            h="72px"
            borderRadius="full"
            bg="primary"
            align="center"
            justify="center"
            boxShadow="warmMd"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
            </svg>
          </Flex>

          <Heading size="lg" color="onSurface" textAlign="center" fontFamily="heading">
            Iniciar sesión
          </Heading>

          {error && !error.toLowerCase().includes('desactivada') && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          )}

          <FormControl isInvalid={emailError}>
            <FormLabel fontWeight={500} color="onSurface">
              Correo electrónico
            </FormLabel>
            <InputGroup>
              <Input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                placeholder="correo@ejemplo.com"
                focusBorderColor="primary"
                bg="white"
                _placeholder={{ color: 'onSurfaceVariant' }}
              />
              <InputRightElement>
                <Icon as={FiMail} color="onSurfaceVariant" opacity={0.5} fontSize="md" />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl isInvalid={passwordError}>
            <FormLabel fontWeight={500} color="onSurface">
              Contraseña
            </FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                placeholder="Contraseña"
                focusBorderColor="primary"
                bg="white"
                _placeholder={{ color: 'onSurfaceVariant' }}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  icon={showPassword ? <FiEyeOff /> : <FiEye />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  color="onSurfaceVariant"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            w="full"
            size="lg"
            fontSize="md"
            fontWeight={600}
            isLoading={loading}
            loadingText="Ingresando..."
            isDisabled={loading || !isValid}
            _active={{
              transform: 'scale(0.97)',
            }}
            transition="transform 160ms ease-out"
          >
            Iniciar Sesión
          </Button>

          <Text fontSize="sm" color="onSurfaceVariant" textAlign="center">
            ¿Necesitás ayuda? Contactá al administrador del sistema
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
