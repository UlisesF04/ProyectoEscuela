import {
  Box, Heading, Input, Button, HStack, Text, SimpleGrid,
  Stat, StatLabel, StatNumber, useToast, VStack,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import AttendanceGrid from '../../components/AttendanceGrid';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import CustomSelect from '../../components/CustomSelect';
import DatePicker from '../../components/DatePicker';
import { adminService } from '../../services/adminService';
import { attendanceService } from '../../services/attendanceService';

export default function AttendanceRegisterPage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState({});
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const toast = useToast();

  useEffect(() => {
    setLoadingCourses(true);
    adminService.getCourses()
      .then((data) => setCourses(data || []))
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    if (!selectedCourseId || !selectedDate) return;
    attendanceService.getCourseAttendance(parseInt(selectedCourseId), selectedDate)
      .then((result) => {
        const attMap = {};
        (result.records || []).forEach((r) => {
          if (r.status) attMap[`${r.id}-${selectedDate}`] = r.status;
        });
        setAttendances(attMap);
      })
      .catch(() => {});
  }, [selectedCourseId, selectedDate, refreshTrigger]);

  const handleCourseChange = async (courseId) => {
    setSelectedCourseId(courseId);
    setAttendances({});
    if (!courseId) { setStudents([]); return; }
    setLoadingStudents(true);
    setError(null);
    try {
      const allStudents = await adminService.getStudents();
      const courseStudents = (allStudents || []).filter((s) => s.course_id === parseInt(courseId) || s.Course?.id === parseInt(courseId));
      setStudents(courseStudents);
    } catch (err) {
      setError(err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendances((prev) => {
      const key = `${studentId}-${selectedDate}`;
      const current = prev[key];
      if (current === status) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: status };
    });
  };

  const handleSave = async () => {
    const records = Object.entries(attendances).map(([key, status]) => {
      const [studentId] = key.split('-');
      return { student_id: parseInt(studentId), date: selectedDate, status };
    });
    if (records.length === 0) {
      toast({ title: 'No hay cambios para guardar', status: 'info', duration: 3000, isClosable: true, position: 'top-right' });
      return;
    }
    setSaving(true);
    try {
      await attendanceService.batchRegister(records);
      toast({ title: 'Asistencia registrada', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      toast({
        title: 'Error al guardar',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 5000, isClosable: true, position: 'top-right',
      });
    } finally {
      setSaving(false);
    }
  };

  const counts = { presente: 0, ausente: 0, tarde: 0 };
  Object.values(attendances).forEach((s) => { if (counts[s] !== undefined) counts[s]++; });

  return (
    <Box>
      <ErrorAlert error={error} onRetry={() => selectedCourseId && handleCourseChange(selectedCourseId)} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Registrar Asistencia
      </Heading>

      <VStack spacing={6} align="stretch">
        <HStack spacing={4} wrap="wrap">
          <Box flex={1} minW="200px">
            <Text fontSize="xs" fontWeight={600} color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="wider">
              Curso
            </Text>
            <CustomSelect
              placeholder="Seleccionar curso"
              value={selectedCourseId}
              onChange={handleCourseChange}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </CustomSelect>
          </Box>
          <Box>
            <Text fontSize="xs" fontWeight={600} color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="wider">
              Fecha
            </Text>
            <DatePicker value={selectedDate} onChange={setSelectedDate} w="180px" />
          </Box>
        </HStack>

        {loadingStudents ? (
          <LoadingSkeleton variant="table" rows={5} columns={3} />
        ) : !selectedCourseId ? (
          <Box textAlign="center" py={12} px={6} borderRadius="card" bg="containerLow">
            <Text fontSize="lg" fontWeight="semibold" color="onSurface" mb={1}>
              Seleccione un curso
            </Text>
            <Text fontSize="sm" color="onSurfaceVariant">
              Elija un curso y fecha para comenzar a registrar asistencias.
            </Text>
          </Box>
        ) : null}

        {selectedCourseId && !loadingStudents && students.length > 0 && (
          <>
            <AttendanceGrid
              students={students}
              selectedDate={selectedDate}
              attendances={attendances}
              onStatusChange={handleStatusChange}
              loading={false}
            />
            {Object.keys(attendances).length > 0 && (
              <>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                  <Box p={4} borderRadius="card" bg="white" boxShadow="warmSm" textAlign="center">
                    <Stat>
                      <StatLabel color="success" fontSize="sm">Presentes</StatLabel>
                      <StatNumber color="success" fontSize="2xl" fontWeight={700}>{counts.presente}</StatNumber>
                    </Stat>
                  </Box>
                  <Box p={4} borderRadius="card" bg="white" boxShadow="warmSm" textAlign="center">
                    <Stat>
                      <StatLabel color="error" fontSize="sm">Ausentes</StatLabel>
                      <StatNumber color="error" fontSize="2xl" fontWeight={700}>{counts.ausente}</StatNumber>
                    </Stat>
                  </Box>
                  <Box p={4} borderRadius="card" bg="white" boxShadow="warmSm" textAlign="center">
                    <Stat>
                      <StatLabel color="amber" fontSize="sm">Tardes</StatLabel>
                      <StatNumber color="amber" fontSize="2xl" fontWeight={700}>{counts.tarde}</StatNumber>
                    </Stat>
                  </Box>
                </SimpleGrid>
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="brand"
                  size="lg"
                  isLoading={saving}
                  onClick={handleSave}
                  alignSelf="flex-start"
                  _active={{ transform: 'scale(0.97)' }}
                  transition="transform 160ms ease-out"
                >
                  Guardar Asistencia
                </Button>
              </>
            )}
          </>
        )}

        {selectedCourseId && !loadingStudents && students.length === 0 && (
          <Box textAlign="center" py={12} px={6} border="1px dashed" borderColor="outline" borderRadius="card" bg="white">
            <Text fontSize="lg" fontWeight="semibold" color="onSurface" mb={1}>
              Este curso no tiene alumnos registrados
            </Text>
            <Text fontSize="sm" color="onSurfaceVariant">
              Agregue alumnos al curso desde el panel de Administración.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
