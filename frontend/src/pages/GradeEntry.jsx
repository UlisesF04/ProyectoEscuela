import { useState } from 'react'
import { Box, Flex, Text, Button, SimpleGrid, Card, NativeSelect, Table, Spinner } from '@chakra-ui/react'
import { GRADE_MIN, GRADE_MAX, GRADE_STEP, ACADEMIC_PERIODS } from '../constants/business'
import FeedbackBanner from '../components/molecules/FeedbackBanner'
import EmptyState from '../components/molecules/EmptyState'
import CourseSelector from '../components/molecules/CourseSelector'
import { useCourses, useSubjects, useGradeStudents } from '../hooks'
import api from '../services/api'

export default function GradeEntry() {
  const [cursoId, setCursoId] = useState('')
  const [materiaId, setMateriaId] = useState('')
  const [periodo, setPeriodo] = useState('Trimestre 1')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const { cursos, loading: cursosLoading } = useCourses()
  const { materias, loading: materiasLoading } = useSubjects(cursoId)
  const { students, loading, refetch: refetchStudents } = useGradeStudents(cursoId)
  const [grades, setGrades] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const loadStudents = async () => {
    if (!materiaId || !cursoId) return
    setFeedback('')
    const est = await refetchStudents()
    const g = {}
    est.forEach(s => { g[s.id] = '' })
    setGrades(g)
  }

  const submitAll = async () => {
    if (!materiaId || students.length === 0) return
    setSubmitting(true)
    let ok = 0, err = 0
    for (const studentId of Object.keys(grades)) {
      const nota = parseFloat(grades[studentId])
      if (isNaN(nota)) continue
      try {
        await api.post('/grades', {
          estudiante_id: parseInt(studentId),
          materia_id: parseInt(materiaId),
          nota,
          periodo,
          fecha,
        })
        ok++
      } catch { err++ }
    }
    setFeedback(`✅ ${ok} nota(s) guardadas${err > 0 ? `, ${err} error(es)` : ''}`)
    setSubmitting(false)
  }

  return (
    <Box maxW="container-max" mx="auto">
      <Text textStyle="heading-xl" color="fg" mb={2}>Carga de Notas</Text>
      <Text textStyle="body-md" color="fg.muted" mb={6}>Ingresá las calificaciones por materia y período</Text>

      <FeedbackBanner feedback={feedback} />

      <Card.Root bg="bg.card" borderRadius="xl" shadow="card" mb={6}>
        <Card.Body p={6}>
          <SimpleGrid columns={{ base: 1, md: 4 }} gap={4}>
            <CourseSelector
              cursos={cursos}
              loading={cursosLoading}
              value={cursoId}
              onChange={(val) => { setCursoId(val); setMateriaId(''); setStudents([]); setGrades({}) }}
            />
            <Box>
              <Text textStyle="label-md" color="fg.muted" mb={1}>Materia</Text>
              {materiasLoading ? (
                <Flex align="center" gap={2} p={3}>
                  <Spinner size="sm" />
                  <Text textStyle="body-md" color="fg.muted">Cargando...</Text>
                </Flex>
              ) : (
                <NativeSelect.Root size="lg">
                  <NativeSelect.Field
                    placeholder={cursoId ? 'Seleccionar materia' : 'Primero elegí un curso'}
                    value={materiaId}
                    disabled={!cursoId}
                    onChange={(e) => setMateriaId(e.target.value)}
                  >
                    {materias.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              )}
            </Box>
            <Box>
              <Text textStyle="label-md" color="fg.muted" mb={1}>Período</Text>
              <NativeSelect.Root size="lg">
                <NativeSelect.Field value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                  {ACADEMIC_PERIODS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
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
          </SimpleGrid>
          <Flex justify="flex-end" mt={4}>
            <Button
              borderRadius="full"
              bg="primary"
              color="white"
              _hover={{ bg: 'primary-container' }}
              onClick={loadStudents}
              loading={loading}
              disabled={!materiaId || !cursoId}
            >
              Cargar Alumnos
            </Button>
          </Flex>
        </Card.Body>
      </Card.Root>

      {students.length > 0 && (
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card">
          <Card.Body p={0}>
            <Box overflowX="auto">
              <Table.Root>
                <Table.Header>
                  <Table.Row bg="surface-container-low">
                    <Table.ColumnHeader px={4} py={3}>Alumno</Table.ColumnHeader>
                    <Table.ColumnHeader px={4} py={3} w="120px">Nota (1-10)</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {students.map((s) => (
                    <Table.Row key={s.id} borderBottom="1px solid" borderColor="border.default">
                      <Table.Cell px={4} py={3}>{s.apellido}, {s.nombre}</Table.Cell>
                      <Table.Cell px={4} py={3}>
                        <Box
                          as="input"
                          type="number"
                          min={GRADE_MIN}
                          max={GRADE_MAX}
                          step={GRADE_STEP}
                          value={grades[s.id] || ''}
                          onChange={(e) => setGrades({ ...grades, [s.id]: e.target.value })}
                          w="100px"
                          p={2}
                          borderRadius="full"
                          border="1px solid"
                          borderColor="border.default"
                          bg="surface-container-low"
                          textAlign="center"
                          _focus={{ outline: 'none', ring: 2, ringColor: 'primary-container' }}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card.Body>
          <Card.Footer p={4} borderTop="1px solid" borderColor="border.default">
            <Button
              borderRadius="full"
              bg="primary"
              color="white"
              _hover={{ bg: 'primary-container' }}
              onClick={submitAll}
              loading={submitting}
              w={{ base: 'full', md: 'auto' }}
            >
              Guardar Todas las Notas
            </Button>
          </Card.Footer>
        </Card.Root>
      )}

      {!loading && students.length === 0 && cursoId && materiaId && (
        <EmptyState heading="Sin datos" message="No hay alumnos cargados para este curso." />
      )}
    </Box>
  )
}
