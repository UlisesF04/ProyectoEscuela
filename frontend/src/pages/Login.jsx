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
  Input,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, error, loading, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const roleMap = {
    admin: '/admin',
    preceptor: '/preceptor',
    docente: '/docente',
    padre: '/padre',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(roleMap[user?.role] || '/login', { replace: true });
    } catch {
      // error is already handled in AuthContext
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
      bg="#f4f8f9"
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="#2d3e50"
        p={8}
        rounded="xl"
        boxShadow="0 4px 16px rgba(0,0,80,0.10)"
        w={{ base: '90vw', sm: '380px' }}
        display="flex"
        flexDirection="column"
        gap={4}
      >
        <Heading size="lg" color="#f4f8f9" textAlign="center" mb={2}>
          Iniciar sesión
        </Heading>

        {error && (
          <Alert status="error" borderRadius="md" colorScheme="red">
            <AlertIcon />
            <AlertTitle mr={2}>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormControl>
          <FormLabel fontWeight={500} color="#f4f8f9">
            Correo electrónico
          </FormLabel>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="correo@ejemplo.com"
            focusBorderColor="#1976d2"
            borderColor="#90bfe8"
            bg="white"
            _placeholder={{ color: '#999' }}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontWeight={500} color="#f4f8f9">
            Contraseña
          </FormLabel>
          <Input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Contraseña"
            focusBorderColor="#1976d2"
            borderColor="#90bfe8"
            bg="white"
            _placeholder={{ color: '#999' }}
          />
        </FormControl>

        <Button
          mt={4}
          colorScheme="blue"
          type="submit"
          fontWeight={600}
          fontSize="md"
          bg="#1976d2"
          _hover={{ bg: '#1565c0' }}
          isLoading={loading}
          loadingText="Ingresando..."
          isDisabled={loading}
        >
          Ingresar
        </Button>
      </Box>
    </Flex>
  );
}
