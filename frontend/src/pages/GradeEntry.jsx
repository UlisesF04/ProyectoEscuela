import { useState } from 'react'
import { Box, Flex, Text, Button, SimpleGrid, Card, NativeSelect, Table } from '@chakra-ui/react'
import api from '../services/api'

export default function GradeEntry() {
  const [materiaId, setMateriaId] = useState('')
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const materias = [
    { id: 1, name: 'Matemática' },
    { id: 2, name: 'Lengua' },
    { id: 3, name: 'Ciencias' },
    { id: 4, name: 'Historia' },
  ]

  const loadStudents = async () => {
    if (!materiaId) return
    setLoading(true)
    try {
      const { data } = await api.get(`/grades/course/1`)
      const est = data.estudiantes || []
      setStudents(est)
      const g = {}
      est.forEach(s => { g[s.id] = '' })
      setGrades(g)
    } catch {
      setFeedback('❌ Error al cargar alumnos')
    } finally {
      setLoading(false)
    }
  }

  const submitAll = async () => {
    setSubmitting(true)
    let ok = 0, err = 0
    for (const studentId of Object.keys(grades)) {
      const nota = parseFloat(grades[studentId])
      if (isNaN(nota)) continue
      try {
        await api.post('/grades', { estudiante_id: parseInt(studentId), materia_id: parseInt(materiaId), nota })
        ok++
      } catch { err++ }
    }
    setFeedback(`✅ ${ok} nota(s) guardadas${err > 0 ? `, ${err} error(es)` : ''}`)
    setSubmitting(false)
  }

  return (
    <Box maxW="container-max" mx="auto">
      <Text textStyle="heading-xl" color="fg" mb={2}>Carga de Notas</Text>
      <Text textStyle="body-md" color="fg.muted" mb={6}>Ingresá las calificaciones por materia</Text>

      <Card.Root bg="bg.card" borderRadius="xl" shadow="card" mb={6}>
        <Card.Body p={6}>
          <Flex gap={4} align="flex-end" wrap="wrap">
            <Box flex={1} minW="200px">
              <Text textStyle="label-md" color="fg.muted" mb={1}>Materia</Text>
              <NativeSelect.Root size="lg">
                <NativeSelect.Field
                  placeholder="Seleccionar materia"
                  value={materiaId}
                  onChange={(e) => setMateriaId(e.target.value)}
                >
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>
            <Button
              borderRadius="full"
              bg="primary"
              color="white"
              _hover={{ bg: 'primary-container' }}
              onClick={loadStudents}
              loading={loading}
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
                          min={1}
                          max={10}
                          step={0.5}
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
    </Box>
  )
}
