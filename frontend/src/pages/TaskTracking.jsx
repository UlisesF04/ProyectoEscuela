import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Flex, Text, Button, Card, Badge, VStack, Checkbox, Table, Separator, Spinner } from '@chakra-ui/react'
import { CONSECUTIVE_PENDING_ALERT } from '../constants/business'
import FeedbackBanner from '../components/molecules/FeedbackBanner'
import LoadingSpinner from '../components/molecules/LoadingSpinner'
import EmptyState from '../components/molecules/EmptyState'
import { useTaskTracking } from '../hooks'

export default function TaskTracking() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { task, submissions, loading, error, updateSubmission, refetch } = useTaskTracking(id)
  const [toggling, setToggling] = useState(null)
  const [feedback, setFeedback] = useState('')

  const toggleDelivery = async (studentId, currentValue) => {
    setToggling(studentId)
    try {
      await updateSubmission(studentId, !currentValue)
      await refetch()
      setFeedback('✅ Estado de entrega actualizado')
    } catch (err) {
      setFeedback(`❌ ${err.response?.data?.message || 'Error al actualizar entrega'}`)
    } finally {
      setToggling(null)
    }
  }

  if (loading) return <LoadingSpinner />

  if (!task && !submissions) {
    return (
      <Box maxW="container-max" mx="auto">
        <Flex justify="space-between" align="center" mb={6}>
          <Text textStyle="heading-xl" color="fg">Seguimiento de Tarea</Text>
          <Button variant="ghost" borderRadius="full" onClick={() => navigate('/tasks')}>
            Volver
          </Button>
        </Flex>
        <EmptyState
          heading="Tarea no encontrada"
          message={feedback || 'No se pudo cargar la informaci\u00f3n de la tarea.'}
          action={<Button borderRadius="full" colorPalette="primary" onClick={() => navigate('/tasks')}>Volver a Tareas</Button>}
        />
      </Box>
    )
  }

  const estudiantes = submissions?.estudiantes || task?.entregas || []
  const total = estudiantes.length
  const entregaron = estudiantes.filter(s => s.entregada).length
  const pendientes = total - entregaron
  const consecutivas = estudiantes.filter(s => !s.entregada).length // Simplified — we just show count of pending

  return (
    <Box maxW="container-max" mx="auto">
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Text textStyle="heading-xl" color="fg">Seguimiento de Tarea</Text>
          <Text textStyle="body-md" color="fg.muted">
            {task?.nombre || 'Tarea'} · {submissions?.materia || task?.materia || ''}
            {task?.fecha_entrega && ` · Entrega: ${new Date(task.fecha_entrega).toLocaleDateString('es-AR')}`}
          </Text>
        </Box>
        <Button variant="ghost" borderRadius="full" onClick={() => navigate('/tasks')}>
          Volver
        </Button>
      </Flex>

      <FeedbackBanner feedback={feedback} />
      {error && (
        <Box mb={4} p={3} borderRadius="md" bg="error-container" color="on-error-container">
          <Text fontSize="sm">{error}</Text>
        </Box>
      )}

      {/* Stats */}
      <Flex gap={6} mb={6} wrap="wrap">
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={4} minW="140px" flex="1">
          <Text textStyle="heading-lg" color="primary">{entregaron}/{total}</Text>
          <Text textStyle="label-md" color="fg.muted">Entregaron</Text>
        </Card.Root>
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={4} minW="140px" flex="1">
          <Text textStyle="heading-lg" color="tertiary">{pendientes}/{total}</Text>
          <Text textStyle="label-md" color="fg.muted">Pendientes</Text>
        </Card.Root>
        {pendientes >= CONSECUTIVE_PENDING_ALERT && (
          <Card.Root bg="error-container" borderRadius="xl" shadow="card" p={4} minW="200px" flex="1">
            <Text textStyle="heading-md" color="on-error-container">
              ⚠ {pendientes} alumno(s) sin entregar
            </Text>
            <Text textStyle="label-md" color="on-error-container">
              Posibles 2+ tareas consecutivas (RN-06)
            </Text>
          </Card.Root>
        )}
      </Flex>

      {/* Student table */}
      <Card.Root bg="bg.card" borderRadius="xl" shadow="card">
        <Card.Body p={0}>
          <Box overflowX="auto">
            <Table.Root>
              <Table.Header>
                <Table.Row bg="surface-container-low">
                  <Table.ColumnHeader px={4} py={3}>Alumno</Table.ColumnHeader>
                  <Table.ColumnHeader px={4} py={3}>Entregó</Table.ColumnHeader>
                  <Table.ColumnHeader px={4} py={3} textAlign="center">Estado</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {estudiantes.length > 0 ? (
                  estudiantes.map((student) => (
                    <Table.Row key={student.id} borderBottom="1px solid" borderColor="border.default">
                      <Table.Cell px={4} py={3} fontWeight="medium" color="fg">
                        {student.apellido}, {student.nombre}
                      </Table.Cell>
                      <Table.Cell px={4} py={3}>
                        <Checkbox.Root
                          checked={student.entregada}
                          disabled={toggling === student.id}
                          onCheckedChange={() => toggleDelivery(student.id, student.entregada)}
                        />
                      </Table.Cell>
                      <Table.Cell px={4} py={3} textAlign="center">
                        {toggling === student.id ? (
                          <Spinner size="sm" />
                        ) : student.entregada ? (
                          <Badge colorPalette="green" borderRadius="full" px={2}>Entregada</Badge>
                        ) : (
                          <Badge colorPalette="orange" borderRadius="full" px={2}>Pendiente</Badge>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell px={4} py={6} textAlign="center" colSpan={3} color="fg.muted">
                      No hay estudiantes registrados para esta materia
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
