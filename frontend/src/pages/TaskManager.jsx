import { useState } from 'react'
import { Box, Flex, Text, Button, SimpleGrid, Card, Badge, VStack, NativeSelect, Dialog, Input, Separator } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function TaskManager() {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState('')
  const [tasks, setTasks] = useState([
    { id: 1, titulo: 'TP N°1: Fracciones', materia: 'Matemática', fecha_entrega: '2026-06-15', estado: 'activa', entregados: 8, total: 15 },
    { id: 2, titulo: 'Análisis de texto', materia: 'Lengua', fecha_entrega: '2026-06-20', estado: 'activa', entregados: 5, total: 15 },
    { id: 3, titulo: 'TP N°2: Ecuaciones', materia: 'Matemática', fecha_entrega: '2026-06-10', estado: 'vencida', entregados: 12, total: 15 },
  ])
  const [open, setOpen] = useState(false)
  const [newTask, setNewTask] = useState({ titulo: '', materia_id: '', fecha_entrega: '' })

  const materias = [
    { id: 1, name: 'Matemática' },
    { id: 2, name: 'Lengua' },
    { id: 3, name: 'Ciencias' },
    { id: 4, name: 'Historia' },
  ]

  const createTask = () => {
    if (!newTask.titulo || !newTask.materia_id || !newTask.fecha_entrega) {
      setFeedback('⚠️ Completá todos los campos')
      return
    }
    const materia = materias.find(m => m.id === parseInt(newTask.materia_id))
    setTasks([{
      id: Date.now(),
      titulo: newTask.titulo,
      materia: materia?.name || '',
      fecha_entrega: newTask.fecha_entrega,
      estado: 'activa',
      entregados: 0,
      total: 15,
    }, ...tasks])
    setOpen(false)
    setNewTask({ titulo: '', materia_id: '', fecha_entrega: '' })
    setFeedback('✅ Tarea creada exitosamente')
  }

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

      {/* Task list */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {tasks.map((task) => (
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
                colorPalette={task.estado === 'activa' ? 'blue' : 'orange'}
                borderRadius="full"
                px={2}
              >
                {task.estado === 'activa' ? 'Activa' : 'Vencida'}
              </Badge>
              <Text textStyle="label-md" color="fg.muted">
                {new Date(task.fecha_entrega).toLocaleDateString('es-AR')}
              </Text>
            </Flex>
            <Text fontWeight="semibold" color="fg" mb={1}>{task.titulo}</Text>
            <Text textStyle="body-md" color="fg.muted" mb={4}>{task.materia}</Text>
            <Flex justify="space-between" align="center">
              <Text textStyle="label-md" color="fg.muted">
                {task.entregados}/{task.total} entregados
              </Text>
              <Box
                w="60px"
                h="4px"
                borderRadius="full"
                bg="surface-container"
                overflow="hidden"
              >
                <Box
                  h="full"
                  borderRadius="full"
                  bg={task.entregados / task.total > 0.7 ? 'success' : 'primary-container'}
                  w={`${(task.entregados / task.total) * 100}%`}
                  transition="width 0.3s"
                />
              </Box>
            </Flex>
          </Card.Root>
        ))}
      </SimpleGrid>

      {/* Create task dialog */}
      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Dialog.Backdrop bg="rgba(0,0,0,0.4)" />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl" p={0} bg="surface-container-lowest">
            <Dialog.Header p={6} borderBottom="1px solid" borderColor="border.default">
              <Dialog.Title textStyle="heading-lg" color="fg">Nueva Tarea</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body p={6}>
              <VStack gap={4}>
                <Box w="full">
                  <Text textStyle="label-md" color="fg.muted" mb={1}>Título</Text>
                  <Input
                    placeholder="Ej: TP N°3: Geometría"
                    value={newTask.titulo}
                    onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })}
                    borderRadius="full"
                    borderColor="border.default"
                    bg="bg"
                    _focus={{ ring: 2, ringColor: 'primary-container' }}
                  />
                </Box>
                <Box w="full">
                  <Text textStyle="label-md" color="fg.muted" mb={1}>Materia</Text>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      placeholder="Seleccionar materia"
                      value={newTask.materia_id}
                      onChange={(e) => setNewTask({ ...newTask, materia_id: e.target.value })}
                    >
                      {materias.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Box>
                <Box w="full">
                  <Text textStyle="label-md" color="fg.muted" mb={1}>Fecha de entrega</Text>
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
