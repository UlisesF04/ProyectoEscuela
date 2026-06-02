import {
  Box, Heading, Button, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure, VStack, HStack,
  Text, Badge, useToast, Spacer, List, ListItem, ListIcon, IconButton,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiUserCheck, FiBookOpen } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import CustomSelect from '../../components/CustomSelect';
import { adminService } from '../../services/adminService';

export default function AssignmentsPage() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchTeachers = () => {
    setLoading(true);
    setError(null);
    adminService.getUsersByRole('docente')
      .then((data) => setTeachers(data || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  const fetchCourses = () => {
    adminService.getCourses()
      .then((data) => setCourses(data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, []);

  const openTeacherModal = async (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedCourseId('');
    setSelectedSubjectId('');
    setSubjects([]);
    setSubjectsLoading(true);
    onOpen();
    try {
      const data = await adminService.getTeacherSubjects(teacher.id);
      setTeacherSubjects(data || []);
    } catch {
      setTeacherSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedSubjectId('');
    if (!courseId) { setSubjects([]); return; }
    try {
      const data = await adminService.getSubjects(courseId);
      setSubjects(data || []);
    } catch {
      setSubjects([]);
    }
  };

  const handleAssign = async () => {
    if (!selectedSubjectId || !selectedTeacher) return;
    setAssigning(true);
    try {
      await adminService.assignTeacher(selectedSubjectId, { user_id: selectedTeacher.id });
      toast({ title: 'Asignación exitosa', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      const data = await adminService.getTeacherSubjects(selectedTeacher.id);
      setTeacherSubjects(data || []);
      setSelectedSubjectId('');
    } catch (err) {
      toast({
        title: 'Error al asignar',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 5000, isClosable: true, position: 'top-right',
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveSubject = async (subjectId) => {
    try {
      await adminService.removeTeacher(subjectId, selectedTeacher.id);
      toast({ title: 'Materia desasignada', status: 'info', duration: 3000, isClosable: true, position: 'top-right' });
      const data = await adminService.getTeacherSubjects(selectedTeacher.id);
      setTeacherSubjects(data || []);
    } catch (err) {
      toast({
        title: 'Error al desasignar',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 5000, isClosable: true, position: 'top-right',
      });
    }
  };

  const columns = [
    { key: 'first_name', label: 'Nombre', render: (t) => `${t.first_name} ${t.last_name}` },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono', render: (t) => t.phone || '—' },
  ];

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchTeachers} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Docentes
      </Heading>
      <DataTable
        columns={columns}
        data={teachers}
        loading={loading}
        emptyMessage="No hay docentes registrados"
        emptyDescription="Cree usuarios con rol docente para comenzar."
        actions={[
          {
            label: 'Ver Materias', icon: FiBookOpen, colorScheme: 'brand', variant: 'outline',
            onClick: (teacher) => openTeacherModal(teacher),
          },
        ]}
      />

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside" motionPreset="scale">
        <ModalOverlay />
        <ModalContent
          borderRadius="card"
          sx={{ transformOrigin: 'center', '&[data-open]': { animation: 'fadeSlideIn 200ms ease-out' } }}
        >
          <ModalHeader fontFamily="heading">
            Materias de {selectedTeacher?.first_name} {selectedTeacher?.last_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight={600} mb={2} fontSize="sm" color="onSurfaceVariant">
                  Materias asignadas actualmente
                </Text>
                {subjectsLoading ? (
                  <LoadingSkeleton variant="text" rows={2} />
                ) : teacherSubjects.length === 0 ? (
                  <Text fontSize="sm" color="onSurfaceVariant" fontStyle="italic">
                    Sin materias asignadas
                  </Text>
                ) : (
                  <List spacing={2}>
                    {teacherSubjects.map((s) => (
                      <ListItem
                        key={s.id}
                        p={3}
                        borderRadius="input"
                        bg="containerLow"
                        display="flex"
                        alignItems="center"
                        gap={3}
                      >
                        <HStack flex={1} spacing={2}>
                          <Text fontWeight={500} fontSize="sm">{s.subject_name}</Text>
                          {s.course_name && (
                            <Badge variant="subtle" colorScheme="brand" fontSize="xs">
                              {s.course_name}
                            </Badge>
                          )}
                        </HStack>
                        <IconButton
                          icon={<FiX />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          borderRadius="pill"
                          onClick={() => handleRemoveSubject(s.subject_id)}
                          minW="44px" minH="44px"
                          _active={{ transform: 'scale(0.97)' }}
                          transition="transform 160ms ease-out"
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>

              <Box borderTop="1px solid" borderColor="outline" pt={4}>
                <Text fontWeight={600} mb={3} fontSize="sm" color="onSurfaceVariant">
                  Asignar nueva materia
                </Text>
                <VStack spacing={3} align="stretch">
                  <CustomSelect
                    placeholder="Seleccionar curso"
                    value={selectedCourseId}
                    onChange={handleCourseChange}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </CustomSelect>
                  <CustomSelect
                    placeholder="Seleccionar materia"
                    value={selectedSubjectId}
                    onChange={setSelectedSubjectId}
                    isDisabled={!selectedCourseId || subjects.length === 0}
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </CustomSelect>
                  <Button
                    leftIcon={<FiCheck />}
                    colorScheme="brand"
                    isDisabled={!selectedSubjectId}
                    isLoading={assigning}
                    onClick={handleAssign}
                    _active={{ transform: 'scale(0.97)' }}
                    transition="transform 160ms ease-out"
                  >
                    Asignar
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
