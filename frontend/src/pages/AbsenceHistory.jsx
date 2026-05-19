import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Flex, Text, Button, SimpleGrid, Card, Badge, VStack, HStack, Separator, Spinner } from '@chakra-ui/react'
import api from '../services/api'

export default function AbsenceHistory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await api.get(`/absences/student/${id}`)
        setData(res)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <Flex justify="center" py={20}><Spinner /></Flex>
  if (!data) return <Text>Estudiante no encontrado</Text>

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
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--chakra-colors-surface-container-low)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--chakra-colors-fg-muted)' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--chakra-colors-fg-muted)' }}>Estado</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--chakra-colors-fg-muted)' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {absences.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--chakra-colors-border-default)' }}>
                    <td style={{ padding: '12px 16px' }}>{new Date(a.fecha).toLocaleDateString('es-AR')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge
                        colorPalette={a.justificada ? 'green' : 'orange'}
                        borderRadius="full"
                        px={2}
                      >
                        {a.justificada ? 'Justificada' : 'No Justificada'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {!a.justificada && (
                        <Button size="xs" borderRadius="full" variant="outline"
                          onClick={async () => {
                            try {
                              await api.put(`/absences/${a.id}`, { justificada: true })
                              window.location.reload()
                            } catch {}
                          }}
                        >
                          Justificar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
