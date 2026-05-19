import { useState, useEffect } from 'react'
import { Box, Flex, Text, Button, Card, Badge, SimpleGrid, VStack, Input } from '@chakra-ui/react'
import { useSearchParams } from 'react-router-dom'
import { MIN_PASSING_GRADE, MIN_CHART_DATA_POINTS, MONTHLY_UNEXCUSED_ALERT } from '../constants/business'
import TrendChart from '../components/atoms/TrendChart'
import LoadingSpinner from '../components/molecules/LoadingSpinner'
import EmptyState from '../components/molecules/EmptyState'
import { useAnalytics } from '../hooks'

/* ── Main page ── */
export default function AnalyticsDashboard() {
  const [searchParams] = useSearchParams()
  const studentIdFromUrl = searchParams.get('student')

  const [studentInput, setStudentInput] = useState(studentIdFromUrl || '')
  const [activeStudentId, setActiveStudentId] = useState(studentIdFromUrl ? parseInt(studentIdFromUrl) : null)
  const { data, loading, error } = useAnalytics(activeStudentId)
  const [inputError, setInputError] = useState('')
  const [activeTab, setActiveTab] = useState('grades')
  const [selectedSubject, setSelectedSubject] = useState(null)

  // Reset selected subject when student changes
  useEffect(() => { setSelectedSubject(null) }, [activeStudentId])

  // Auto-load if studentIdFromUrl is present
  useEffect(() => {
    if (studentIdFromUrl) {
      setStudentInput(studentIdFromUrl)
      setActiveStudentId(parseInt(studentIdFromUrl))
    }
  }, [studentIdFromUrl])

  const handleSearch = () => {
    const id = parseInt(studentInput)
    if (!id || isNaN(id)) {
      setInputError('Ingres\u00e1 un ID de estudiante v\u00e1lido')
      return
    }
    setInputError('')
    setActiveStudentId(id)
  }

  // Subjects for filter
  const allSubjects = data?.calificaciones?.materias || []
  const subjects = selectedSubject
    ? allSubjects.filter(s => s.materia === selectedSubject)
    : allSubjects

  // Chart data
  const chartData = activeTab === 'grades'
    ? subjects
    : null

  const monthlyData = data?.inasistencias?.evolucion_mensual || []
  const attendanceChartData = monthlyData.map(m => m.total)
  const attendanceMonths = monthlyData.map(m => {
    const [, mes] = m.mes.split('-')
    const nombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return nombres[parseInt(mes) - 1] || m.mes
  })

  return (
    <Box maxW="container-max" mx="auto">
      {/* Header */}
      <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ lg: 'flex-end' }} gap={6} mb={6}>
        <Box>
          <Text textStyle="heading-xl" color="fg" mb={1}>Tablero Analítico</Text>
          <Text textStyle="body-md" color="fg.muted">
            {data
              ? `${data.estudiante.nombre} ${data.estudiante.apellido} · ${data.estudiante.curso} · DNI ${data.estudiante.dni}`
              : 'Rendimiento académico, asistencias y alertas por estudiante'}
          </Text>
        </Box>
      </Flex>

      {/* Student selector */}
      <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6} mb={6}>
        <Flex gap={4} align={{ base: 'stretch', md: 'flex-end' }} direction={{ base: 'column', md: 'row' }}>
          <Box flex={1}>
            <Text textStyle="label-md" color="fg.muted" mb={1}>ID del Estudiante</Text>
            <Input
              placeholder="Ej: 1, 2, 3..."
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              borderRadius="full"
              borderColor="border.default"
              bg="bg"
              _focus={{ ring: 2, ringColor: 'primary-container' }}
            />
          </Box>
          <Button
            borderRadius="full"
            bg="primary"
            color="white"
            _hover={{ bg: 'primary-container' }}
            onClick={handleSearch}
            loading={loading}
            px={8}
          >
            Cargar
          </Button>
        </Flex>
      </Card.Root>

      {(error || inputError) && (
        <Box mb={4} p={3} borderRadius="full" bg="error-container" color="on-error-container" textStyle="body-md" fontWeight="medium">
          ❌ {error || inputError}
        </Box>
      )}

      {loading && <LoadingSpinner py={10} />}

      {data && !loading && (
        <>
          {/* Alerts banner */}
          {data.resumen_alertas?.total > 0 && (
            <Card.Root bg="error-container" borderRadius="xl" shadow="card" p={4} mb={6}>
              <Flex align="center" gap={3} wrap="wrap">
                <Badge colorPalette="red" borderRadius="full" px={3} py={1}>
                  {data.resumen_alertas.total} alerta(s) activa(s)
                </Badge>
                <Text textStyle="body-md" color="on-error-container" fontWeight="medium">
                  {data.resumen_alertas.items.map(a => a.descripcion).join(' · ')}
                </Text>
              </Flex>
            </Card.Root>
          )}

          {/* Tabs */}
          <Flex bg="surface-container-low" p={1} borderRadius="full" mb={6} w="fit-content">
            <Button
              variant="ghost" borderRadius="full"
              bg={activeTab === 'grades' ? 'primary' : 'transparent'}
              color={activeTab === 'grades' ? 'white' : 'fg'}
              fontWeight={activeTab === 'grades' ? 'bold' : 'normal'}
              fontSize="sm" px={6} py={2} h="auto" minH="44px"
              _hover={{ bg: activeTab === 'grades' ? 'primary' : 'surface-container-high' }}
              onClick={() => setActiveTab('grades')}
            >
              CALIFICACIONES
            </Button>
            <Button
              variant="ghost" borderRadius="full"
              bg={activeTab === 'attendance' ? 'primary' : 'transparent'}
              color={activeTab === 'attendance' ? 'white' : 'fg'}
              fontWeight={activeTab === 'attendance' ? 'bold' : 'normal'}
              fontSize="sm" px={6} py={2} h="auto" minH="44px"
              _hover={{ bg: activeTab === 'attendance' ? 'primary' : 'surface-container-high' }}
              onClick={() => setActiveTab('attendance')}
            >
              ASISTENCIAS
            </Button>
          </Flex>

          {/* ── GRADES TAB ── */}
          {activeTab === 'grades' && (
            <VStack gap={6} align="stretch">
              {/* Subject selector */}
              {allSubjects.length > 1 && (
                <Flex wrap="wrap" gap={2}>
                  <Button
                    variant="ghost" borderRadius="full" fontSize="sm" px={4} py={1} h="auto" minH="32px"
                    bg={!selectedSubject ? 'primary' : 'surface-container-low'}
                    color={!selectedSubject ? 'white' : 'fg'}
                    onClick={() => setSelectedSubject(null)}
                  >
                    Todas
                  </Button>
                  {allSubjects.map(s => (
                    <Button
                      key={s.materia}
                      variant="ghost" borderRadius="full" fontSize="sm" px={4} py={1} h="auto" minH="32px"
                      bg={selectedSubject === s.materia ? 'primary' : 'surface-container-low'}
                      color={selectedSubject === s.materia ? 'white' : 'fg'}
                      onClick={() => setSelectedSubject(s.materia)}
                    >
                      {s.materia}
                    </Button>
                  ))}
                </Flex>
              )}

              {/* Chart */}
              {chartData && chartData.length > 0 && (
                <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6}>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text textStyle="heading-md" color="fg">
                      {selectedSubject ? `Evolución — ${selectedSubject}` : 'Evolución de Calificaciones'}
                    </Text>
                    <Badge borderRadius="full" colorPalette="blue">Escala 1-10</Badge>
                  </Flex>
                  {(() => {
                    // Find the selected subject's evolution data
                    const subjectData = selectedSubject
                      ? chartData.find(s => s.materia === selectedSubject)
                      : chartData[0]
                    if (!subjectData) return <Text color="fg.muted">Sin datos de evolución</Text>
                    const evol = subjectData.evolucion || []
                    const pts = evol.map(e => e.nota)
                    const lbs = evol.map(e => {
                      const d = new Date(e.fecha)
                      return `${d.getDate()}/${d.getMonth() + 1}`
                    })
                    if (pts.length < MIN_CHART_DATA_POINTS) return <Text textStyle="body-md" color="fg.muted" py={4}>Se necesitan al menos {MIN_CHART_DATA_POINTS} calificaciones para mostrar evolución</Text>
                    return <TrendChart data={pts} months={lbs} />
                  })()}
                </Card.Root>
              )}

              {/* Summary table */}
              <Card.Root bg="bg.card" borderRadius="xl" shadow="card" overflow="hidden">
                <Box bg="surface-container-low" borderBottom="1px solid" borderColor="border.default" px={6} py={4}>
                  <Text textStyle="heading-md" color="fg">Resumen por Materia</Text>
                </Box>
                <Box overflowX="auto">
                  <Box as="table" w="full" sx={{ borderCollapse: 'collapse' }}>
                    <Box as="thead">
                      <Box as="tr" borderBottom="1px solid" borderColor="border.default" bg="surface-container-high">
                        <Box as="th" textStyle="label-md" color="fg.muted" textAlign="left" px={5} py={3.5}>Materia</Box>
                        <Box as="th" textStyle="label-md" color="fg.muted" textAlign="right" px={5} py={3.5}>Promedio</Box>
                        <Box as="th" textStyle="label-md" color="fg.muted" textAlign="center" px={5} py={3.5}>Notas</Box>
                        <Box as="th" textStyle="label-md" color="fg.muted" textAlign="center" px={5} py={3.5}>Críticas</Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {allSubjects.length > 0 ? allSubjects.map((s, i) => (
                        <Box as="tr" key={s.materia}
                          borderBottom={i < allSubjects.length - 1 ? '1px solid' : 'none'}
                          borderColor="border.default"
                          bg={s.criticas > 0 ? 'error-container' : 'transparent'}
                          _hover={{ bg: s.criticas > 0 ? 'error-container' : 'surface-variant' }}
                        >
                          <Box as="td" px={5} py={3.5}>
                            <Flex align="center" gap={3}>
                              <Box w={2} h={2} borderRadius="full" bg={s.promedio < MIN_PASSING_GRADE ? 'error' : 'primary'} flexShrink={0} />
                              <Text color={s.criticas > 0 ? 'on-error-container' : 'fg'} fontWeight="medium">{s.materia}</Text>
                            </Flex>
                          </Box>
                          <Box as="td" px={5} py={3.5} textAlign="right">
                            <Text fontWeight="bold" color={s.promedio < MIN_PASSING_GRADE ? 'error' : 'fg'}>{s.promedio.toFixed(1)}</Text>
                          </Box>
                          <Box as="td" px={5} py={3.5} textAlign="center">
                            <Text color="fg.muted">{s.cantidad_notas}</Text>
                          </Box>
                          <Box as="td" px={5} py={3.5} textAlign="center">
                            {s.criticas > 0 ? (
                              <Badge colorPalette="red" borderRadius="full">{s.criticas}</Badge>
                            ) : (
                              <Text color="fg.muted">—</Text>
                            )}
                          </Box>
                        </Box>
                      )) : (
                        <Box as="tr">
                          <Box as="td" px={5} py={6} textAlign="center" colSpan={4} color="fg.muted">
                            No hay calificaciones registradas
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Card.Root>
            </VStack>
          )}

          {/* ── ATTENDANCE TAB ── */}
          {activeTab === 'attendance' && (
            <VStack gap={6} align="stretch">
              {/* Stats cards */}
              <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
                <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={5}>
                  <Text textStyle="heading-xl" color="primary">{data.inasistencias.total}</Text>
                  <Text textStyle="label-md" color="fg.muted">Total ausencias</Text>
                </Card.Root>
                <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={5}>
                  <Text textStyle="heading-xl" color="success">{data.inasistencias.justificadas}</Text>
                  <Text textStyle="label-md" color="fg.muted">Justificadas</Text>
                </Card.Root>
                <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={5}>
                  <Text textStyle="heading-xl" color="tertiary">{data.inasistencias.no_justificadas}</Text>
                  <Text textStyle="label-md" color="fg.muted">No justificadas</Text>
                </Card.Root>
              </SimpleGrid>

              {/* Attendance chart */}
              {monthlyData.length >= MIN_CHART_DATA_POINTS && (
                <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6}>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Text textStyle="heading-md" color="fg">Evolución Mensual de Inasistencias</Text>
                    <Badge borderRadius="full" colorPalette="orange">Total: {data.inasistencias.porcentaje}%</Badge>
                  </Flex>
                  <TrendChart data={attendanceChartData} months={attendanceMonths} color="var(--chakra-colors-primary)" gradientId="att-grad" />
                </Card.Root>
              )}

              {/* Monthly table */}
              {monthlyData.length > 0 && (
                <Card.Root bg="bg.card" borderRadius="xl" shadow="card" overflow="hidden">
                  <Box bg="surface-container-low" borderBottom="1px solid" borderColor="border.default" px={6} py={4}>
                    <Text textStyle="heading-md" color="fg">Detalle Mensual</Text>
                  </Box>
                  <Box overflowX="auto">
                    <Box as="table" w="full" sx={{ borderCollapse: 'collapse' }}>
                      <Box as="thead">
                        <Box as="tr" borderBottom="1px solid" borderColor="border.default" bg="surface-container-high">
                          <Box as="th" textStyle="label-md" color="fg.muted" textAlign="left" px={5} py={3.5}>Mes</Box>
                          <Box as="th" textStyle="label-md" color="fg.muted" textAlign="right" px={5} py={3.5}>Total</Box>
                          <Box as="th" textStyle="label-md" color="fg.muted" textAlign="center" px={5} py={3.5}>Justificadas</Box>
                          <Box as="th" textStyle="label-md" color="fg.muted" textAlign="center" px={5} py={3.5}>No justificadas</Box>
                        </Box>
                      </Box>
                      <Box as="tbody">
                        {monthlyData.map((m, i) => (
                          <Box as="tr" key={m.mes}
                            borderBottom={i < monthlyData.length - 1 ? '1px solid' : 'none'}
                            borderColor="border.default"
                            bg={m.no_justificadas >= MONTHLY_UNEXCUSED_ALERT ? 'error-container' : 'transparent'}
                          >
                            <Box as="td" px={5} py={3.5}>
                              <Text fontWeight="medium" color="fg">{m.mes}</Text>
                            </Box>
                            <Box as="td" px={5} py={3.5} textAlign="right">
                              <Text fontWeight="bold" color="fg">{m.total}</Text>
                            </Box>
                            <Box as="td" px={5} py={3.5} textAlign="center">
                              <Badge colorPalette="green" borderRadius="full">{m.justificadas}</Badge>
                            </Box>
                            <Box as="td" px={5} py={3.5} textAlign="center">
                              <Badge colorPalette={m.no_justificadas >= MONTHLY_UNEXCUSED_ALERT ? 'red' : 'orange'} borderRadius="full">
                                {m.no_justificadas}
                                {m.no_justificadas >= MONTHLY_UNEXCUSED_ALERT && ' ⚠'}
                              </Badge>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Card.Root>
              )}
            </VStack>
          )}
        </>
      )}

      {!data && !loading && !error && (
        <EmptyState
          heading="Seleccion\u00e1 un estudiante"
          message='Ingres\u00e9 el ID del estudiante y presion\u00e1 "Cargar" para ver su anal\u00edtica completa.'
        />
      )}
    </Box>
  )
}
