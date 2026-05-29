import { Box, Heading, Text, Button, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="surface"
      px={6}
    >
      <Text
        fontSize="8xl"
        fontWeight={700}
        color="primary"
        lineHeight={1}
        mb={4}
        fontFamily="heading"
      >
        404
      </Text>
      <Heading as="h1" size="lg" color="onSurface" mb={2}>
        Página no encontrada
      </Heading>
      <Text color="onSurfaceVariant" mb={8} textAlign="center">
        La página que buscás no existe o fue movida.
      </Text>
      <Button
        leftIcon={<Icon as={FiHome} />}
        onClick={() => navigate('/')}
        size="lg"
      >
        Volver al inicio
      </Button>
    </Box>
  );
}
