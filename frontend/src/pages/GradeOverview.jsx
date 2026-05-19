import { useState, useEffect } from 'react'
import { Box, Flex, Text, SimpleGrid, Card, Badge, VStack, Spinner } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function GradeOverview() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/grades/course/1')
        setStudents(data.estudiantes || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <Flex justify="center" py={20}><Spinner /></Flex>

  return (
    <Box maxW="container-max" mx="auto">
      <Text textStyle="heading-xl" color="fg" mb={2}>Vista de Calificaciones</Text>
      <Text textStyle="body-md" color="fg.muted" mb={6}>
        {user?.rol === 'tutor' ? 'Resumen de calificaciones de tus hijos' : 'Promedios generales del curso'}
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {students.map((student) => (
          <Card.Root
            key={student.id}
            bg="bg.card"
            borderRadius="xl"
            shadow="card"
            p={6}
            borderColor={student.promedio < 6 ? 'error' : 'border.default'}
            position="relative"
            overflow="hidden"
          >
            {/* Decorative gradient circle */}
            <Box
              position="absolute"
              right="-24px"
              top="-24px"
              w="80px"
              h="80px"
              borderRadius="full"
              bg="linear-gradient(135deg, {colors.primary-container}, {colors.secondary-container})"
              opacity={0.1}
            />
            <Flex justify="space-between" align="flex-start" mb={3}>
              <Box>
                <Text fontWeight="semibold" color="fg">{student.apellido}</Text>
                <Text textStyle="body-md" color="fg.muted">{student.nombre}</Text>
              </Box>
              <Box textAlign="right">
                <Text
                  textStyle="heading-xl"
                  color={student.promedio < 6 ? 'error' : 'primary'}
                >
                  {student.promedio?.toFixed(1) || '-'}
                </Text>
                <Text textStyle="label-md" color="fg.muted">Promedio</Text>
              </Box>
            </Flex>
            {student.promedio < 6 && (
              <Badge colorPalette="red" borderRadius="full" px={2} mt={2}>
                Bajo rendimiento
              </Badge>
            )}
          </Card.Root>
        ))}
      </SimpleGrid>

      {!loading && students.length === 0 && (
        <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={8}>
          <VStack gap={3}>
            <Text textStyle="heading-md" color="fg.muted">Sin datos</Text>
            <Text textStyle="body-md" color="fg.muted">No hay calificaciones cargadas aún.</Text>
          </VStack>
        </Card.Root>
      )}
    </Box>
  )
}
