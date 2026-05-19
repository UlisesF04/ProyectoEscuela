import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Flex, Text, Button, Card, Badge, VStack, Checkbox, Table, Separator } from '@chakra-ui/react'

export default function TaskTracking() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [students, setStudents] = useState([
    { id: 1, nombre: 'Juan', apellido: 'Pérez', entregada: true },
    { id: 2, nombre: 'Ana', apellido: 'Gómez', entregada: false },
    { id: 3, nombre: 'Luis', apellido: 'Martínez', entregada: true },
    { id: 4, nombre: 'Sofía', apellido: 'Rodríguez', entregada: false },
    { id: 5, nombre: 'Diego', apellido: 'Fernández', entregada: false },
  ])

  const toggleDelivery = (studentId) => {
    setStudents(prev =>
      prev.map(s => s.id === studentId ? { ...s, entregada: !s.entregada } : s)
    )
  }

  const consecutivas = students.filter(s => !s.entregada).map(s => s.id)

  return (
    <Box maxW="container-max" mx="auto">
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text textStyle="heading-xl" color="fg">Seguimiento de Tarea</Text>
          <Text textStyle="body-md" color="fg.muted">TP N°1 — Matemática · Entrega: 15/06/2026</Text>
        </Box>
        <Button variant="ghost" borderRadius="full" onClick={() => navigate('/tasks')}>
          Volver
        </Button>
      </Flex>

      {/* Stats */}
      <Flex gap={6} mb={6} wrap="wrap">
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={4} minW="140px">
          <Text textStyle="heading-lg" color="primary">{students.filter(s => s.entregada).length}</Text>
          <Text textStyle="label-md" color="fg.muted">Entregaron</Text>
        </Card.Root>
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={4} minW="140px">
          <Text textStyle="heading-lg" color="tertiary">{students.filter(s => !s.entregada).length}</Text>
          <Text textStyle="label-md" color="fg.muted">Pendientes</Text>
        </Card.Root>
        {consecutivas.length >= 2 && (
          <Card.Root bg="error-container" borderRadius="xl" shadow="card" p={4} minW="200px">
            <Text textStyle="heading-md" color="on-error-container">
              ⚠ {consecutivas.length} alumno(s) sin entregar
            </Text>
            <Text textStyle="label-md" color="on-error-container">
              Posibles 2+ tareas consecutivas
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
                {students.map((student) => (
                  <Table.Row key={student.id} borderBottom="1px solid" borderColor="border.default">
                    <Table.Cell px={4} py={3}>{student.apellido}, {student.nombre}</Table.Cell>
                    <Table.Cell px={4} py={3}>
                      <Checkbox.Root
                        checked={student.entregada}
                        onCheckedChange={() => toggleDelivery(student.id)}
                      />
                    </Table.Cell>
                    <Table.Cell px={4} py={3} textAlign="center">
                      {student.entregada ? (
                        <Badge colorPalette="green" borderRadius="full" px={2}>Entregada</Badge>
                      ) : (
                        <Badge colorPalette="orange" borderRadius="full" px={2}>Pendiente</Badge>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
