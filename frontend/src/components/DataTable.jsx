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
  Box,
} from '@chakra-ui/react';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';

export default function DataTable({
  columns,
  data,
  loading,
  actions,
  emptyMessage = 'No hay datos disponibles',
  emptyDescription,
  emptyAction,
  sortable,
}) {
  if (loading) {
    return <LoadingSkeleton variant="table" rows={5} columns={columns.length} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <Box
      borderRadius="card"
      border="1px solid"
      borderColor="outlineVariant"
      overflow="hidden"
      bg="white"
      boxShadow="warmSm"
      sx={{
        '@media (max-width: 767px)': {
          overflowX: 'auto',
        },
      }}
    >
      <TableContainer>
        <Table variant="simple">
          <Thead bg="containerLow">
            <Tr>
              {columns.map((col) => (
                <Th
                  key={col.key}
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color="onSurfaceVariant"
                  py={4}
                  cursor={sortable ? 'pointer' : 'default'}
                  _hover={sortable ? { color: 'primary' } : undefined}
                >
                  {col.label}
                </Th>
              ))}
              {actions && (
                <Th
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color="onSurfaceVariant"
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
                _hover={{ bg: 'containerLow', transition: 'background-color 160ms ease-out' }}
                sx={{
                  '--row-index': rowIdx,
                  animation: 'fadeSlideIn 300ms ease-out both',
                  animationDelay: 'calc(var(--row-index, 0) * 30ms)',
                }}
              >
                {columns.map((col) => (
                  <Td key={col.key} py={3} fontSize="sm">
                    {col.render ? col.render(item) : item[col.key] ?? '—'}
                  </Td>
                ))}
                {actions && (
                  <Td py={3}>
                    <HStack spacing={2}>
                      {(typeof actions === 'function' ? actions(item) : actions).map((action, i) => (
                        <Button
                          key={i}
                          size="sm"
                          colorScheme={action.colorScheme || 'brand'}
                          variant={action.variant || 'ghost'}
                          borderRadius="pill"
                          onClick={() => action.onClick(item)}
                          _active={{ transform: 'scale(0.96)' }}
                          transition="transform 120ms ease-out"
                          minW="44px"
                          minH="44px"
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
    </Box>
  );
}
