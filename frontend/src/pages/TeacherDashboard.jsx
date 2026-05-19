import { useState } from 'react'
import { Box, Flex, Text, Button, SimpleGrid, Card, Badge, VStack, NativeSelect, Separator } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TOP_ABSENTEES_LIMIT, CRITICAL_GRADES_LIMIT, LOW_AVERAGE_LIMIT, HIGH_ABSENCE_THRESHOLD, LOW_LICENSE_DAYS } from '../constants/business'
import FeedbackBanner from '../components/molecules/FeedbackBanner'
import LoadingSpinner from '../components/molecules/LoadingSpinner'
import { useTeacherDashboard } from '../hooks'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cursoId, setCursoId] = useState('')
  const { cursos, absences, license, criticalGrades, lowAverage, recentTasks, loading, error } = useTeacherDashboard()

  // Compute absence stats for selected course
  const selectedCursoName = cursoId
    ? cursos.find(c => c.id === parseInt(cursoId))?.name || ''
    : ''
  const selectedCurso = absences?.cursos?.find(c => c.curso === selectedCursoName)
  const totalAusencias = absences?.cursos?.reduce((sum, c) => sum + c.estudiantes.reduce((s, e) => s + e.total_ausencias, 0), 0) || 0
  const totalEstudiantes = absences?.cursos?.reduce((sum, c) => sum + (c.total_estudiantes || 0), 0) || 0
  const ausenciasCurso = selectedCurso?.estudiantes?.reduce((s, e) => s + e.total_ausencias, 0) || 0
  // Students with most absences (top 6 across all courses)
  const allStudents = (absences?.cursos || []).flatMap(c =>
    (c.estudiantes || []).map(e => ({ ...e, curso: c.curso }))
  )
  const sortedRiesgo = [...allStudents]
    .sort((a, b) => b.total_ausencias - a.total_ausencias)
    .slice(0, TOP_ABSENTEES_LIMIT)

  if (loading) return <LoadingSpinner />

  return (
    <Box maxW="container-max" mx="auto">
      <Text textStyle="heading-xl" color="fg" mb={2}>Panel del Docente</Text>
      <Text textStyle="body-md" color="fg.muted" mb={6}>
        Bienvenido, {user?.nombre || user?.email || 'docente'} — resumen de tus cursos y métricas
      </Text>

      <FeedbackBanner feedback={error ? `❌ ${error}` : ''} />

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
        {/* ── LEFT COLUMN (span 2) ── */}
        <Box gridColumn={{ lg: 'span 2' }}>
          {/* Stats overview */}
          <SimpleGrid columns={{ base: 1, md: 4 }} gap={4} mb={6}>
            <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={4}>
              <Text textStyle="heading-lg" color="primary">{absences?.cursos?.length || 0}</Text>
              <Text textStyle="label-md" color="fg.muted">Cursos a cargo</Text>
            </Card.Root>
            <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={4}>
              <Text textStyle="heading-lg" color="primary">{totalEstudiantes}</Text>
              <Text textStyle="label-md" color="fg.muted">Estudiantes totales</Text>
            </Card.Root>
            <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={4}>
              <Text textStyle="heading-lg" color={criticalGrades.length > 0 ? 'error' : 'success'}>{criticalGrades.length}</Text>
              <Text textStyle="label-md" color="fg.muted">Notas críticas (≤4)</Text>
            </Card.Root>
            <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={4}>
              <Text textStyle="heading-lg" color={lowAverage.length > 0 ? 'error' : 'success'}>{lowAverage.length}</Text>
              <Text textStyle="label-md" color="fg.muted">Promedio bajo (&lt;6)</Text>
            </Card.Root>
          </SimpleGrid>

          {/* Absences by course */}
          <Card.Root bg="bg.card" borderRadius="xl" shadow="card" mb={6}>
            <Card.Body p={6}>
              <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
                <Text textStyle="heading-md" color="fg">Inasistencias por Curso</Text>
                <NativeSelect.Root size="sm" w="180px">
                  <NativeSelect.Field
                    value={cursoId}
                    placeholder="Todos los cursos"
                    onChange={(e) => setCursoId(e.target.value)}
                  >
                    {(cursos || []).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Flex>

              {/* Selected course stats */}
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={4}>
                <Box bg="surface-container-low" borderRadius="xl" p={4}>
                  <Text textStyle="heading-lg" color="primary">
                    {cursoId ? ausenciasCurso : totalAusencias}
                  </Text>
                  <Text textStyle="label-md" color="fg.muted">Ausencias totales</Text>
                </Box>
                <Box bg="surface-container-low" borderRadius="xl" p={4}>
                  <Text textStyle="heading-lg" color="success">
                    {selectedCurso
                      ? selectedCurso.estudiantes.reduce((s, e) => s + e.justificadas, 0)
                      : '—'}
                  </Text>
                  <Text textStyle="label-md" color="fg.muted">Justificadas</Text>
                </Box>
                <Box bg="surface-container-low" borderRadius="xl" p={4}>
                  <Text textStyle="heading-lg" color="tertiary">
                    {selectedCurso
                      ? selectedCurso.estudiantes.reduce((s, e) => s + e.no_justificadas, 0)
                      : '—'}
                  </Text>
                  <Text textStyle="label-md" color="fg.muted">No justificadas</Text>
                </Box>
              </SimpleGrid>

              {/* Students with most absences */}
              {sortedRiesgo.length > 0 && (
                <Box>
                  <Text textStyle="label-md" color="fg.muted" mb={2}>
                    Alumnos con más ausencias
                    {cursoId && ` — ${selectedCurso?.curso || 'curso seleccionado'}`}
                  </Text>
                  <Box as={motion.div} initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
                    {sortedRiesgo.map((s, i) => (
                      <Flex
                        key={s.id || i}
                        as={motion.div}
                        variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
                        whileHover={{ scale: 1.01, x: 4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        justify="space-between"
                        align="center"
                        p={3}
                        borderRadius="full"
                        bg={s.total_ausencias > HIGH_ABSENCE_THRESHOLD ? 'error-container' : 'warning-container'}
                        mb={2}
                        cursor="pointer"
                        _hover={{ opacity: 0.9 }}
                        onClick={() => navigate(`/analytics?student=${s.id}`)}
                      >
                        <Text fontWeight="medium" color={s.total_ausencias > HIGH_ABSENCE_THRESHOLD ? 'on-error-container' : undefined}>
                          {s.apellido}, {s.nombre}
                          <Text as="span" textStyle="body-sm" color="fg.muted" ml={2}>({s.curso})</Text>
                        </Text>
                        <Badge colorPalette={s.total_ausencias > HIGH_ABSENCE_THRESHOLD ? 'red' : 'orange'} borderRadius="full">
                          {s.total_ausencias} ausencias
                        </Badge>
                      </Flex>
                    ))}
                  </Box>
                </Box>
              )}

              {!selectedCurso && absences?.cursos?.length > 0 && (
                <Flex mt={2} justify="center">
                  <Text textStyle="body-sm" color="fg.muted">Seleccioná un curso para ver detalle</Text>
                </Flex>
              )}
            </Card.Body>
          </Card.Root>

          {/* Critical grades & low average */}
          {(criticalGrades.length > 0 || lowAverage.length > 0) && (
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={6}>
              {criticalGrades.length > 0 && (
                <Card.Root bg="bg.card" borderRadius="xl" shadow="card">
                  <Card.Body p={6}>
                    <Text textStyle="heading-md" color="fg" mb={3}>Notas Críticas (≤4)</Text>
                    <VStack gap={2} align="stretch">
                      {criticalGrades.slice(0, CRITICAL_GRADES_LIMIT).map((g, i) => (
                        <Flex key={g.id || i} justify="space-between" p={2} borderRadius="full" bg="error-container">
                          <Text fontWeight="medium" color="on-error-container" fontSize="sm">
                            {g.estudiante || g.alumno || `Estudiante #${g.estudiante_id}`}
                          </Text>
                          <Badge colorPalette="red" borderRadius="full">{g.nota || g.calificacion}</Badge>
                        </Flex>
                      ))}
                      {criticalGrades.length > CRITICAL_GRADES_LIMIT && (
                        <Button variant="ghost" size="sm" borderRadius="full" onClick={() => navigate('/grades/overview')}>
                          Ver todas ({criticalGrades.length})
                        </Button>
                      )}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}
              {lowAverage.length > 0 && (
                <Card.Root bg="bg.card" borderRadius="xl" shadow="card">
                  <Card.Body p={6}>
                    <Text textStyle="heading-md" color="fg" mb={3}>Promedio Bajo (&lt;6)</Text>
                    <VStack gap={2} align="stretch">
                      {lowAverage.slice(0, LOW_AVERAGE_LIMIT).map((s, i) => (
                        <Flex key={s.id || i} justify="space-between" p={2} borderRadius="full" bg="warning-container">
                          <Text fontWeight="medium" fontSize="sm">
                            {s.apellido}, {s.nombre}
                          </Text>
                          <Badge colorPalette="orange" borderRadius="full">{s.promedio}</Badge>
                        </Flex>
                      ))}
                      {lowAverage.length > LOW_AVERAGE_LIMIT && (
                        <Button variant="ghost" size="sm" borderRadius="full" onClick={() => navigate('/grades/overview')}>
                          Ver todos ({lowAverage.length})
                        </Button>
                      )}
                    </VStack>
                  </Card.Body>
                </Card.Root>
              )}
            </SimpleGrid>
          )}
        </Box>

        {/* ── RIGHT COLUMN ── */}
        <Box>
          {/* License status */}
          <Card.Root bg="bg.card" borderRadius="xl" shadow="card" mb={6}>
            <Card.Body p={6}>
              <Text textStyle="heading-md" color="fg" mb={4}>Licencias</Text>

              {license ? (
                <>
                  <VStack gap={3} mb={4}>
                    <Flex justify="space-between" w="full">
                      <Text textStyle="body-md" color="fg.muted">Disponibles</Text>
                      <Text fontWeight="bold" color="fg">{license.dias_licencia_total} días</Text>
                    </Flex>
                    <Flex justify="space-between" w="full">
                      <Text textStyle="body-md" color="fg.muted">Usados</Text>
                      <Text fontWeight="bold" color="fg">{license.dias_usados} días</Text>
                    </Flex>
                    <Flex justify="space-between" w="full">
                      <Text textStyle="body-md" color="fg.muted">Restantes</Text>
                      <Text
                        fontWeight="bold"
                        color={license.dias_restantes <= LOW_LICENSE_DAYS ? 'error' : 'success'}
                      >
                        {license.dias_restantes} días
                      </Text>
                    </Flex>
                  </VStack>

                  <Box w="full" h="8px" bg="surface-container" borderRadius="full" overflow="hidden">
                    <Box
                      h="full"
                      borderRadius="full"
                      bg={license.dias_restantes <= LOW_LICENSE_DAYS ? 'error' : 'success'}
                      w={`${(license.dias_usados / license.dias_licencia_total) * 100}%`}
                      transition="width 0.3s"
                    />
                  </Box>

                  {license.alerta_por_vencimiento && (
                    <Flex mt={4} p={3} borderRadius="full" bg="error-container" color="on-error-container" align="center" gap={2}>
                      <Text fontWeight="medium" fontSize="sm">
                        ⚠ Quedan solo {license.dias_restantes} días de licencia
                      </Text>
                    </Flex>
                  )}
                </>
              ) : (
                <Text textStyle="body-md" color="fg.muted">No se pudo cargar información de licencias</Text>
              )}
            </Card.Body>
          </Card.Root>

          {/* Recent tasks */}
          <Card.Root bg="bg.card" borderRadius="xl" shadow="card">
            <Card.Body p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text textStyle="heading-md" color="fg">Tareas Recientes</Text>
                <Button variant="ghost" size="sm" borderRadius="full" onClick={() => navigate('/tasks')}>
                  Ver todas
                </Button>
              </Flex>

              {recentTasks.length > 0 ? (
                <VStack gap={3} align="stretch">
                  {recentTasks.map(task => {
                    const vencida = new Date(task.fecha_entrega) < new Date()
                    return (
                      <Flex
                        key={task.id}
                        justify="space-between"
                        align="center"
                        p={3}
                        borderRadius="xl"
                        bg="surface-container-low"
                        cursor="pointer"
                        _hover={{ bg: 'surface-container' }}
                        onClick={() => navigate(`/tasks/${task.id}/tracking`)}
                      >
                        <Box flex={1} minW={0}>
                          <Text fontWeight="medium" color="fg" truncate>{task.nombre}</Text>
                          <Text textStyle="body-sm" color="fg.muted">{task.materia}</Text>
                        </Box>
                        <Badge
                          colorPalette={vencida ? 'orange' : 'blue'}
                          borderRadius="full"
                          flexShrink={0}
                          ml={2}
                        >
                          {vencida ? 'Vencida' : 'Activa'}
                        </Badge>
                      </Flex>
                    )
                  })}
                </VStack>
              ) : (
                <Text textStyle="body-md" color="fg.muted">No hay tareas recientes</Text>
              )}
            </Card.Body>
          </Card.Root>
        </Box>
      </SimpleGrid>
    </Box>
  )
}
