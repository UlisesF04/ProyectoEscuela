import { useState, useMemo } from 'react'
import { Box, Flex, Text, Button, VStack, SimpleGrid, Card, Badge, Table, Checkbox, IconButton, Spinner } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import FeedbackBanner from '../components/molecules/FeedbackBanner'
import EmptyState from '../components/molecules/EmptyState'
import CourseSelector from '../components/molecules/CourseSelector'
import { useCourses, useAbsences } from '../hooks'

// Normaliza texto: quita acentos/diacríticos y pasa a minúsculas
const normalize = (str) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function AbsenceRegister() {
  const navigate = useNavigate()
  const [cursoId, setCursoId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const { students, loading, error: absencesError, loadStudents, registerAbsences } = useAbsences()
  const [selected, setSelected] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [sortBy, setSortBy] = useState('apellido')
  const [sortOrder, setSortOrder] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [studentIdInput, setStudentIdInput] = useState('')
  const { cursos, loading: cursosLoading } = useCourses()

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const processedStudents = useMemo(() => {
    const q = normalize(searchQuery)
    let filtered = students
    if (q) {
      filtered = students.filter(s =>
        normalize(s.apellido).includes(q) ||
        normalize(s.nombre).includes(q) ||
        normalize(s.dni).includes(q)
      )
    }
    return [...filtered].sort((a, b) => {
      const field = sortBy === 'dni' ? 'dni' : sortBy === 'nombre' ? 'nombre' : 'apellido'
      const cmp = (a[field] || '').localeCompare(b[field] || '', 'es')
      return sortOrder === 'asc' ? cmp : -cmp
    })
  }, [students, sortBy, sortOrder, searchQuery])

  const handleLoadStudents = async () => {
    if (!cursoId) return
    setFeedback('')
    await loadStudents(cursoId, fecha)
    setSelected([])
  }

  const toggleStudent = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const submit = async () => {
    if (!cursoId || selected.length === 0) {
      setFeedback('Seleccion\u00e1 un curso y al menos un alumno')
      return
    }
    setSubmitting(true)
    setFeedback('')
    try {
      const { data } = await registerAbsences({ estudiante_ids: selected, fecha, curso_id: parseInt(cursoId) })
      setFeedback(`✅ ${data.registradas} inasistencia(s) registrada(s)`)
      handleLoadStudents()
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
        <Flex gap={2} align="flex-end">
          <Box w="140px">
            <Text textStyle="label-md" color="fg.muted" mb={1}>ID Estudiante</Text>
            <Box
              as="input"
              type="number"
              min={1}
              placeholder="Ej: 1"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              w="full"
              p={2}
              borderRadius="full"
              border="1px solid"
              borderColor="border.default"
              bg="surface-container-low"
              textAlign="center"
              _focus={{ outline: 'none', ring: 2, ringColor: 'primary-container' }}
              onKeyDown={(e) => e.key === 'Enter' && studentIdInput && navigate(`/absences/student/${studentIdInput}`)}
            />
          </Box>
          <Button
            borderRadius="full"
            bg="primary"
            color="white"
            _hover={{ bg: 'primary-container' }}
            onClick={() => studentIdInput && navigate(`/absences/student/${studentIdInput}`)}
            disabled={!studentIdInput}
          >
            Ver Historial
          </Button>
        </Flex>
      </Flex>

      <FeedbackBanner feedback={feedback} />
      {absencesError && (
        <Box mb={4} p={3} borderRadius="md" bg="error-container" color="on-error-container">
          <Text fontSize="sm">{absencesError}</Text>
        </Box>
      )}

      {/* Filters */}
      <Card.Root bg="bg.card" borderRadius="xl" shadow="card" mb={6}>
        <Card.Body p={6}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <CourseSelector
              cursos={cursos}
              loading={cursosLoading}
              value={cursoId}
              onChange={setCursoId}
            />
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
                onClick={handleLoadStudents}
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
                ring: 2,
                ringColor: 'primary',
                borderColor: 'primary',
              }}
              sx={{ '&::placeholder': { color: 'fg.muted', opacity: 0.6 } }}
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
        <EmptyState
          heading={searchQuery ? 'Sin resultados' : 'Sin datos'}
          message={searchQuery
            ? `No se encontraron alumnos que coincidan con "${searchQuery}".`
            : 'No hay alumnos cargados para esta fecha.'
          }
        />
      )}
    </Box>
  )
}
