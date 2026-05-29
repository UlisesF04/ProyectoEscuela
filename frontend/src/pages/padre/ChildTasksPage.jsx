import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Badge,
  Text,
  HStack,
  VStack,
  Select,
} from '@chakra-ui/react';
import { FiAlertCircle } from 'react-icons/fi';
import ChildSelector from '../../components/ChildSelector';
import { parentService } from '../../services/parentService';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorAlert from '../../components/ErrorAlert';

const statusFilterOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'entregada', label: 'Entregadas' },
  { value: 'tarde', label: 'Tarde' },
];

const statusConfig = {
  pendiente: { colorScheme: 'yellow', label: 'Pendiente' },
  entregada: { colorScheme: 'green', label: 'Entregada' },
  tarde: { colorScheme: 'red', label: 'Tarde' },
  completada: { colorScheme: 'green', label: 'Completada' },
  vencida: { colorScheme: 'red', label: 'Vencida' },
};

function getDaysUntilDue(dueDate) {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getDueDateColor(daysUntil) {
  if (daysUntil === null) return 'onSurfaceVariant';
  if (daysUntil < 0) return 'error';
  if (daysUntil <= 7) return 'yellow.500';
  return 'success';
}

function formatDueDate(dueDate) {
  if (!dueDate) return '—';
  return new Date(dueDate).toLocaleDateString('es-AR');
}

export default function ChildTasksPage() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    parentService.getMyChildren()
      .then(setChildren)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    setError(null);
    api.get(`/students/${selectedChild.id}/tasks`)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setTasks(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  const filtered = tasks.filter((t) => {
    if (statusFilter === 'all') return true;
    const st = (t.estado || t.status || 'pendiente').toLowerCase();
    return st === statusFilter;
  });

  if (!selectedChild && children.length > 0 && !selectedChild) {
    setSelectedChild(children[0]);
  }

  return (
    <Box>
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Tareas
      </Heading>

      <ErrorAlert error={error} />

      <ChildSelector
        children={children}
        selectedChild={selectedChild}
        onChange={setSelectedChild}
      />

      {selectedChild && (
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          mb={6}
          maxW="250px"
        >
          {statusFilterOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      )}

      {loading ? (
        <LoadingSkeleton variant="card" rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No hay tareas" description="No se encontraron tareas para este filtro" />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {filtered.map((task) => {
            const est = (task.estado || task.status || 'pendiente').toLowerCase();
            const config = statusConfig[est] || { colorScheme: 'gray', label: est };
            const daysUntil = getDaysUntilDue(task.fecha_vencimiento || task.due_date || task.fecha_entrega);
            const isUrgent = daysUntil !== null && daysUntil <= 2 && daysUntil >= 0;

            return (
              <Box
                key={task.id}
                p={5}
                borderRadius="card"
                bg="white"
                boxShadow="warmSm"
                borderLeft="4px solid"
                borderColor={isUrgent ? 'error' : 'transparent'}
                transition="box-shadow 200ms ease-out"
                _hover={{ boxShadow: 'warmMd' }}
              >
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Badge
                      colorScheme={
                        (task.materia || task.subject_name || task.subject?.name)
                          ? 'brand'
                          : 'gray'
                      }
                      variant="subtle"
                      px={2}
                      py={0.5}
                    >
                      {task.materia || task.subject_name || task.subject?.name || 'General'}
                    </Badge>
                    {isUrgent && (
                      <Badge colorScheme="red" variant="subtle" px={2} py={0.5}>
                        <HStack spacing={1}>
                          <FiAlertCircle />
                          <Text>Urgente</Text>
                        </HStack>
                      </Badge>
                    )}
                  </HStack>

                  <Text fontWeight={600} fontSize="md" noOfLines={2}>
                    {task.titulo || task.title || task.nombre || 'Tarea'}
                  </Text>

                  <HStack justify="space-between">
                    <Box>
                      <Text fontSize="xs" color="onSurfaceVariant">
                        Vence:
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight={500}
                        color={getDueDateColor(daysUntil)}
                      >
                        {formatDueDate(task.fecha_vencimiento || task.due_date || task.fecha_entrega)}
                      </Text>
                    </Box>
                    <Badge
                      colorScheme={config.colorScheme}
                      variant="subtle"
                      px={3}
                      py={1}
                    >
                      {config.label}
                    </Badge>
                  </HStack>

                  {task.descripcion && (
                    <Text fontSize="sm" color="onSurfaceVariant" noOfLines={2}>
                      {task.descripcion || task.description}
                    </Text>
                  )}
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
