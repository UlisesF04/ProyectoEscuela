import { useState } from 'react'
import { Box, Flex, Text, Button, SimpleGrid, Card, Badge, VStack, NativeSelect, Separator } from '@chakra-ui/react'

export default function TeacherDashboard() {
  const [cursoId, setCursoId] = useState('')

  const cursos = [
    { id: 1, name: '1° A' },
    { id: 2, name: '1° B' },
  ]

  const studentsAtRisk = [
    { id: 3, nombre: 'Luis', apellido: 'Martínez', ausencias: 8, porcentaje: 12.5 },
    { id: 5, nombre: 'Diego', apellido: 'Fernández', ausencias: 6, porcentaje: 9.4 },
  ]

  const licenseDays = 15
  const licenseUsed = 3
  const licenseRemaining = licenseDays - licenseUsed

  return (
    <Box maxW="container-max" mx="auto">
      <Text textStyle="heading-xl" color="fg" mb={2}>Panel del Docente</Text>
      <Text textStyle="body-md" color="fg.muted" mb={6}>Resumen de tus cursos y licencias</Text>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
        {/* Left column — absences panel */}
        <Box gridColumn={{ lg: 'span 2' }}>
          <Card.Root bg="bg.card" borderRadius="xl" shadow="card" mb={6}>
            <Card.Body p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                <Text textStyle="heading-md" color="fg">Inasistencias por Curso</Text>
                <NativeSelect.Root size="sm" w="160px">
                  <NativeSelect.Field
                    value={cursoId}
                    placeholder="Filtrar curso"
                    onChange={(e) => setCursoId(e.target.value)}
                  >
                    {cursos.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Flex>

              {/* Summary cards */}
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={4}>
                <Box bg="surface-container-low" borderRadius="xl" p={4}>
                  <Text textStyle="heading-lg" color="primary">12</Text>
                  <Text textStyle="label-md" color="fg.muted">Total hoy</Text>
                </Box>
                <Box bg="surface-container-low" borderRadius="xl" p={4}>
                  <Text textStyle="heading-lg" color="success">5</Text>
                  <Text textStyle="label-md" color="fg.muted">Justificadas</Text>
                </Box>
                <Box bg="surface-container-low" borderRadius="xl" p={4}>
                  <Text textStyle="heading-lg" color="tertiary">7</Text>
                  <Text textStyle="label-md" color="fg.muted">Injustificadas</Text>
                </Box>
              </SimpleGrid>

              {/* Students at risk */}
              {studentsAtRisk.length > 0 && (
                <Box>
                  <Text textStyle="label-md" color="fg.muted" mb={2}>Alumnos en Riesgo</Text>
                  {studentsAtRisk.map((s) => (
                    <Flex
                      key={s.id}
                      justify="space-between"
                      align="center"
                      p={3}
                      borderRadius="full"
                      bg="error-container"
                      mb={2}
                    >
                      <Text fontWeight="medium" color="on-error-container">
                        {s.apellido}, {s.nombre}
                      </Text>
                      <Badge colorPalette="red" borderRadius="full">
                        {s.porcentaje}% ausencias
                      </Badge>
                    </Flex>
                  ))}
                </Box>
              )}
            </Card.Body>
          </Card.Root>
        </Box>

        {/* Right column — license status */}
        <Box>
          <Card.Root bg="bg.card" borderRadius="xl" shadow="card">
            <Card.Body p={6}>
              <Text textStyle="heading-md" color="fg" mb={4}>Licencias</Text>
              
              <VStack gap={3} mb={4}>
                <Flex justify="space-between" w="full">
                  <Text textStyle="body-md" color="fg.muted">Disponibles</Text>
                  <Text fontWeight="bold" color="fg">{licenseDays} días</Text>
                </Flex>
                <Flex justify="space-between" w="full">
                  <Text textStyle="body-md" color="fg.muted">Usados</Text>
                  <Text fontWeight="bold" color="fg">{licenseUsed} días</Text>
                </Flex>
                <Flex justify="space-between" w="full">
                  <Text textStyle="body-md" color="fg.muted">Restantes</Text>
                  <Text
                    fontWeight="bold"
                    color={licenseRemaining <= 3 ? 'error' : 'success'}
                  >
                    {licenseRemaining} días
                  </Text>
                </Flex>
              </VStack>

              <Box w="full" h="8px" bg="surface-container" borderRadius="full" overflow="hidden">
                <Box
                  h="full"
                  borderRadius="full"
                  bg={licenseRemaining <= 3 ? 'error' : 'success'}
                  w={`${(licenseUsed / licenseDays) * 100}%`}
                  transition="width 0.3s"
                />
              </Box>

              {licenseRemaining <= 3 && (
                <Flex
                  mt={4}
                  p={3}
                  borderRadius="full"
                  bg="error-container"
                  color="on-error-container"
                  align="center"
                  gap={2}
                >
                  <Text fontWeight="medium" fontSize="sm">
                    ⚠ Quedan solo {licenseRemaining} días de licencia
                  </Text>
                </Flex>
              )}
            </Card.Body>
          </Card.Root>
        </Box>
      </SimpleGrid>
    </Box>
  )
}
