import { useState, useMemo } from 'react'
import { Box, Flex, Text, Button, VStack, SimpleGrid, Card, Badge, NativeSelect, Table, Checkbox, IconButton } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

// Normaliza texto: quita acentos/diacríticos y pasa a minúsculas
const normalize = (str) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function AbsenceRegister() {
  const navigate = useNavigate()
  const [cursoId, setCursoId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [sortBy, setSortBy] = useState('apellido') // 'apellido' | 'nombre' | 'dni'
  const [sortOrder, setSortOrder] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const processedStudents = useMemo(() => {
    // Search filter (insensitive a mayúsculas, acentos y diacríticos)
    const q = normalize(searchQuery)
    let filtered = students
    if (q) {
      filtered = students.filter(s =>
        normalize(s.apellido).includes(q) ||
        normalize(s.nombre).includes(q) ||
        normalize(s.dni).includes(q)
      )
    }
    // Sort
    return [...filtered].sort((a, b) => {
      const field = sortBy === 'dni' ? 'dni' : sortBy === 'nombre' ? 'nombre' : 'apellido'
      const cmp = (a[field] || '').localeCompare(b[field] || '', 'es')
      return sortOrder === 'asc' ? cmp : -cmp
    })
  }, [students, sortBy, sortOrder, searchQuery])

  const cursos = [
    { id: 1, name: '1° A' },
    { id: 2, name: '1° B' },
  ]

  const loadStudents = async () => {
    if (!cursoId) return
    setLoading(true)
    setFeedback('')
    try {
      const { data } = await api.get(`/absences/course/${cursoId}?fecha=${fecha}`)
      setStudents(data.estudiantes || [])
      setSelected([])
    } catch {
      setFeedback('Error al cargar alumnos')
    } finally {
      setLoading(false)
    }
  }

  const toggleStudent = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const submit = async () => {
    if (!cursoId || selected.length === 0) {
      setFeedback('Seleccioná un curso y al menos un alumno')
      return
    }
    setSubmitting(true)
    setFeedback('')
    try {
      const { data } = await api.post('/absences/register', {
        estudiante_ids: selected,
        fecha,
        curso_id: parseInt(cursoId),
      })
      setFeedback(`✅ ${data.registradas} inasistencia(s) registrada(s)`)
      loadStudents()
    } catch (err) {
      setFeedback(`❌ ${err.response?.data?.message || 'Error al registrar'}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box maxW="container-max" mx="auto">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Text textStyle="heading-xl" color="fg">Registro de Inasistencias</Text>
          <Text textStyle="body-md" color="fg.muted">Seleccioná el curso y marcá los alumnos ausentes</Text>
        </Box>
        <Button
          className="gradient-btn"
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
          onClick={() => navigate('/absences/student/1')}
        >
          Ver Historial
        </Button>
      </Flex>

      {/* Feedback */}
      {feedback && (
        <Box mb={4} p={3} borderRadius="full" bg={feedback.startsWith('✅') ? 'success-container' : feedback.startsWith('❌') ? 'error-container' : 'surface-container'} color={feedback.startsWith('✅') ? 'on-success-container' : feedback.startsWith('❌') ? 'on-error-container' : 'fg'} textStyle="body-md" fontWeight="medium">
          {feedback}
        </Box>
      )}

      {/* Filters */}
      <Card.Root bg="bg.card" borderRadius="xl" shadow="card" mb={6}>
        <Card.Body p={6}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <Box>
              <Text textStyle="label-md" color="fg.muted" mb={1}>Curso</Text>
              <NativeSelect.Root size="lg">
                <NativeSelect.Field
                  placeholder="Seleccionar curso"
                  value={cursoId}
                  onChange={(e) => setCursoId(e.target.value)}
                >
                  {cursos.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>
            <Box>
              <Text textStyle="label-md" color="fg.muted" mb={1}>Fecha</Text>
              <Box
                as="input"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                w="full"
                p={3}
                borderRadius="full"
                border="1px solid"
                borderColor="border.default"
                bg="surface-container-low"
                textStyle="body-md"
                _focus={{ outline: 'none', ring: 2, ringColor: 'primary-container' }}
              />
            </Box>
            <Box alignSelf="flex-end">
              <Button
                w="full"
                borderRadius="full"
                bg="primary"
                color="white"
                _hover={{ bg: 'primary-container' }}
                onClick={loadStudents}
                loading={loading}
              >
                Cargar Alumnos
              </Button>
            </Box>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {/* Search bar — visible whenever students are loaded */}
      {students.length > 0 && (
        <Box mb={4}>
          <Box position="relative" maxW="md">
            <Box
              as="span"
              className="material-symbols-outlined"
              position="absolute"
              left={4}
              top="50%"
              transform="translateY(-50%)"
              color="on-surface-variant"
              fontSize="20px"
              pointerEvents="none"
            >
              search
            </Box>
            <Box
              as="input"
              type="text"
              placeholder="Buscar por apellido, nombre o DNI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              w="full"
              pl={12}
              pr={4}
              py={3}
              borderRadius="full"
              border="1px solid"
              borderColor="border.default"
              bg="surface-container-low"
              fontFamily="body"
              fontSize="md"
              outline="none"
              transition="all 0.2s ease-out"
              _focus={{
                bg: 'surface-container-lowest',
                boxShadow: '0 0 0 2px #ab3500',
                borderColor: '#ab3500',
              }}
              sx={{ '&::placeholder': { color: '#594139', opacity: 0.6 } }}
            />
          </Box>
        </Box>
      )}

      {/* Student table */}
      {processedStudents.length > 0 && (
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card">
          <Card.Body p={0}>
            <Box overflowX="auto">
              <Table.Root>
                <Table.Header>
                  <Table.Row bg="surface-container-low">
                    <Table.ColumnHeader px={4} py={3} w="50px">
                      <Checkbox.Root
                        checked={processedStudents.length > 0 && selected.length === processedStudents.length}
                        onCheckedChange={(e) => {
                          if (e.checked) setSelected(processedStudents.map(s => s.id))
                          else setSelected([])
                        }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                      </Checkbox.Root>
                    </Table.ColumnHeader>
                    {['apellido', 'nombre', 'dni'].map((col) => (
                      <Table.ColumnHeader key={col} px={4} py={3}>
                        <Flex as="span" align="center" gap={2}>
                          {col === 'apellido' ? 'Apellido' : col === 'nombre' ? 'Nombre' : 'DNI'}
                          <IconButton
                            aria-label={`Ordenar por ${col}`}
                            variant="ghost"
                            size="xs"
                            borderRadius="full"
                            color={sortBy === col ? 'primary' : 'fg.muted'}
                            fontWeight={sortBy === col ? 'bold' : 'normal'}
                            onClick={() => toggleSort(col)}
                          >
                            <Box
                              as="span"
                              className="material-symbols-outlined"
                              fontSize="16px"
                              transform={sortBy === col && sortOrder === 'desc' ? 'rotate(180deg)' : 'none'}
                              transition="transform 0.2s ease-out"
                            >
                              sort
                            </Box>
                          </IconButton>
                        </Flex>
                      </Table.ColumnHeader>
                    ))}
                    <Table.ColumnHeader px={4} py={3}>Estado</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {processedStudents.map((student) => (
                    <Table.Row
                      key={student.id}
                      _hover={{ bg: 'surface-container-low' }}
                      borderBottom="1px solid"
                      borderColor="border.default"
                    >
                      <Table.Cell px={4} py={3}>
                        <Checkbox.Root
                          checked={selected.includes(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                        </Checkbox.Root>
                      </Table.Cell>
                      <Table.Cell px={4} py={3} fontWeight="medium">{student.apellido}</Table.Cell>
                      <Table.Cell px={4} py={3}>{student.nombre}</Table.Cell>
                      <Table.Cell px={4} py={3} color="fg.muted">{student.dni}</Table.Cell>
                      <Table.Cell px={4} py={3}>
                        {student.ausente ? (
                          <Badge colorPalette="orange" borderRadius="full" px={2}>
                            {student.justificada ? 'Justificada' : 'Ausente'}
                          </Badge>
                        ) : (
                          <Badge colorPalette="green" borderRadius="full" px={2}>Presente</Badge>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card.Body>
          <Card.Footer p={4} borderTop="1px solid" borderColor="border.default">
            <Flex justify="space-between" align="center" w="full">
              <Text textStyle="body-md" color="fg.muted">
                {selected.length} de {processedStudents.length} alumno(s) seleccionado(s)
              </Text>
              <Button
                borderRadius="full"
                bg="primary"
                color="white"
                _hover={{ bg: 'primary-container' }}
                onClick={submit}
                disabled={selected.length === 0}
                loading={submitting}
              >
                Registrar {selected.length > 0 && `(${selected.length})`}
              </Button>
            </Flex>
          </Card.Footer>
        </Card.Root>
      )}

      {!loading && processedStudents.length === 0 && cursoId && (
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={8}>
          <VStack gap={3}>
            <Text textStyle="heading-md" color="fg.muted">
              {searchQuery ? 'Sin resultados' : 'Sin datos'}
            </Text>
            <Text textStyle="body-md" color="fg.muted">
              {searchQuery
                ? `No se encontraron alumnos que coincidan con "${searchQuery}".`
                : 'No hay alumnos cargados para esta fecha.'}
            </Text>
          </VStack>
        </Card.Root>
      )}
    </Box>
  )
}
