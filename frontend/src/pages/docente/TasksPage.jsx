import {
  Box, Heading, Select, Button, HStack, VStack, Text, Badge, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  ModalFooter, FormControl, FormLabel, Input, Textarea, useDisclosure,
  SimpleGrid, Card, CardBody, CardHeader, IconButton, Spacer, Flex,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';
import { teacherService } from '../../services/teacherService';

export default function TasksPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', due_date: '' });

  const fetchSubjects = useCallback(() => {
    setLoading(true);
    setError(null);
    teacherService.getMyCourses()
      .then((res) => {
        const data = res.data || res || [];
        setSubjects(data);
        if (data.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(data[0].id?.toString() || '');
        }
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchTasks = useCallback(() => {
    if (!selectedSubjectId) return;
    setLoading(true);
    api.get(`/subjects/${selectedSubjectId}/tasks`)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setTasks(data);
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [selectedSubjectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.due_date) {
      toast({ title: 'Campos requeridos', description: 'Título y fecha de entrega son obligatorios', status: 'warning', duration: 3000, isClosable: true, position: 'top-right' });
      return;
    }
    setSaving(true);
    try {
      await api.post('/tasks', {
        title: form.title,
        description: form.description,
        subject_id: parseInt(selectedSubjectId),
        due_date: form.due_date,
      });
      toast({ title: 'Tarea creada', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
      onClose();
      setForm({ title: '', description: '', due_date: '' });
      fetchTasks();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo crear la tarea', status: 'error', duration: 3000, isClosable: true, position: 'top-right' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    if (!confirm(`¿Eliminar la tarea "${task.title}"?`)) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      toast({ title: 'Tarea eliminada', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
      fetchTasks();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo eliminar', status: 'error', duration: 3000, isClosable: true, position: 'top-right' });
    }
  };

  const getDueDateStyle = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    const days = diff / (1000 * 60 * 60 * 24);
    if (diff < 0) return { colorScheme: 'red', label: 'Vencida' };
    if (days <= 7) return { colorScheme: 'orange', label: `Faltan ${Math.ceil(days)} días` };
    return { colorScheme: 'green', label: `Faltan ${Math.ceil(days)} días` };
  };

  if (loading && subjects.length === 0) return <LoadingSkeleton variant="text" rows={5} />;

  if (subjects.length === 0) {
    return (
      <Box>
        <Heading as="h1" size="lg" mb={6} fontFamily="heading">Tareas</Heading>
        <EmptyState title="No tiene materias asignadas" description="Contacte al administrador." />
      </Box>
    );
  }

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchSubjects} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">Tareas</Heading>

      <HStack mb={6} spacing={4} flexWrap="wrap">
        <FormControl w="280px">
          <Select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} borderRadius="input">
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </FormControl>
        <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onOpen}>
          Nueva Tarea
        </Button>
      </HStack>

      {loading ? (
        <LoadingSkeleton variant="card" rows={3} />
      ) : tasks.length === 0 ? (
        <EmptyState title="No hay tareas" description="Cree una nueva tarea usando el botón superior." />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {tasks.map((task, idx) => {
            const dueStyle = getDueDateStyle(task.due_date);
            const submitted = task.submitted_count ?? (task.submissions || []).filter((s) => s.status === 'Entregada' || s.status === 'Tarde').length;
            const total = task.total_students ?? (task.submissions || []).length;
            return (
              <Card
                key={task.id}
                sx={{ animation: 'fadeSlideIn 300ms ease-out both', animationDelay: `${idx * 40}ms` }}
              >
                <CardHeader pb={2}>
                  <Flex align="flex-start" gap={2}>
                    <Box flex={1}>
                      <Text fontWeight={600} fontSize="md" noOfLines={2}>{task.title}</Text>
                      <Badge colorScheme="brand" mt={1} fontSize="xs">{task.subject_name || selectedSubjectId}</Badge>
                    </Box>
                    <Badge colorScheme={dueStyle.colorScheme} variant="solid" fontSize="xs" whiteSpace="nowrap">
                      <FiClock style={{ display: 'inline', marginRight: 4 }} />
                      {dueStyle.label}
                    </Badge>
                  </Flex>
                </CardHeader>
                <CardBody pt={2}>
                  {task.description && (
                    <Text fontSize="sm" color="onSurfaceVariant" mb={3} noOfLines={2}>
                      {task.description}
                    </Text>
                  )}
                  <Text fontSize="sm" color="onSurfaceVariant" mb={3}>
                    {submitted} de {total} entregadas
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm" variant="outline" colorScheme="brand"
                      leftIcon={<FiEye />}
                      onClick={() => navigate(`/docente/tasks/${task.id}/submissions`)}
                    >
                      Ver entregas
                    </Button>
                    <IconButton
                      icon={<FiTrash2 />}
                      size="sm" variant="ghost" colorScheme="red"
                      borderRadius="pill"
                      onClick={() => handleDelete(task)}
                      minW="44px" minH="44px"
                    />
                  </HStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva Tarea</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Título</FormLabel>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Título de la tarea"
                  borderRadius="input"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Descripción</FormLabel>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Descripción opcional"
                  borderRadius="input"
                  rows={3}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Fecha de entrega</FormLabel>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                  borderRadius="input"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancelar</Button>
            <Button colorScheme="brand" onClick={handleCreate} isLoading={saving} loadingText="Creando...">
              Crear Tarea
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
