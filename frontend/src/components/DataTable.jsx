import { keyframes } from '@emotion/react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  HStack,
  Text,
  Skeleton,
  Stack,
  Box,
  Icon,
} from '@chakra-ui/react';

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const rowStyles = {
  _hover: { bg: 'gray.100', transition: 'background-color 160ms ease-out' },
  _active: { bg: 'gray.200' },
  // Stagger entrance via CSS custom property --row-index
  animation: `${fadeSlideIn} 300ms ease-out both`,
  animationDelay: 'calc(var(--row-index, 0) * 30ms)',
};

export default function DataTable({
  columns,
  data,
  loading,
  actions,
  emptyMessage = 'No hay datos disponibles',
}) {
  if (loading) {
    return (
      <Stack spacing={3} role="status" aria-label="Cargando datos">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="48px" borderRadius="md" speed={0.8}>
            <Box height="48px" />
          </Skeleton>
        ))}
      </Stack>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        textAlign="center"
        py={12}
        px={6}
        border="1px dashed"
        borderColor="gray.300"
        borderRadius="lg"
        bg="white"
      >
        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={1}>
          {emptyMessage}
        </Text>
        <Text fontSize="sm" color="gray.500">
          Utilizá el botón superior para agregar un nuevo registro.
        </Text>
      </Box>
    );
  }

  return (
    <TableContainer
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      overflow="hidden"
      bg="white"
    >
      <Table variant="striped" colorScheme="gray">
        <Thead bg="gray.100">
          <Tr>
            {columns.map((col) => (
              <Th
                key={col.key}
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                color="gray.600"
                py={4}
              >
                {col.label}
              </Th>
            ))}
            {actions && actions.length > 0 && (
              <Th
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                color="gray.600"
                py={4}
              >
                Acciones
              </Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, rowIdx) => (
            <Tr
              key={item.id || rowIdx}
              style={{ '--row-index': rowIdx } }
              sx={rowStyles}
            >
              {columns.map((col) => (
                <Td key={col.key} py={3} fontSize="sm">
                  {col.render ? col.render(item) : item[col.key] ?? '—'}
                </Td>
              ))}
              {actions && (typeof actions === 'function' ? actions(item).length > 0 : actions.length > 0) && (
                <Td py={3}>
                  <HStack spacing={2}>
                    {(typeof actions === 'function' ? actions(item) : actions).map((action, i) => (
                      <Button
                        key={i}
                        size="sm"
                        colorScheme={action.colorScheme || 'blue'}
                        variant={action.variant || 'outline'}
                        onClick={() => action.onClick(item)}
                        _active={{
                          transform: 'scale(0.96)',
                          bg: action.variant === 'ghost'
                            ? (action.colorScheme ? `${action.colorScheme}.100` : 'gray.100')
                            : undefined,
                        }}
                        transition="transform 120ms ease-out, background-color 160ms ease-out"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </HStack>
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
