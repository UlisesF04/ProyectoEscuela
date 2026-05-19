import { useState } from 'react'
import { Box, Flex, Text, Button, SimpleGrid, Card, Badge, VStack, HStack, NativeSelect, Separator, IconButton } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const [hijoId, setHijoId] = useState(1)

  const hijos = [
    { id: 1, nombre: 'Juan', apellido: 'Pérez', curso: '1° A' },
    { id: 2, nombre: 'Ana', apellido: 'Gómez', curso: '2° B' },
  ]

  const currentChild = hijos.find(h => h.id === hijoId) || hijos[0]

  const metrics = {
    inasistencias: { total: 5, justificadas: 2, injustificadas: 3, porcentaje: 7.8 },
    materias: [
      { nombre: 'Matemática', promedio: 8.5, notas: 4 },
      { nombre: 'Lengua', promedio: 6.0, notas: 3 },
      { nombre: 'Ciencias', promedio: 7.2, notas: 3 },
      { nombre: 'Historia', promedio: 5.5, notas: 2 },
    ],
    tareas: { pendientes: 1, entregadas: 3 },
  }

  return (
    <Box maxW="container-max" mx="auto">
      {/* Hero selector */}
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
              {currentChild.nombre} {currentChild.apellido}
            </Text>
            <Text textStyle="body-lg" color="fg.muted">{currentChild.curso}</Text>
          </Box>
          {hijos.length > 1 && (
            <NativeSelect.Root size="lg" w="200px">
              <NativeSelect.Field
                value={hijoId}
                onChange={(e) => setHijoId(parseInt(e.target.value))}
              >
                {hijos.map(h => (
                  <option key={h.id} value={h.id}>{h.nombre} {h.apellido}</option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
          )}
        </Flex>
      </Card.Root>

      {/* Metrics grid — 4x3 layout like template */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={6}>
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={5}>
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Text textStyle="heading-xl" color="primary">{metrics.inasistencias.total}</Text>
              <Text textStyle="label-md" color="fg.muted">Inasistencias</Text>
            </Box>
            <Box w={10} h={10} borderRadius="full" bg="surface-container-low" display="flex" alignItems="center" justifyContent="center">
              <Box as="span" className="material-symbols-outlined" color="primary">event_busy</Box>
            </Box>
          </Flex>
          <Flex gap={3} mt={3}>
            <Badge colorPalette="green" borderRadius="full">{metrics.inasistencias.justificadas} justif.</Badge>
            <Badge colorPalette="orange" borderRadius="full">{metrics.inasistencias.injustificadas} no justif.</Badge>
          </Flex>
        </Card.Root>

        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={5}>
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Text textStyle="heading-xl" color="secondary">
                {metrics.materias.reduce((a, m) => a + m.promedio, 0) / metrics.materias.length}
              </Text>
              <Text textStyle="label-md" color="fg.muted">Promedio general</Text>
            </Box>
            <Box w={10} h={10} borderRadius="full" bg="surface-container-low" display="flex" alignItems="center" justifyContent="center">
              <Box as="span" className="material-symbols-outlined" color="secondary">grade</Box>
            </Box>
          </Flex>
        </Card.Root>

        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={5}>
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Text textStyle="heading-xl" color={metrics.tareas.pendientes > 0 ? 'tertiary' : 'success'}>
                {metrics.tareas.pendientes}
              </Text>
              <Text textStyle="label-md" color="fg.muted">Tareas pendientes</Text>
            </Box>
            <Box w={10} h={10} borderRadius="full" bg="surface-container-low" display="flex" alignItems="center" justifyContent="center">
              <Box as="span" className="material-symbols-outlined" color={metrics.tareas.pendientes > 0 ? 'tertiary' : 'success'}>assignment</Box>
            </Box>
          </Flex>
          <Text textStyle="body-md" color="fg.muted" mt={1}>{metrics.tareas.entregadas} entregadas</Text>
        </Card.Root>

        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={5}>
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Text textStyle="heading-xl" color={metrics.inasistencias.porcentaje > 20 ? 'error' : 'success'}>
                {metrics.inasistencias.porcentaje}%
              </Text>
              <Text textStyle="label-md" color="fg.muted">Ausencia total</Text>
            </Box>
            <Box w={10} h={10} borderRadius="full" bg="surface-container-low" display="flex" alignItems="center" justifyContent="center">
              <Box as="span" className="material-symbols-outlined" color={metrics.inasistencias.porcentaje > 20 ? 'error' : 'success'}>monitoring</Box>
            </Box>
          </Flex>
        </Card.Root>
      </SimpleGrid>

      {/* Subjects grades — chart-like section */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6}>
          <Text textStyle="heading-md" color="fg" mb={4}>Calificaciones por Materia</Text>
          <VStack gap={3}>
            {metrics.materias.map((m) => (
              <Box key={m.nombre} w="full">
                <Flex justify="space-between" mb={1}>
                  <Text textStyle="body-md" fontWeight="medium" color="fg">{m.nombre}</Text>
                  <Text fontWeight="bold" color={m.promedio < 6 ? 'error' : 'primary'}>{m.promedio.toFixed(1)}</Text>
                </Flex>
                <Box w="full" h="6px" bg="surface-container" borderRadius="full" overflow="hidden">
                  <Box
                    h="full"
                    borderRadius="full"
                    bg={m.promedio < 6 ? 'error' : 'primary-container'}
                    w={`${(m.promedio / 10) * 100}%`}
                    transition="width 0.5s"
                  />
                </Box>
              </Box>
            ))}
          </VStack>
        </Card.Root>

        {/* Mini chart mockup (inline SVG from template) */}
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6}>
          <Text textStyle="heading-md" color="fg" mb={4}>Evolución de Inasistencias</Text>
          <Box w="full" h="160px" position="relative">
            <svg viewBox="0 0 300 120" style={{ width: '100%', height: '100%' }}>
              <polyline
                points="20,100 80,60 140,80 200,40 260,90"
                fill="none"
                stroke="#ab3500"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon
                points="20,100 80,60 140,80 200,40 260,90 260,120 20,120"
                fill="url(#grad)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ab3500" />
                  <stop offset="100%" stopColor="#ab3500" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[
                [20, 100], [80, 60], [140, 80], [200, 40], [260, 90]
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="4" fill="#ab3500" stroke="white" strokeWidth="2" />
              ))}
            </svg>
          </Box>
          <Flex justify="space-between" mt={2}>
            <Text textStyle="label-md" color="fg.muted">Mar</Text>
            <Text textStyle="label-md" color="fg.muted">Abr</Text>
            <Text textStyle="label-md" color="fg.muted">May</Text>
            <Text textStyle="label-md" color="fg.muted">Jun</Text>
            <Text textStyle="label-md" color="fg.muted">Jul</Text>
          </Flex>
        </Card.Root>
      </SimpleGrid>
    </Box>
  )
}
