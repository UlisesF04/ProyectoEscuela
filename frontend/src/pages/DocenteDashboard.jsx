import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Heading,
  Spinner,
  Center,
  Text,
  Card,
  CardHeader,
  CardBody,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { FiBookOpen, FiUser, FiStar, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { teacherService } from '../services/teacherService';
import { gradesService } from '../services/gradesService';
import { useAuth } from '../context/AuthContext';

const gradeTypeLabels = {
  examen: 'Examen',
  trabajo: 'Trabajo',
  tarea: 'Tarea',
  oral: 'Oral',
  otro: 'Otro',
};

// ─── Profile Section ─────────────────────────────────────────────────

function ProfileSection() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="3px" />
          <Text color="gray.500">Cargando perfil...</Text>
        </VStack>
      </Center>
    );
  }

  const fields = [
    { label: 'Nombre', value: user.first_name },
    { label: 'Apellido', value: user.last_name },
    { label: 'Email', value: user.email },
    { label: 'Rol', value: user.role === 'docente' ? 'Docente' : user.role },
    { label: 'Teléfono', value: user.phone || '—' },
  ];

  return (
    <Box maxW="600px">
      <Heading size="lg" mb={6}>Mi Perfil</Heading>
      <Card variant="outline">
        <CardBody>
          <VStack spacing={3} align="stretch">
            {fields.map((f) => (
              <HStack
                key={f.label}
                justify="space-between"
                p={3}
                bg="gray.50"
                borderRadius="md"
              >
                <Text fontWeight="semibold" fontSize="sm" color="gray.600">
                  {f.label}
                </Text>
                <Text fontSize="sm">{f.value}</Text>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}

// ─── Courses Section ─────────────────────────────────────────────────

function CoursesSection() {
  const toast = useToast();
  const showToast = useCallback((status, title, description) => {
    toast({ title, description, status, duration: 3000, isClosable: true, position: 'top-right' });
  }, [toast]);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [gradeForm, setGradeForm] = useState({
    student_id: '',
    subject_id: '',
    grade: 0,
    type: 'tarea',
    description: '',
  });
  const [gradingStudent, setGradingStudent] = useState(null);
  const [gradeSubmitting, setGradeSubmitting] = useState(false);

  const selectedCourse = courses.find(c => String(c.id) === String(selectedCourseId));

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await teacherService.getMyCourses();
      setCourses(data || []);
      if (data && data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(String(data[0].id));
      }
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los cursos');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
    setSelectedSubjectId('');
    setGradeForm(prev => ({ ...prev, subject_id: '' }));
  };

  const handleSubjectChange = (e) => {
    const sid = e.target.value;
    setSelectedSubjectId(sid);
    setGradeForm(prev => ({ ...prev, subject_id: sid }));
  };

  const openGradeModal = (student) => {
    setGradingStudent(student);
    setGradeForm({
      student_id: student.id,
      subject_id: selectedSubjectId || '',
      grade: 0,
      type: 'tarea',
      description: '',
    });
    onOpen();
  };

  const handleGradeChange = (field, value) => {
    setGradeForm(prev => ({ ...prev, [field]: value }));
  };

  const submitGrade = async () => {
    if (!gradeForm.student_id) {
      showToast('warning', 'Atención', 'No se seleccionó un alumno');
      return;
    }
    if (!gradeForm.subject_id) {
      showToast('warning', 'Atención', 'No se seleccionó una materia');
      return;
    }

    setGradeSubmitting(true);
    try {
      await gradesService.createGrade({
        student_id: gradeForm.student_id,
        subject_id: parseInt(gradeForm.subject_id, 10),
        grade: parseFloat(gradeForm.grade),
        type: gradeForm.type,
        description: gradeForm.description,
      });
      showToast('success', 'Calificación guardada', 'La nota fue registrada correctamente');
      onClose();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudo guardar la calificación');
    } finally {
      setGradeSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────

  if (coursesLoading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="3px" />
          <Text color="gray.500">Cargando cursos...</Text>
        </VStack>
      </Center>
    );
  }

  if (courses.length === 0) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Heading size="lg" color="gray.400">Mis Cursos</Heading>
          <Text color="gray.500">No tenés cursos asignados.</Text>
        </VStack>
      </Center>
    );
  }

  const students = selectedCourse?.students || [];

  return (
    <Box>
      <Heading size="lg" mb={6}>Mis Cursos</Heading>

      {/* Course + Subject selectors */}
      <HStack spacing={4} mb={8} align="flex-end">
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
            Curso
          </FormLabel>
          <Select
            value={selectedCourseId}
            onChange={handleCourseChange}
            bg="white"
            size="lg"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.year ? ` (${c.year})` : ''}{c.division ? ` · ${c.division}` : ''}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
            Materia
          </FormLabel>
          <Select
            value={selectedSubjectId}
            onChange={handleSubjectChange}
            bg="white"
            size="lg"
            placeholder={selectedCourse?.subjects?.length ? 'Seleccionar materia' : 'Sin materias'}
            isDisabled={!selectedCourse || !selectedCourse.subjects?.length}
          >
            {(selectedCourse?.subjects || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </FormControl>
      </HStack>

      {selectedCourse && (
        <>
          {/* Course header */}
          <Flex
            justify="space-between"
            align="center"
            mb={6}
            p={4}
            bg="white"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
          >
            <Box>
              <Heading size="md" mb={1}>
                {selectedSubjectId
                  ? (selectedCourse.subjects.find(s => String(s.id) === String(selectedSubjectId))?.name || 'Materia')
                  : 'Seleccioná una materia'}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {selectedCourse.name}{selectedCourse.year ? ` · ${selectedCourse.year}` : ''}
                {selectedCourse.division ? ` · ${selectedCourse.division}` : ''}
              </Text>
            </Box>
            <Tag colorScheme="blue" size="lg" borderRadius="full">
              <TagLabel>{students.length} alumnos</TagLabel>
            </Tag>
          </Flex>

          {/* Students table */}
          {students.length === 0 ? (
            <Box
              textAlign="center"
              py={16}
              px={6}
              border="1px dashed"
              borderColor="gray.300"
              borderRadius="lg"
              bg="white"
            >
              <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={1}>
                Sin alumnos en este curso
              </Text>
              <Text fontSize="sm" color="gray.500">
                No hay alumnos inscriptos en esta materia.
              </Text>
            </Box>
          ) : (
            <TableContainer
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
              overflow="hidden"
              bg="white"
            >
              <Table variant="simple">
                <Thead bg="gray.100">
                  <Tr>
                    <Th
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color="gray.600"
                      py={4}
                    >
                      Nombre
                    </Th>
                    <Th
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color="gray.600"
                      py={4}
                    >
                      DNI
                    </Th>
                    <Th
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color="gray.600"
                      py={4}
                      w="200px"
                    >
                      Acción
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {students.map((student, idx) => (
                    <Tr
                      key={student.id}
                      _hover={{ bg: 'gray.50', transition: 'background-color 160ms ease-out' }}
                    >
                      <Td py={4} fontSize="sm" fontWeight="medium">
                        {student.first_name} {student.last_name}
                      </Td>
                      <Td py={4} fontSize="sm" color="gray.500">
                        {student.dni || '—'}
                      </Td>
                      <Td py={4}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          leftIcon={<FiStar />}
                          onClick={() => openGradeModal(student)}
                          isDisabled={!selectedSubjectId}
                          _active={{ transform: 'scale(0.96)' }}
                          transition="transform 120ms ease-out"
                        >
                          Calificar
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* ─── Grade Modal ────────────────────────────────────────── */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Calificar a {gradingStudent?.first_name} {gradingStudent?.last_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.500">Materia</FormLabel>
                <Text fontWeight="semibold" fontSize="md">
                  {selectedCourse?.subjects?.find(s => String(s.id) === selectedSubjectId)?.name || '—'}
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Nota (0–10)</FormLabel>
                <NumberInput
                  min={0}
                  max={10}
                  step={0.01}
                  precision={2}
                  value={gradeForm.grade}
                  onChange={(val) => handleGradeChange('grade', val)}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Tipo</FormLabel>
                <Select
                  value={gradeForm.type}
                  onChange={(e) => handleGradeChange('type', e.target.value)}
                  bg="white"
                >
                  {Object.entries(gradeTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Descripción</FormLabel>
                <Textarea
                  value={gradeForm.description}
                  onChange={(e) => handleGradeChange('description', e.target.value)}
                  placeholder="Opcional — comentarios sobre la calificación"
                  bg="white"
                />
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={submitGrade}
                isLoading={gradeSubmitting}
                loadingText="Guardando..."
                w="full"
                size="lg"
                leftIcon={<FiCheckCircle />}
                _active={{ transform: 'scale(0.96)' }}
                transition="transform 120ms ease-out"
              >
                Guardar Calificación
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

// ─── Main DocenteDashboard ───────────────────────────────────────────

export default function DocenteDashboard() {
  const sections = [
    { id: 'courses', label: 'Mis Cursos', icon: FiBookOpen, component: CoursesSection },
    { id: 'profile', label: 'Mi Perfil', icon: FiUser, component: ProfileSection },
  ];

  return <DashboardLayout sections={sections} />;
}
