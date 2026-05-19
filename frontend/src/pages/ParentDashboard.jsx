import { useState, useEffect } from 'react'
import { Box, Flex, Text, Button, SimpleGrid, Card, Badge, VStack, NativeSelect, Separator } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MIN_PASSING_GRADE, GRADE_MAX } from '../constants/business'
import FeedbackBanner from '../components/molecules/FeedbackBanner'
import LoadingSpinner from '../components/molecules/LoadingSpinner'
import EmptyState from '../components/molecules/EmptyState'
import { useChildren, useChildSummary } from '../hooks'
import StaggerContainer from '../components/StaggerContainer'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hijos, loading, error: hijosError } = useChildren()
  const [hijoId, setHijoId] = useState('')
  const [feedback, setFeedback] = useState('')
  const { summary, loading: loadingSummary, error: summaryError } = useChildSummary(hijoId)

  // Auto-select first child when children load
  useEffect(() => {
    if (hijos.length > 0 && !hijoId) {
      setHijoId(hijos[0].id)
    }
  }, [hijos])

  const currentChild = hijos.find(h => h.id === parseInt(hijoId))
  const promGeneral = summary?.calificaciones?.promedio_general
  const tareasPendientes = summary?.tareas_pendientes?.total || 0
  const pctAusencia = summary?.inasistencias?.porcentaje || 0
  const riesgoRegularidad = summary?.inasistencias?.riesgo_regularidad || false
  const riesgoAcademico = summary?.calificaciones?.riesgo_academico || false

  if (loading) return <LoadingSpinner />

  if (hijos.length === 0) {
    return (
      <Box maxW="container-max" mx="auto">
        <EmptyState heading="Sin hijos registrados" message="No hay estudiantes vinculados a tu cuenta de tutor. Contactá a la administración." />
      </Box>
    )
  }

  return (
    <Box maxW="container-max" mx="auto">
      {/* Hero header */}
      <Card.Root
        bg="bg.card"
        borderRadius="xl"
        shadow="card"
        p={6}
        mb={6}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          right="-40px"
          top="-40px"
          w="160px"
          h="160px"
          borderRadius="full"
          bg="linear-gradient(135deg, {colors.primary-container}, {colors.secondary-container})"
          opacity={0.08}
        />
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Text textStyle="heading-xl" color="fg">
              {currentChild?.nombre || ''} {currentChild?.apellido || ''}
            </Text>
            <Text textStyle="body-lg" color="fg.muted">
              {currentChild?.curso || ''} · {summary?.estudiante?.dni || ''}
            </Text>
          </Box>
          {hijos.length > 1 && (
            <NativeSelect.Root size="lg" w="220px">
              <NativeSelect.Field
                value={hijoId}
                onChange={(e) => setHijoId(parseInt(e.target.value))}
              >
                {hijos.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.nombre} {h.apellido} — {h.curso}
                  </option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
          )}
        </Flex>
      </Card.Root>

      <FeedbackBanner feedback={feedback || summaryError} />
      {hijosError && (
        <Box mb={4} p={3} borderRadius="md" bg="error-container" color="on-error-container">
          <Text fontSize="sm">{hijosError}</Text>
        </Box>
      )}

      {loadingSummary ? (
        <LoadingSpinner py={10} />
      ) : summary ? (
        <>
          {/* Metrics cards */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={6}>
            <Card.Root
              as={motion.div}
              whileHover={{ y: -3, boxShadow: 'var(--chakra-shadows-card-hover)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              bg="bg.card" borderRadius="xl" shadow="card" p={5}
            >
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text textStyle="heading-xl" color="primary">
                    {summary.inasistencias.total}
                  </Text>
                  <Text textStyle="label-md" color="fg.muted">Inasistencias</Text>
                </Box>
                <Box w={10} h={10} borderRadius="full" bg="surface-container-low" display="flex" alignItems="center" justifyContent="center">
                  <Box as="span" className="material-symbols-outlined" color="primary">event_busy</Box>
                </Box>
              </Flex>
              <Flex gap={3} mt={3}>
                <Badge colorPalette="green" borderRadius="full">
                  {summary.inasistencias.justificadas} justif.
                </Badge>
                <Badge colorPalette="orange" borderRadius="full">
                  {summary.inasistencias.no_justificadas} no justif.
                </Badge>
              </Flex>
              {riesgoRegularidad && (
                <Badge colorPalette="red" borderRadius="full" mt={2}>Riesgo de regularidad</Badge>
              )}
            </Card.Root>

            <Card.Root
              as={motion.div}
              whileHover={{ y: -3, boxShadow: 'var(--chakra-shadows-card-hover)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              bg="bg.card" borderRadius="xl" shadow="card" p={5}
            >
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text
                    textStyle="heading-xl"
                    color={promGeneral !== null && promGeneral < MIN_PASSING_GRADE ? 'error' : 'secondary'}
                  >
                    {promGeneral !== null ? promGeneral.toFixed(1) : '—'}
                  </Text>
                  <Text textStyle="label-md" color="fg.muted">Promedio general</Text>
                </Box>
                <Box w={10} h={10} borderRadius="full" bg="surface-container-low" display="flex" alignItems="center" justifyContent="center">
                  <Box as="span" className="material-symbols-outlined" color="secondary">grade</Box>
                </Box>
              </Flex>
              {riesgoAcademico && (
                <Badge colorPalette="red" borderRadius="full" mt={2}>Riesgo académico</Badge>
              )}
            </Card.Root>

            <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={5}>
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text
                    textStyle="heading-xl"
                    color={tareasPendientes > 0 ? 'tertiary' : 'success'}
                  >
                    {tareasPendientes}
                  </Text>
                  <Text textStyle="label-md" color="fg.muted">Tareas pendientes</Text>
                </Box>
                <Box w={10} h={10} borderRadius="full" bg="surface-container-low" display="flex" alignItems="center" justifyContent="center">
                  <Box as="span" className="material-symbols-outlined" color={tareasPendientes > 0 ? 'tertiary' : 'success'}>assignment</Box>
                </Box>
              </Flex>
              {summary.tareas_pendientes.lista && (
                <Text textStyle="body-md" color="fg.muted" mt={1}>
                  {summary.tareas_pendientes.lista.filter(t => t.entregada).length} entregadas
                </Text>
              )}
            </Card.Root>

            <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={5}>
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text
                    textStyle="heading-xl"
                    color={riesgoRegularidad ? 'error' : 'success'}
                  >
                    {pctAusencia.toFixed(1)}%
                  </Text>
                  <Text textStyle="label-md" color="fg.muted">Ausencia total</Text>
                </Box>
                <Box w={10} h={10} borderRadius="full" bg="surface-container-low" display="flex" alignItems="center" justifyContent="center">
                  <Box as="span" className="material-symbols-outlined" color={riesgoRegularidad ? 'error' : 'success'}>monitoring</Box>
                </Box>
              </Flex>
            </Card.Root>
          </SimpleGrid>

          {/* Detail rows */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            {/* Grades by subject */}
            <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6}>
              <Text textStyle="heading-md" color="fg" mb={4}>Calificaciones por Materia</Text>
              {summary.calificaciones.materias?.length > 0 ? (
                <StaggerContainer
                  as="div"
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  {summary.calificaciones.materias.map((m) => (
                    <StaggerContainer.Item key={m.materia}>
                      <Box w="full">
                      <Flex justify="space-between" mb={1}>
                        <Text textStyle="body-md" fontWeight="medium" color="fg">{m.materia}</Text>
                        <Flex gap={2} align="center">
                          {m.criticas > 0 && (
                            <Badge colorPalette="red" borderRadius="full" size="sm">
                              {m.criticas} crítica(s)
                            </Badge>
                          )}
                          <Text fontWeight="bold" color={m.promedio < MIN_PASSING_GRADE ? 'error' : 'primary'}>
                            {m.promedio.toFixed(1)}
                          </Text>
                        </Flex>
                      </Flex>
                      <Box w="full" h="6px" bg="surface-container" borderRadius="full" overflow="hidden">
                        <Box
                          h="full"
                          borderRadius="full"
                          bg={m.promedio < MIN_PASSING_GRADE ? 'error' : 'primary-container'}
                          w={`${(m.promedio / GRADE_MAX) * 100}%`}
                          transition="width 0.5s"
                        />
                      </Box>
                    </Box>
                      </StaggerContainer.Item>
                    ))}
                  </StaggerContainer>
              ) : (
                <Text textStyle="body-md" color="fg.muted">Sin calificaciones registradas</Text>
              )}
            </Card.Root>

            {/* Pending tasks */}
            <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6}>
              <Text textStyle="heading-md" color="fg" mb={4}>Tareas Pendientes</Text>
              {summary.tareas_pendientes.lista?.length > 0 ? (
                <StaggerContainer
                  as="div"
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  {summary.tareas_pendientes.lista.map((t) => (
                    <StaggerContainer.Item key={t.id}>
                      <Flex
                      key={t.id}
                      justify="space-between"
                      align="center"
                      p={3}
                      borderRadius="xl"
                      bg={t.entregada ? 'surface-container-low' : 'warning-container'}
                      w="full"
                    >
                      <Box flex={1} minW={0}>
                        <Text fontWeight="medium" color="fg" truncate>{t.nombre}</Text>
                        <Text textStyle="body-sm" color="fg.muted">
                          {t.materia} · Entrega: {new Date(t.fecha_entrega).toLocaleDateString('es-AR')}
                        </Text>
                      </Box>
                      <Badge
                        colorPalette={t.entregada ? 'green' : 'orange'}
                        borderRadius="full"
                        ml={2}
                        flexShrink={0}
                      >
                        {t.entregada ? 'Entregada' : 'Pendiente'}
                      </Badge>
                    </Flex>
                      </StaggerContainer.Item>
                    ))}
                  </StaggerContainer>
              ) : (
                <Text textStyle="body-md" color="fg.muted">
                  {tareasPendientes === 0 ? '¡Todas las tareas están al día!' : 'Sin información de tareas'}
                </Text>
              )}

              <Separator my={4} />

              <Button
                variant="ghost"
                borderRadius="full"
                w="full"
                onClick={() => navigate(`/analytics?student=${summary.estudiante.id}`)}
              >
                Ver analítica completa →
              </Button>
            </Card.Root>
          </SimpleGrid>
        </>
      ) : (
        <EmptyState heading="Sin datos disponibles" message="No se pudo cargar la informaci\u00f3n del alumno." />
      )}
    </Box>
  )
}
