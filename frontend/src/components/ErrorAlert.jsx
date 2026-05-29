import { useToast } from '@chakra-ui/react';
import { useEffect } from 'react';

const ERROR_MESSAGES = {
  401: 'Su sesión ha expirado. Inicie sesión nuevamente.',
  403: 'No tiene permisos para realizar esta acción.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'El recurso ya existe o está en un estado inválido.',
  429: 'Demasiadas solicitudes. Espere un momento e intente nuevamente.',
  500: 'Error del servidor. Intente nuevamente más tarde.',
};

export default function ErrorAlert({ error, onRetry }) {
  const toast = useToast();

  useEffect(() => {
    if (!error) return;

    const status = error?.response?.status || error?.status || 500;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      ERROR_MESSAGES[status] ||
      ERROR_MESSAGES[500];

    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
      ...(onRetry && {
        action: {
          label: 'Reintentar',
          onClick: onRetry,
        },
      }),
    });
  }, [error, toast, onRetry]);

  return null;
}
