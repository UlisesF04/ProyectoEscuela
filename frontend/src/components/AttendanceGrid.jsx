import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Badge,
  Box,
  Text,
  Skeleton,
  Stack,
  HStack,
} from '@chakra-ui/react';

const statusConfig = {
  presente: { label: 'Presente', color: 'green' },
  ausente: { label: 'Ausente', color: 'red' },
  tarde: { label: 'Tarde', color: 'orange' },
};

export default function AttendanceGrid({
  students,
  selectedDate,
  attendances,
  onStatusChange,
  loading,
}) {
  if (loading) {
    return (
      <Stack spacing={3} role="status" aria-label="Cargando alumnos">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="56px" borderRadius="md" speed={0.8}>
            <Box height="56px" />
          </Skeleton>
        ))}
      </Stack>
    );
  }

  if (!students || students.length === 0) {
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
          No hay alumnos en este curso
        </Text>
        <Text fontSize="sm" color="gray.500">
          Seleccioná un curso con alumnos registrados para comenzar.
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
            <Th
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
              color="gray.600"
              py={4}
              width="40%"
            >
              Alumno
            </Th>
            <Th
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
              color="gray.600"
              py={4}
              width="40%"
            >
              Estado
            </Th>
            <Th
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
              color="gray.600"
              py={4}
              width="20%"
            >
              Actual
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {students.map((student, rowIdx) => {
            const attKey = `${student.id}-${selectedDate}`;
            const currentStatus = attendances[attKey];

            return (
              <Tr
                key={student.id}
                style={{ '--row-index': rowIdx }}
                sx={{
                  _hover: { bg: 'gray.100', transition: 'background-color 160ms ease-out' },
                  _active: { bg: 'gray.200' },
                  animation: 'fadeSlideIn 300ms ease-out both',
                  animationDelay: 'calc(var(--row-index, 0) * 30ms)',
                }}
              >
                <Td py={3} fontSize="sm" fontWeight="medium">
                  {student.first_name} {student.last_name}
                </Td>
                <Td py={3}>
                  <HStack spacing={2}>
                    {Object.entries(statusConfig).map(([st, cfg]) => {
                      const isActive = currentStatus === st;
                      return (
                        <Button
                          key={st}
                          size="sm"
                          colorScheme={isActive ? cfg.color : 'gray'}
                          variant={isActive ? 'solid' : 'outline'}
                          onClick={() => onStatusChange(student.id, st)}
                          _active={{
                            transform: 'scale(0.96)',
                          }}
                          transition="all 120ms ease-out"
                          px={3}
                          minW="80px"
                        >
                          {cfg.label}
                        </Button>
                      );
                    })}
                  </HStack>
                </Td>
                <Td py={3}>
                  {currentStatus ? (
                    <Badge
                      colorScheme={statusConfig[currentStatus]?.color || 'gray'}
                      variant="subtle"
                      px={2}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                    >
                      {statusConfig[currentStatus]?.label || currentStatus}
                    </Badge>
                  ) : (
                    <Text fontSize="xs" color="gray.400">
                      Sin registrar
                    </Text>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      <Box as="style" display="none">
        {`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}
      </Box>
    </TableContainer>
  );
}
