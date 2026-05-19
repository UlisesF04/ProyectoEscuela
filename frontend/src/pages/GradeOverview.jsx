import { useState } from 'react'
import { Box, Flex, Text, SimpleGrid, Card, Badge, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { MIN_PASSING_GRADE } from '../constants/business'
import LoadingSpinner from '../components/molecules/LoadingSpinner'
import ErrorState from '../components/molecules/ErrorState'
import EmptyState from '../components/molecules/EmptyState'
import CourseSelector from '../components/molecules/CourseSelector'
import { useCourses, useGradeStudents } from '../hooks'
import StaggerContainer from '../components/StaggerContainer'

export default function GradeOverview() {
  const [cursoId, setCursoId] = useState('')
  const { cursos, loading: cursosLoading } = useCourses()
  const { students, loading, error } = useGradeStudents(cursoId)

  return (
    <Box maxW="container-max" mx="auto">
      <Text textStyle="heading-xl" color="fg" mb={2}>Vista de Calificaciones</Text>
      <Text textStyle="body-md" color="fg.muted" mb={6}>Promedios generales del curso</Text>

      {/* Course selector */}
      <Card.Root bg="bg.card" borderRadius="xl" shadow="card" mb={6}>
        <Card.Body p={6}>
          <Box maxW="300px">
            <CourseSelector
              cursos={cursos}
              loading={cursosLoading}
              value={cursoId}
              onChange={setCursoId}
            />
          </Box>
        </Card.Body>
      </Card.Root>

      {/* Error */}
      {error && <ErrorState message={error} />}

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Students grid */}
      {!loading && students.length > 0 && (
        <StaggerContainer>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {students.map((student) => (
              <StaggerContainer.Item key={student.id}>
                <Card.Root
              as={motion.div}
              whileHover={{ y: -4, boxShadow: 'var(--chakra-shadows-card-hover)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              bg="bg.card"
              borderRadius="xl"
              shadow="card"
              p={6}
              borderColor={student.promedio < MIN_PASSING_GRADE ? 'error' : 'border.default'}
              position="relative"
              overflow="hidden"
            >
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
                    color={student.promedio < MIN_PASSING_GRADE ? 'error' : 'primary'}
                  >
                    {student.promedio?.toFixed(1) || '-'}
                  </Text>
                  <Text textStyle="label-md" color="fg.muted">Promedio</Text>
                </Box>
              </Flex>
              {student.promedio < MIN_PASSING_GRADE && (
                <Badge colorPalette="red" borderRadius="full" px={2} mt={2}>
                  Bajo rendimiento
                </Badge>
              )}
            </Card.Root>
              </StaggerContainer.Item>
            ))}
          </SimpleGrid>
        </StaggerContainer>
      )}

      {/* Empty state */}
      {!loading && !error && students.length === 0 && cursoId && (
        <EmptyState heading="Sin datos" message="No hay calificaciones cargadas aún para este curso." />
      )}

      {!loading && !cursoId && (
        <EmptyState heading="Seleccioná un curso" message="Elegí un curso arriba para ver las calificaciones." />
      )}
    </Box>
  )
}
