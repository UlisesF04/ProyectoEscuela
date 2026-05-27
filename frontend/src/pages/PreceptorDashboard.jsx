import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Select,
  Input,
  FormControl,
  FormLabel,
  HStack,
  VStack,
  Heading,
  Text,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  SimpleGrid,
  Skeleton,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import DashboardHeader from '../components/DashboardHeader';
import AttendanceGrid from '../components/AttendanceGrid';
import { attendanceService } from '../services/attendanceService';
import { adminService } from '../services/adminService';

function todayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export default function PreceptorDashboard() {
  const toast = useToast();

  const showToast = useCallback((status, title, description) => {
    toast({ title, description, status, duration: 3000, isClosable: true, position: 'top-right' });
  }, [toast]);

  // ─── Courses ──────────────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // ─── Students ─────────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // ─── Date ─────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(todayString);

  // ─── Attendance state ─────────────────────────────────────────
  const [attendances, setAttendances] = useState({});
  const [savedAttendances, setSavedAttendances] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // ─── Summary ──────────────────────────────────────────────────
  const [summary, setSummary] = useState({ presente: 0, ausente: 0, tarde: 0, total: 0 });

  // ─── Justify Modal ────────────────────────────────────────────
  const [justifyModalOpen, setJustifyModalOpen] = useState(false);
  const [justifyingAttendance, setJustifyingAttendance] = useState(null);
  const [justificationNote, setJustificationNote] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [justifying, setJustifying] = useState(false);

  // Track current fetch to avoid stale responses
  const fetchIdRef = useRef(0);

  // ─── Fetch courses ────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await adminService.getCourses();
      setCourses(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los cursos');
    } finally {
      setCoursesLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ─── Fetch students when course changes ───────────────────────
  const fetchStudents = useCallback(async (courseId) => {
    if (!courseId) {
      setStudents([]);
      return;
    }
    setStudentsLoading(true);
    setAttendances({});
    setSavedAttendances({});
    setSummary({ presente: 0, ausente: 0, tarde: 0, total: 0 });
    try {
      const data = await adminService.getStudents();
      const filtered = (data || []).filter(s => s.course_id === parseInt(courseId, 10));
      setStudents(filtered);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los alumnos');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStudents(selectedCourseId);
  }, [selectedCourseId, fetchStudents]);

  // ─── Fetch existing attendances for date+course ───────────────
  const fetchExistingAttendances = useCallback(async () => {
    if (!selectedCourseId || !selectedDate || students.length === 0) {
      return;
    }

    const fetchId = ++fetchIdRef.current;
    setLoadingSaved(true);
    try {
      const recordsMap = {};
      const savedMap = {};

      for (const student of students) {
        if (fetchId !== fetchIdRef.current) return;

        const result = await attendanceService.getStudentHistory(student.id, {
          from: selectedDate,
          to: selectedDate,
        });
        const dayRecord = result.records && result.records.length > 0 ? result.records[0] : null;
        const key = `${student.id}-${selectedDate}`;

        if (dayRecord) {
          recordsMap[key] = dayRecord.status;
          savedMap[key] = dayRecord;
        }
      }

      if (fetchId !== fetchIdRef.current) return;

      setAttendances((prev) => {
        const merged = { ...prev };
        Object.keys(recordsMap).forEach((k) => {
          merged[k] = recordsMap[k];
        });
        return merged;
      });
      setSavedAttendances((prev) => ({ ...prev, ...savedMap }));
    } catch (err) {
      if (fetchId === fetchIdRef.current) {
        showToast('error', 'Error', err.response?.data?.message || 'Error al cargar asistencias existentes');
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoadingSaved(false);
      }
    }
  }, [selectedCourseId, selectedDate, students, showToast]);

  useEffect(() => {
    fetchExistingAttendances();
  }, [fetchExistingAttendances]);

  // ─── Compute summary ──────────────────────────────────────────
  const computeSummary = useCallback((attMap, total) => {
    const counts = { presente: 0, ausente: 0, tarde: 0 };
    Object.values(attMap).forEach((status) => {
      if (counts[status] !== undefined) counts[status]++;
    });
    setSummary({ ...counts, total });
  }, []);

  // ─── Handle status change ─────────────────────────────────────
  const handleStatusChange = (studentId, status) => {
    setAttendances((prev) => {
      const key = `${studentId}-${selectedDate}`;
      const next = { ...prev, [key]: status };
      computeSummary(next, students.length);
      return next;
    });
  };

  // ─── Get changed records (dirty vs saved) ─────────────────────
  const getChangedRecords = () => {
    const records = [];
    students.forEach((student) => {
      const key = `${student.id}-${selectedDate}`;
      const newStatus = attendances[key];
      const saved = savedAttendances[key];
      if (newStatus && (!saved || saved.status !== newStatus)) {
        records.push({
          student_id: student.id,
          date: selectedDate,
          status: newStatus,
        });
      }
    });
    return records;
  };

  // ─── Save all ─────────────────────────────────────────────────
  const handleSaveAll = async () => {
    const changedRecords = getChangedRecords();
    if (changedRecords.length === 0) {
      showToast('info', 'Sin cambios', 'No hay cambios para guardar');
      return;
    }

    setSaving(true);
    try {
      const created = await attendanceService.batchRegister(changedRecords);
      showToast('success', 'Asistencias guardadas', `${created.length} registro(s) guardado(s) correctamente`);

      const newSaved = { ...savedAttendances };
      created.forEach((rec) => {
        const key = `${rec.student_id}-${rec.date}`;
        newSaved[key] = rec;
      });
      setSavedAttendances(newSaved);

      const curAtt = { ...attendances };
      created.forEach((rec) => {
        const key = `${rec.student_id}-${rec.date}`;
        if (rec.status) curAtt[key] = rec.status;
      });
      setAttendances(curAtt);
      computeSummary(curAtt, students.length);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar las asistencias';
      showToast('error', 'Error', msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Open justify modal ───────────────────────────────────────
  const openJustifyModal = (attendanceRecord) => {
    setJustifyingAttendance(attendanceRecord);
    setJustificationNote(attendanceRecord.justification_note || '');
    setCertificateFile(null);
    setJustifyModalOpen(true);
  };

  // ─── Handle justify ───────────────────────────────────────────
  const handleJustify = async () => {
    if (!justifyingAttendance) return;
    setJustifying(true);
    try {
      const attId = justifyingAttendance.id;

      if (certificateFile) {
        const formData = new FormData();
        formData.append('attendance_id', attId);
        formData.append('certificate', certificateFile);
        await attendanceService.uploadCertificate(formData);
      } else {
        await attendanceService.justify(attId, { justification_note: justificationNote });
      }

      showToast('success', 'Inasistencia justificada', 'Se registró la justificación correctamente');
      setJustifyModalOpen(false);
      setJustifyingAttendance(null);
      setJustificationNote('');
      setCertificateFile(null);
      // Refresh to show updated state
      fetchExistingAttendances();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al justificar la inasistencia';
      showToast('error', 'Error', msg);
    } finally {
      setJustifying(false);
    }
  };

  // ─── Detect changed records count ─────────────────────────────
  const changedCount = getChangedRecords().length;

  // ─── Course change handler ────────────────────────────────────
  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
  };

  // ─── Date change handler ──────────────────────────────────────
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setAttendances({});
    setSavedAttendances({});
    setSummary({ presente: 0, ausente: 0, tarde: 0, total: 0 });
  };

  // Get justifiable students (ausente, saved, not justified)
  const justifiableStudents = students.filter((s) => {
    const key = `${s.id}-${selectedDate}`;
    const saved = savedAttendances[key];
    return saved && saved.status === 'ausente' && !saved.is_justified;
  });

  // ─── Render ───────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg="gray.50">
      <DashboardHeader />

      <Box maxW="1200px" mx="auto" p={6}>
        <Heading size="lg" mb={6}>Panel de Preceptor</Heading>

        {/* ─── Filters ─────────────────────────────────────────── */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
              Curso
            </FormLabel>
            <Select
              value={selectedCourseId}
              onChange={handleCourseChange}
              placeholder="Seleccionar curso"
              bg="white"
            >
              {coursesLoading ? (
                <option disabled>Cargando cursos...</option>
              ) : (
                courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.year}){c.division ? ` - ${c.division}` : ''}
                  </option>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
              Fecha
            </FormLabel>
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              bg="white"
            />
          </FormControl>

          <FormControl display="flex" alignItems="flex-end">
            <Button
              colorScheme="blue"
              leftIcon={<CheckIcon />}
              onClick={handleSaveAll}
              isLoading={saving}
              isDisabled={!selectedCourseId || changedCount === 0}
              width="full"
              _active={{ transform: 'scale(0.96)' }}
              transition="transform 120ms ease-out"
            >
              Guardar Todo{changedCount > 0 ? ` (${changedCount})` : ''}
            </Button>
          </FormControl>
        </SimpleGrid>

        {/* ─── Empty state: no course selected ─────────────────── */}
        {!selectedCourseId && !studentsLoading && (
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
              Seleccioná un curso para comenzar
            </Text>
            <Text fontSize="sm" color="gray.500">
              Elegí un curso del selector superior para ver sus alumnos y registrar asistencias.
            </Text>
          </Box>
        )}

        {/* ─── Course selected, show content ───────────────────── */}
        {selectedCourseId && (
          <>
            {/* Summary cards */}
            <StatGroup mb={6} gap={4}>
              <Stat
                bg="white"
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
              >
                <StatLabel fontSize="xs" color="gray.500">Total alumnos</StatLabel>
                <StatNumber fontSize="2xl">{summary.total || students.length}</StatNumber>
              </Stat>
              <Stat
                bg="green.50"
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor="green.200"
              >
                <StatLabel fontSize="xs" color="green.700">Presentes</StatLabel>
                <StatNumber fontSize="2xl" color="green.600">{summary.presente}</StatNumber>
              </Stat>
              <Stat
                bg="red.50"
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor="red.200"
              >
                <StatLabel fontSize="xs" color="red.700">Ausentes</StatLabel>
                <StatNumber fontSize="2xl" color="red.600">{summary.ausente}</StatNumber>
              </Stat>
              <Stat
                bg="orange.50"
                p={4}
                borderRadius="lg"
                border="1px solid"
                borderColor="orange.200"
              >
                <StatLabel fontSize="xs" color="orange.700">Tardes</StatLabel>
                <StatNumber fontSize="2xl" color="orange.600">{summary.tarde}</StatNumber>
              </Stat>
            </StatGroup>

            {/* Loading state for saved attendances */}
            {loadingSaved ? (
              <Skeleton height="300px" borderRadius="lg" speed={0.8} mb={4}>
                <Box height="300px" />
              </Skeleton>
            ) : (
              <>
                {/* Attendance Grid */}
                <AttendanceGrid
                  students={students}
                  selectedDate={selectedDate}
                  attendances={attendances}
                  onStatusChange={handleStatusChange}
                  loading={studentsLoading}
                />

                {/* Justify section for ausente students */}
                {justifiableStudents.length > 0 && (
                  <Box mt={6}>
                    <Heading size="sm" mb={3} color="gray.700">
                      Justificar inasistencias
                    </Heading>
                    <Box
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="gray.200"
                      overflow="hidden"
                      bg="white"
                    >
                      {justifiableStudents.map((student) => {
                        const key = `${student.id}-${selectedDate}`;
                        const saved = savedAttendances[key];
                        return (
                          <HStack
                            key={student.id}
                            p={3}
                            borderBottom="1px solid"
                            borderColor="gray.100"
                            _hover={{ bg: 'gray.50', transition: 'background-color 160ms ease-out' }}
                          >
                            <Text fontSize="sm" fontWeight="medium" flex={1}>
                              {student.first_name} {student.last_name}
                            </Text>
                            <Badge colorScheme="red" variant="subtle" mr={2}>
                              Ausente
                            </Badge>
                            <Button
                              size="xs"
                              colorScheme="yellow"
                              variant="outline"
                              onClick={() => openJustifyModal(saved)}
                              _active={{ transform: 'scale(0.96)' }}
                              transition="transform 120ms ease-out"
                            >
                              Justificar
                            </Button>
                          </HStack>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Box>

      {/* ─── Justify Modal ─────────────────────────────────────── */}
      <Modal isOpen={justifyModalOpen} onClose={() => setJustifyModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Justificar Inasistencia</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nota de justificación</FormLabel>
                <Textarea
                  value={justificationNote}
                  onChange={(e) => setJustificationNote(e.target.value)}
                  placeholder="Opcional: agregá una nota..."
                  rows={3}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Certificado (opcional)</FormLabel>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setCertificateFile(e.target.files[0] || null)}
                  p={1}
                  py={1}
                  height="auto"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Formatos aceptados: JPG, PNG, PDF (máx 5MB)
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setJustifyModalOpen(false)}
              _active={{ transform: 'scale(0.96)' }}
              transition="transform 120ms ease-out"
            >
              Cancelar
            </Button>
            <Button
              colorScheme="yellow"
              onClick={handleJustify}
              isLoading={justifying}
              _active={{ transform: 'scale(0.96)' }}
              transition="transform 120ms ease-out"
            >
              Justificar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box as="style" display="none">
        {`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}
      </Box>
    </Box>
  );
}
