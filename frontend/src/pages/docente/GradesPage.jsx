import {
  Box, Heading, Button, HStack, FormControl, FormLabel,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Input, NumberInput, NumberInputField,
  useToast, VStack, Text, Badge,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiSave } from 'react-icons/fi';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import DatePicker from '../../components/DatePicker';
import { gradesService } from '../../services/gradesService';
import { teacherService } from '../../services/teacherService';
import CustomSelect from '../../components/CustomSelect';

const TYPE_OPTIONS = [
  { value: 'examen', label: 'Examen' },
  { value: 'tarea', label: 'Tarea' },
  { value: 'trabajo', label: 'Trabajo Practico' },
  { value: 'oral', label: 'Exposicion' },
];

export default function GradesPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalStudent, setModalStudent] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [gradeType, setGradeType] = useState('examen');
  const [gradeDate, setGradeDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    setError(null);
    teacherService.getMyCourses()
      .then((data) => {
        const coursesData = data || [];
        setCourses(coursesData);
        if (coursesData.length > 0) {
          const firstCourseId = coursesData[0].id?.toString() || '';
          setSelectedCourseId(firstCourseId);
          const firstSubjects = coursesData[0].subjects || [];
          setSubjects(firstSubjects);
          setSelectedSubjectId(firstSubjects.length > 0 ? firstSubjects[0].id?.toString() || '' : '');
        }
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCourses(); }, []);

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    const course = courses.find((c) => c.id === parseInt(courseId));
    const courseSubjects = course?.subjects || [];
    setSubjects(courseSubjects);
    setSelectedSubjectId(courseSubjects.length > 0 ? courseSubjects[0].id?.toString() || '' : '');
  };

  useEffect(() => {
    if (!selectedCourseId || !selectedSubjectId) return;
    const course = courses.find((c) => c.id === parseInt(selectedCourseId));
    setStudents(course?.students || []);
  }, [selectedCourseId, selectedSubjectId, courses]);

  const openGradeModal = (student) => {
    setModalStudent(student);
    setGradeValue('');
    setGradeType('examen');
    setGradeDate(new Date().toISOString().split('T')[0]);
  };

  const handleSaveGrade = async () => {
    if (!modalStudent || !selectedSubjectId) return;
    const val = parseFloat(gradeValue);
    if (isNaN(val) || val < 0 || val > 10) {
      toast({ title: 'Nota inválida', description: 'La nota debe estar entre 0 y 10', status: 'warning', duration: 3000, isClosable: true, position: 'top-right' });
      return;
    }
    setSaving(true);
    try {
      await gradesService.createGrade({
        student_id: modalStudent.id,
        subject_id: parseInt(selectedSubjectId),
        grade: val,
        type: gradeType,
        date: gradeDate,
      });
      toast({ title: 'Nota guardada', description: `Nota de ${modalStudent.first_name} ${modalStudent.last_name} registrada`, status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setModalStudent(null);
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'No se pudo guardar', status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="text" rows={5} />;

  if (!courses || courses.length === 0) {
    return (
      <Box>
        <Heading as="h1" size="lg" mb={6} fontFamily="heading">Calificaciones</Heading>
        <EmptyState title="No tiene cursos asignados" description="Contacte al administrador." />
      </Box>
    );
  }

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchCourses} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">Calificaciones</Heading>

      <HStack spacing={4} mb={6} flexWrap="wrap">
        <FormControl w="200px">
          <FormLabel fontSize="sm" color="onSurfaceVariant">Curso</FormLabel>
          <CustomSelect value={selectedCourseId} onChange={handleCourseChange}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </CustomSelect>
        </FormControl>
        <FormControl w="220px">
          <FormLabel fontSize="sm" color="onSurfaceVariant">Materia</FormLabel>
          <CustomSelect value={selectedSubjectId} onChange={setSelectedSubjectId}>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </CustomSelect>
        </FormControl>
      </HStack>

      {students.length === 0 ? (
        <EmptyState title="No hay alumnos en este curso" description="Asigne alumnos al curso desde el panel de administración." />
      ) : (
        <Box borderRadius="card" border="1px solid" borderColor="outlineVariant" overflow="hidden" bg="white" boxShadow="warmSm">
          {students.map((student, idx) => (
            <HStack
              key={student.id}
              p={4}
              borderBottom={idx < students.length - 1 ? '1px solid' : 'none'}
              borderColor="outlineVariant"
              justify="space-between"
              _hover={{ bg: 'containerLow', transition: 'background-color 160ms ease-out' }}
              sx={{ animation: 'fadeSlideIn 300ms ease-out both', animationDelay: `${idx * 30}ms` }}
            >
              <Text fontWeight={500} fontSize="sm">
                {student.first_name} {student.last_name}
              </Text>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="brand"
                size="sm"
                borderRadius="pill"
                onClick={() => openGradeModal(student)}
                _active={{ transform: 'scale(0.97)' }}
                transition="transform 160ms ease-out"
              >
                Agregar Nota
              </Button>
            </HStack>
          ))}
        </Box>
      )}

      <Modal isOpen={!!modalStudent} onClose={() => setModalStudent(null)} size={{ base: 'full', md: 'md' }} closeOnOverlayClick={!saving}>
        <ModalOverlay />
        <ModalContent borderRadius="card">
          <ModalHeader fontFamily="heading">
            Agregar Nota — {modalStudent?.first_name} {modalStudent?.last_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Nota (0-10)</FormLabel>
                <NumberInput value={gradeValue} onChange={(v) => setGradeValue(v)} min={0} max={10} step={0.01} precision={2} keepWithinRange={false} clampValueOnBlur>
                  <NumberInputField borderRadius="input" />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Tipo</FormLabel>
                <CustomSelect value={gradeType} onChange={setGradeType}>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </CustomSelect>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Fecha</FormLabel>
                <DatePicker value={gradeDate} onChange={setGradeDate} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setModalStudent(null)} isDisabled={saving}>Cancelar</Button>
            <Button leftIcon={<FiSave />} colorScheme="brand" isLoading={saving} onClick={handleSaveGrade} _active={{ transform: 'scale(0.97)' }} transition="transform 160ms ease-out">
              Guardar Nota
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
