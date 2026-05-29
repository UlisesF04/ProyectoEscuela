import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({ onRetry }) {
  const navigate = useNavigate();

  return (
    <Box
      textAlign="center"
      py={16}
      px={6}
      borderRadius="card"
      bg="containerLow"
    >
      <Heading as="h2" size="lg" color="error" mb={4}>
        Algo salió mal
      </Heading>
      <Text color="onSurfaceVariant" mb={6}>
        Ocurrió un error inesperado. Por favor intentá de nuevo.
      </Text>
      <Button onClick={onRetry} colorScheme="brand" mr={3}>
        Reintentar
      </Button>
      <Button variant="ghost" onClick={() => navigate('/')}>
        Volver al inicio
      </Button>
    </Box>
  );
}
