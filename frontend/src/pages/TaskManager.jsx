import { useState } from 'react'
import { Box, Flex, Text, Button, SimpleGrid, Card, Badge, VStack, NativeSelect, Dialog, Input } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import FeedbackBanner from '../components/molecules/FeedbackBanner'
import LoadingSpinner from '../components/molecules/LoadingSpinner'
import EmptyState from '../components/molecules/EmptyState'
import { useTasks, useSubjects } from '../hooks'
import api from '../services/api'
import StaggerContainer from '../components/StaggerContainer'

export default function TaskManager() {
  const navigate = useNavigate()
  const { materias, loading: loadingMaterias } = useSubjects()
  const { tasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useTasks()
  const [feedback, setFeedback] = useState('')
  const [open, setOpen] = useState(false)
  const [newTask, setNewTask] = useState({ nombre: '', materia_id: '', descripcion: '', fecha_asignacion: '', fecha_entrega: '' })
  const [creating, setCreating] = useState(false)

  const createTask = async () => {
    if (!newTask.nombre || !newTask.materia_id || !newTask.fecha_asignacion || !newTask.fecha_entrega) {
      setFeedback('⚠️ Completá todos los campos requeridos')
      return
    }
    setCreating(true)
    try {
      const { data } = await api.post('/tasks', {
        materia_id: parseInt(newTask.materia_id),
        nombre: newTask.nombre,
        descripcion: newTask.descripcion,
        fecha_asignacion: newTask.fecha_asignacion,
        fecha_entrega: newTask.fecha_entrega,
      })
      refetchTasks()
      setOpen(false)
      setNewTask({ nombre: '', materia_id: '', descripcion: '', fecha_asignacion: '', fecha_entrega: '' })
      setFeedback('✅ Tarea creada exitosamente')
    } catch (err) {
      setFeedback(`❌ ${err.response?.data?.message || 'Error al crear tarea'}`)
    } finally {
      setCreating(false)
    }
  }

  if (tasksLoading || loadingMaterias) return <LoadingSpinner />

  return (
    <Box maxW="container-max" mx="auto">
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Text textStyle="heading-xl" color="fg">Gestión de Tareas</Text>
          <Text textStyle="body-md" color="fg.muted">Creá y seguí el progreso de las tareas</Text>
        </Box>
        <Button
          css={{
            background: 'linear-gradient(135deg, {colors.primary-container}, {colors.secondary-container})',
            color: 'white',
            borderRadius: 'full',
            px: 6,
            py: 2,
            fontWeight: 'semibold',
            _hover: { transform: 'scale(1.02)', boxShadow: 'warm-glow' },
            _active: { transform: 'scale(0.98)' },
          }}
          onClick={() => setOpen(true)}
        >
          Nueva Tarea
        </Button>
      </Flex>

      {feedback && (
        <FeedbackBanner feedback={feedback} />
      )}
      {tasksError && (
        <Box mb={4} p={3} borderRadius="md" bg="error-container" color="on-error-container">
          <Text fontSize="sm">{tasksError}</Text>
        </Box>
      )}

      {/* Task list */}
      {tasks.length > 0 ? (
        <StaggerContainer>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {tasks.map((task) => {
              const vencida = new Date(task.fecha_entrega) < new Date()
              return (
                <StaggerContainer.Item key={task.id}>
                  <Card.Root
                key={task.id}
                bg="bg.card"
                borderRadius="xl"
                shadow="card"
                p={6}
                cursor="pointer"
                _hover={{ shadow: 'card-hover', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
                onClick={() => navigate(`/tasks/${task.id}/tracking`)}
              >
                <Flex justify="space-between" align="flex-start" mb={3}>
                  <Badge
                    colorPalette={vencida ? 'orange' : 'blue'}
                    borderRadius="full"
                    px={2}
                  >
                    {vencida ? 'Vencida' : 'Activa'}
                  </Badge>
                  <Text textStyle="label-md" color="fg.muted">
                    {new Date(task.fecha_entrega).toLocaleDateString('es-AR')}
                  </Text>
                </Flex>
                <Text fontWeight="semibold" color="fg" mb={1}>{task.nombre}</Text>
                <Text textStyle="body-md" color="fg.muted" mb={4}>{task.materia}</Text>
                {task.descripcion && (
                  <Text textStyle="body-md" color="fg.muted" mb={4} noOfLines={2}>
                    {task.descripcion}
                  </Text>
                )}
              </Card.Root>
                </StaggerContainer.Item>
              )
            })}
          </SimpleGrid>
        </StaggerContainer>
      ) : (
        <EmptyState heading="Sin tareas" message="No hay tareas creadas aún. ¡Creá la primera!" />
      )}

      {/* Create task dialog */}
      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Dialog.Backdrop css={{ background: 'rgba(0, 0, 0, 0.4)' }} />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl" p={0} bg="surface-container-lowest">
            <Dialog.Header p={6} borderBottom="1px solid" borderColor="border.default">
              <Dialog.Title textStyle="heading-lg" color="fg">Nueva Tarea</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body p={6}>
              <VStack gap={4}>
                <Box w="full">
                  <Text textStyle="label-md" color="fg.muted" mb={1}>Título *</Text>
                  <Input
                    placeholder="Ej: TP N°3: Geometría"
                    value={newTask.nombre}
                    onChange={(e) => setNewTask({ ...newTask, nombre: e.target.value })}
                    borderRadius="full"
                    borderColor="border.default"
                    bg="bg"
                    _focus={{ ring: 2, ringColor: 'primary-container' }}
                  />
                </Box>
                <Box w="full">
                  <Text textStyle="label-md" color="fg.muted" mb={1}>Materia *</Text>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      placeholder="Seleccionar materia"
                      value={newTask.materia_id}
                      onChange={(e) => setNewTask({ ...newTask, materia_id: e.target.value })}
                    >
                      {materias.map(m => (
                        <option key={m.id} value={m.id}>{m.nombre}</option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>
                <Box w="full">
                  <Text textStyle="label-md" color="fg.muted" mb={1}>Descripción</Text>
                  <Input
                    placeholder="Opcional: detalle de la tarea"
                    value={newTask.descripcion}
                    onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })}
                    borderRadius="full"
                    borderColor="border.default"
                    bg="bg"
                    _focus={{ ring: 2, ringColor: 'primary-container' }}
                  />
                </Box>
                <Box w="full">
                  <Text textStyle="label-md" color="fg.muted" mb={1}>Fecha de asignación *</Text>
                  <Input
                    type="date"
                    value={newTask.fecha_asignacion}
                    onChange={(e) => setNewTask({ ...newTask, fecha_asignacion: e.target.value })}
                    borderRadius="full"
                    borderColor="border.default"
                    bg="bg"
                    _focus={{ ring: 2, ringColor: 'primary-container' }}
                  />
                </Box>
                <Box w="full">
                  <Text textStyle="label-md" color="fg.muted" mb={1}>Fecha de entrega *</Text>
                  <Input
                    type="date"
                    value={newTask.fecha_entrega}
                    onChange={(e) => setNewTask({ ...newTask, fecha_entrega: e.target.value })}
                    borderRadius="full"
                    borderColor="border.default"
                    bg="bg"
                    _focus={{ ring: 2, ringColor: 'primary-container' }}
                  />
                </Box>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer p={6} borderTop="1px solid" borderColor="border.default">
              <Button variant="ghost" borderRadius="full" mr={3} onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                borderRadius="full"
                bg="primary"
                color="white"
                _hover={{ bg: 'primary-container' }}
                onClick={createTask}
                loading={creating}
              >
                Crear Tarea
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  )
}
