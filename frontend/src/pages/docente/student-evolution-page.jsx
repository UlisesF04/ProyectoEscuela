import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import GradeEvolutionView from '../../components/grade-evolution-view';
import { teacherService } from '../../services/teacherService';
import { gradesService } from '../../services/gradesService';

export default function StudentEvolutionPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [evolution, setEvolution] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const [error, setError] = useState(null);

  // Load courses on mount
  const fetchCourses = useCallback(() => {
    setLoadingCourses(true);
    teacherService
      .getMyCourses()
      .then((data) => {
        const list = data || [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourseId(list[0].id.toString());
        }
      })
      .catch((err) => setError(err))
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset student selection when course changes
  useEffect(() => {
    if (!selectedCourseId) {
      setSelectedStudentId('');
      return;
    }
    const course = courses.find((c) => c.id === parseInt(selectedCourseId, 10));
    const students = course?.students || [];
    if (students.length > 0) {
      setSelectedStudentId(students[0].id.toString());
    } else {
      setSelectedStudentId('');
    }
  }, [selectedCourseId, courses]);

  // Available students in the selected course
  const availableStudents = useMemo(() => {
    if (!selectedCourseId) return [];
    const course = courses.find((c) => c.id === parseInt(selectedCourseId, 10));
    return course?.students || [];
  }, [selectedCourseId, courses]);

  // Load evolution when student changes
  useEffect(() => {
    if (!selectedStudentId) {
      setEvolution(null);
      return;
    }
    let mounted = true;
    setLoadingEvolution(true);
    setError(null);
    setEvolution(null);
    gradesService
      .getStudentEvolution(parseInt(selectedStudentId, 10))
      .then((data) => {
        if (!mounted) return;
        setEvolution(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (mounted) setLoadingEvolution(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedStudentId]);

  const handleRetry = () => {
    if (!selectedStudentId) return;
    setError(null);
    setLoadingEvolution(true);
    setEvolution(null);
    gradesService
      .getStudentEvolution(parseInt(selectedStudentId, 10))
      .then((data) => setEvolution(data))
      .catch((err) => setError(err))
      .finally(() => setLoadingEvolution(false));
  };

  return (
    <Box>
      <Box mb={6}>
        <Heading
          as="h1"
          fontSize={{ base: '2xl', md: '3xl' }}
          color="onSurface"
          fontWeight={700}
          mb={1}
        >
          Evolución del alumno
        </Heading>
        <Text color="onSurfaceVariant" fontSize="sm">
          Visualizá la evolución de calificaciones de tus estudiantes por materia.
        </Text>
      </Box>

      <HStack
        spacing={4}
        mb={6}
        flexWrap="wrap"
        bg="white"
        p={4}
        borderRadius="24px"
        boxShadow="warmSm"
        border="1px solid"
        borderColor="rgba(125, 90, 60, 0.08)"
        align="flex-end"
      >
        <FormControl flex={1} minW="200px">
          <FormLabel fontSize="xs" color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="0.06em" fontWeight={600}>
            Curso
          </FormLabel>
          <Select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            isDisabled={loadingCourses || courses.length === 0}
            borderRadius="input"
            bg="white"
          >
            {courses.length === 0 && !loadingCourses && (
              <option value="">No tenés cursos asignados</option>
            )}
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} {course.year ? `(${course.year})` : ''} {course.division ? `· ${course.division}` : ''}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl flex={1} minW="200px">
          <FormLabel fontSize="xs" color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="0.06em" fontWeight={600}>
            Alumno
          </FormLabel>
          <Select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            isDisabled={availableStudents.length === 0}
            borderRadius="input"
            bg="white"
          >
            {availableStudents.length === 0 && (
              <option value="">Sin alumnos en este curso</option>
            )}
            {availableStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} {s.dni ? `· DNI ${s.dni}` : ''}
              </option>
            ))}
          </Select>
        </FormControl>
      </HStack>

      <GradeEvolutionView
        data={evolution}
        loading={loadingEvolution}
        error={error}
        onRetry={handleRetry}
      />
    </Box>
  );
}
