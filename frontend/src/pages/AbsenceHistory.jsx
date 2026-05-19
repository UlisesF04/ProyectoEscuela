import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Flex, Text, Button, SimpleGrid, Card, Badge, VStack, Table } from '@chakra-ui/react'
import FeedbackBanner from '../components/molecules/FeedbackBanner'
import LoadingSpinner from '../components/molecules/LoadingSpinner'
import ErrorState from '../components/molecules/ErrorState'
import EmptyState from '../components/molecules/EmptyState'
import { useAbsenceHistory } from '../hooks'

export default function AbsenceHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, loading, error, justify, refetch } = useAbsenceHistory(id)
  const [feedback, setFeedback] = useState('')

  if (loading) return <LoadingSpinner />
  if (error) return (
    <Box maxW="container-max" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text textStyle="heading-xl" color="fg">Historial de Inasistencias</Text>
        </Box>
        <Button variant="ghost" borderRadius="full" onClick={() => navigate('/absences/register')}>
          Volver
        </Button>
      </Flex>
      <ErrorState message={error} />
    </Box>
  )
  if (!data) return <EmptyState heading="Estudiante no encontrado" message="No se encontró el estudiante solicitado." />

  const { student, summary, absences } = data

  return (
    <Box maxW="container-max" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text textStyle="heading-xl" color="fg">Historial de Inasistencias</Text>
          <Text textStyle="body-lg" color="fg.muted">{student.apellido}, {student.nombre}</Text>
          <Text textStyle="label-md" color="fg.muted">{student.curso}</Text>
        </Box>
        <Button variant="ghost" borderRadius="full" onClick={() => navigate('/absences/register')}>
          Volver
        </Button>
      </Flex>

      <FeedbackBanner feedback={feedback} />

      {/* Summary cards */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={6}>
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6}>
          <Text textStyle="heading-xl" color="primary">{summary.total}</Text>
          <Text textStyle="label-md" color="fg.muted">Total Ausencias</Text>
        </Card.Root>
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6}>
          <Text textStyle="heading-xl" color="success">{summary.justified}</Text>
          <Text textStyle="label-md" color="fg.muted">Justificadas</Text>
        </Card.Root>
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6}>
          <Text textStyle="heading-xl" color="tertiary">{summary.unjustified}</Text>
          <Text textStyle="label-md" color="fg.muted">Injustificadas</Text>
        </Card.Root>
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6} borderColor={summary.atRisk ? 'error' : 'border.default'}>
          <Text textStyle="heading-xl" color={summary.atRisk ? 'error' : 'success'}>{summary.percentage}%</Text>
          <Text textStyle="label-md" color="fg.muted">
            {summary.atRisk ? '⚠ En Riesgo' : 'Porcentaje'}
          </Text>
        </Card.Root>
      </SimpleGrid>

      {/* Absence list */}
      <Card.Root bg="bg.card" borderRadius="xl" shadow="card">
        <Card.Body p={0}>
          {absences.length > 0 ? (
            <Box overflowX="auto">
              <Table.Root>
                <Table.Header>
                  <Table.Row bg="surface-container-low">
                    <Table.ColumnHeader px={4} py={3}>Fecha</Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3}>Estado</Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} textAlign="right">Acción</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {absences.map((a) => (
                    <Table.Row key={a.id} borderBottom="1px solid" borderColor="border.default">
                      <Table.Cell px={4} py={3}>{new Date(a.fecha).toLocaleDateString('es-AR')}</Table.Cell>
                      <Table.Cell px={4} py={3}>
                        <Badge colorPalette={a.justificada ? 'green' : 'orange'} borderRadius="full" px={2}>
                          {a.justificada ? 'Justificada' : 'No Justificada'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell px={4} py={3} textAlign="right">
                        {!a.justificada && (
                          <Button size="xs" borderRadius="full" variant="outline"
                            onClick={async () => {
                              try {
                                await justify(a.id)
                                setFeedback('✅ Inasistencia justificada correctamente')
                                refetch()
                              } catch (err) {
                                setFeedback('❌ ' + (err.response?.data?.message || 'Error al justificar'))
                              }
                            }}
                          >
                            Justificar
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          ) : (
            <Box p={6}>
              <EmptyState heading="Sin inasistencias" message="Este alumno no tiene inasistencias registradas." />
            </Box>
          )}
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
