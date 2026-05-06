import React from 'react';
import {
  Box,
  Button,
  Flex,
  Field,
  Heading,
  Input
} from '@chakra-ui/react';

export default function Login() {
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
      >
        <Heading size="lg" color="#f4f8f9" textAlign="center" mb={2}>
          Iniciar sesión
        </Heading>

        <Field.Root>
          <Field.Label fontWeight={500} color="#f4f8f9">Usuario</Field.Label>
          <Input
            type="text"
            placeholder="Usuario"
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
            focusBorderColor="#1976d2"
            borderColor="#90bfe8"
            bg="white"
            _placeholder={{ color: '#999' }}
          />
        </Field.Root>

        <Button mt={4} colorScheme="blue" type="submit" fontWeight={600} fontSize="md" bg="#1976d2" _hover={{ bg: '#1565c0' }}>
          Ingresar
        </Button>
      </Box>
    </Flex>
  );
}