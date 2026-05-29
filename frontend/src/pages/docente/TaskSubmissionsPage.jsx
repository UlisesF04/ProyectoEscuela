import {
  Box, Heading, Text, Badge, HStack, VStack, Select, Button, useToast,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Spinner, Flex, Breadcrumb,
  BreadcrumbItem, BreadcrumbLink,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';

const STATUS_OPTIONS = ['Seleccionar', 'Entregada', 'Tarde'];
const STATUS_COLORS = {
  Pendiente: 'red',
  Entregada: 'green',
  Tarde: 'orange',
};

export default function TaskSubmissionsPage() {
  const { taskId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/tasks/${taskId}/submissions`)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        const taskInfo = data.task || data[0]?.task || null;
        setTask(taskInfo || { title: 'Tarea', subject_name: '', due_date: '', course_name: '' });
        setSubmissions(data.submissions || data.students || data);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleStatusChange = async (submission, newStatus) => {
    const currentStatus = submission.status || 'Pendiente';
    if (currentStatus === 'Pendiente' && (newStatus === 'Entregada' || newStatus === 'Tarde')) {
      setUpdating(submission.id);
      try {
        await api.put(`/tasks/${taskId}/submissions/${submission.id}`, { status: newStatus });
        setSubmissions((prev) =>
          prev.map((s) => (s.id === submission.id ? { ...s, status: newStatus } : s))
        );
        toast({ title: 'Estado actualizado', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
      } catch (err) {
        toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo actualizar', status: 'error', duration: 3000, isClosable: true, position: 'top-right' });
      } finally {
        setUpdating(null);
      }
    } else if (currentStatus !== 'Pendiente') {
      toast({
        title: 'No se puede revertir el estado de entrega',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  if (loading) return <LoadingSkeleton variant="text" rows={5} />;

  const getDueDateStyle = (dueDate) => {
    if (!dueDate) return { colorScheme: 'gray', label: 'Sin fecha' };
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    const days = diff / (1000 * 60 * 60 * 24);
    if (diff < 0) return { colorScheme: 'red', label: 'Vencida' };
    if (days <= 7) return { colorScheme: 'orange', label: `Faltan ${Math.ceil(days)} días` };
    return { colorScheme: 'green', label: `Faltan ${Math.ceil(days)} días` };
  };

  const dueStyle = getDueDateStyle(task?.due_date);

  return (
    <Box>
      <ErrorAlert error={error} />
      <Breadcrumb mb={4} fontSize="sm" color="onSurfaceVariant">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/docente/tasks">Tareas</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <Text>Entregas</Text>
        </BreadcrumbItem>
      </Breadcrumb>

      <Button
        variant="ghost" leftIcon={<FiArrowLeft />} mb={4} onClick={() => navigate('/docente/tasks')}
      >
        Volver a tareas
      </Button>

      <Box p={6} borderRadius="card" bg="white" boxShadow="warmSm" mb={6}>
        <HStack spacing={4} flexWrap="wrap">
          <Box flex={1}>
            <Heading as="h2" size="md" fontFamily="heading">{task?.title || 'Tarea'}</Heading>
            <HStack mt={1} spacing={3} flexWrap="wrap">
              {task?.subject_name && (
                <Badge colorScheme="brand" fontSize="xs">{task.subject_name}</Badge>
              )}
              {task?.course_name && (
                <Text fontSize="sm" color="onSurfaceVariant">{task.course_name}</Text>
              )}
              <Badge colorScheme={dueStyle.colorScheme} variant="solid" fontSize="xs">
                <FiClock style={{ display: 'inline', marginRight: 4 }} />
                {dueStyle.label}
              </Badge>
            </HStack>
          </Box>
        </HStack>
      </Box>

      {submissions.length === 0 ? (
        <EmptyState title="Sin entregas" description="No hay estudiantes asignados a esta tarea." />
      ) : (
        <Box borderRadius="card" border="1px solid" borderColor="outlineVariant" overflow="hidden" bg="white" boxShadow="warmSm">
          <TableContainer>
            <Table variant="simple">
              <Thead bg="containerLow">
                <Tr>
                  <Th fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="onSurfaceVariant" py={4}>Estudiante</Th>
                  <Th fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="onSurfaceVariant" py={4}>Estado</Th>
                  <Th fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="onSurfaceVariant" py={4}>Acción</Th>
                </Tr>
              </Thead>
              <Tbody>
                {submissions.map((sub, idx) => {
                  const currentStatus = sub.status || 'Pendiente';
                  const canChange = currentStatus === 'Pendiente';
                  return (
                    <Tr
                      key={sub.id || idx}
                      _hover={{ bg: 'containerLow', transition: 'background-color 160ms ease-out' }}
                      sx={{ animation: 'fadeSlideIn 300ms ease-out both', animationDelay: `${idx * 30}ms` }}
                    >
                      <Td py={3} fontSize="sm">
                        {`${sub.first_name || ''} ${sub.last_name || ''}`.trim() || sub.student_name || sub.name || '—'}
                      </Td>
                      <Td py={3}>
                        <Badge
                          colorScheme={STATUS_COLORS[currentStatus] || 'gray'}
                          variant="solid"
                        >
                          {currentStatus}
                        </Badge>
                      </Td>
                      <Td py={3}>
                        {canChange ? (
                          <HStack spacing={2}>
                            <Select
                              size="sm"
                              w="140px"
                              borderRadius="input"
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value) handleStatusChange(sub, e.target.value);
                                e.target.value = '';
                              }}
                            >
                              <option value="" disabled>Actualizar estado</option>
                              {STATUS_OPTIONS.filter((o) => o !== 'Seleccionar').map((o) => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </Select>
                            {updating === sub.id && <Spinner size="sm" />}
                          </HStack>
                        ) : (
                          <Text fontSize="sm" color="onSurfaceVariant" fontStyle="italic">
                            Estado final
                          </Text>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
