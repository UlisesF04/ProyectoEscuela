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
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          homePath={this.props.homePath || '/admin'}
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({ onRetry, homePath }) {
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
      <Button
        onClick={onRetry}
        colorScheme="brand"
        mr={3}
        _active={{ transform: 'scale(0.97)' }}
        transition="transform 160ms ease-out"
      >
        Reintentar
      </Button>
      <Button
        variant="ghost"
        onClick={() => navigate(homePath)}
        _active={{ transform: 'scale(0.97)' }}
        transition="transform 160ms ease-out"
      >
        Volver al inicio
      </Button>
    </Box>
  );
}
