import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Select,
  Input,
  FormControl,
  FormLabel,
  Heading,
  Text,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Skeleton,
  Stack,
  VStack,
} from '@chakra-ui/react';
import DashboardHeader from '../components/DashboardHeader';
import { attendanceService } from '../services/attendanceService';
import { adminService } from '../services/adminService';
import api from '../services/api';

const statusColors = {
  presente: 'green',
  ausente: 'red',
  tarde: 'orange',
};

const statusLabels = {
  presente: 'Presente',
  ausente: 'Ausente',
  tarde: 'Tarde',
};

function todayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export default function DocenteDashboard() {
  const toast = useToast();

  const showToast = useCallback((status, title, description) => {
    toast({ title, description, status, duration: 3000, isClosable: true, position: 'top-right' });
  }, [toast]);

  // ─── Subjects (materias del docente) ──────────────────────────
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // ─── Students ─────────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // ─── History ──────────────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ─── Date range ───────────────────────────────────────────────
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(todayString);

  // ─── Fetch subjects (my materias) ─────────────────────────────
  const fetchSubjects = useCallback(async () => {
    setSubjectsLoading(true);
    try {
      const { data: res } = await api.get('/subjects/my');
      setSubjects(res.data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar las materias');
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // ─── Fetch students when subject changes ──────────────────────
  const fetchStudents = useCallback(async (subjectId) => {
    if (!subjectId) {
      setStudents([]);
      setSelectedStudentId('');
      return;
    }
    setStudentsLoading(true);
    try {
      // Get the course_id from the selected subject
      const subject = subjects.find(s => s.id === parseInt(subjectId, 10));
      if (!subject || !subject.course_id) {
        setStudents([]);
        setStudentsLoading(false);
        return;
      }

      const data = await adminService.getStudents();
      const filtered = (data || []).filter(s => s.course_id === subject.course_id);
      setStudents(filtered);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los alumnos');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, [subjects, showToast]);

  useEffect(() => {
    fetchStudents(selectedSubjectId);
  }, [selectedSubjectId, fetchStudents]);

  // ─── Fetch history when student changes ───────────────────────
  const fetchHistory = useCallback(async () => {
    if (!selectedStudentId) {
      setHistory([]);
      setSummary(null);
      return;
    }

    setHistoryLoading(true);
    try {
      const params = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const result = await attendanceService.getStudentHistory(selectedStudentId, params);
      setHistory(result.records || []);
      setSummary(result.summary || null);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al cargar el historial');
      setHistory([]);
      setSummary(null);
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedStudentId, fromDate, toDate, showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ─── Subject change handler ───────────────────────────────────
  const handleSubjectChange = (e) => {
    setSelectedSubjectId(e.target.value);
    setSelectedStudentId('');
    setHistory([]);
    setSummary(null);
  };

  // ─── Student change handler ───────────────────────────────────
  const handleStudentChange = (e) => {
    setSelectedStudentId(e.target.value);
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg="gray.50">
      <DashboardHeader />

      <Box maxW="1200px" mx="auto" p={6}>
        <Heading size="lg" mb={6}>Panel de Docente</Heading>

        {/* ─── Filters ─────────────────────────────────────────── */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
              Materia
            </FormLabel>
            <Select
              value={selectedSubjectId}
              onChange={handleSubjectChange}
              placeholder="Seleccionar materia"
              bg="white"
            >
              {subjectsLoading ? (
                <option disabled>Cargando materias...</option>
              ) : (
                subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.course ? ` — ${s.course.name} (${s.course.year})` : ''}
                  </option>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
              Alumno
            </FormLabel>
            <Select
              value={selectedStudentId}
              onChange={handleStudentChange}
              placeholder={studentsLoading ? 'Cargando alumnos...' : 'Seleccionar alumno'}
              bg="white"
              isDisabled={!selectedSubjectId || studentsLoading}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name}{s.dni ? ` — DNI: ${s.dni}` : ''}
                </option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>

        {/* Date range filters */}
        {selectedStudentId && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Desde
              </FormLabel>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                bg="white"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Hasta
              </FormLabel>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                bg="white"
                max={todayString()}
              />
            </FormControl>
          </SimpleGrid>
        )}

        {/* ─── Empty state: no subject selected ────────────────── */}
        {!selectedSubjectId && (
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
              Seleccioná una materia para comenzar
            </Text>
            <Text fontSize="sm" color="gray.500">
              Elegí una materia del selector superior para ver los alumnos y su historial de asistencias.
            </Text>
          </Box>
        )}

        {/* ─── Subject selected, no student selected ───────────── */}
        {selectedSubjectId && !selectedStudentId && (
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
              Seleccioná un alumno para ver su historial
            </Text>
            <Text fontSize="sm" color="gray.500">
              Elegí un alumno del selector superior para consultar sus registros de asistencia.
            </Text>
          </Box>
        )}

        {/* ─── Student selected: show summary + history ────────── */}
        {selectedStudentId && (
          <>
            {/* Summary cards */}
            {summary && (
              <StatGroup mb={6} gap={4}>
                <Stat
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <StatLabel fontSize="xs" color="gray.500">Total registros</StatLabel>
                  <StatNumber fontSize="2xl">{summary.total_days}</StatNumber>
                </Stat>
                <Stat
                  bg="green.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="green.200"
                >
                  <StatLabel fontSize="xs" color="green.700">Presentes</StatLabel>
                  <StatNumber fontSize="2xl" color="green.600">
                    {summary.total_days - summary.total_absences}
                  </StatNumber>
                </Stat>
                <Stat
                  bg="red.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="red.200"
                >
                  <StatLabel fontSize="xs" color="red.700">Ausencias</StatLabel>
                  <StatNumber fontSize="2xl" color="red.600">{summary.total_absences}</StatNumber>
                </Stat>
                <Stat
                  bg="yellow.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="yellow.200"
                >
                  <StatLabel fontSize="xs" color="yellow.700">Justificadas</StatLabel>
                  <StatNumber fontSize="2xl" color="yellow.600">{summary.justified_absences}</StatNumber>
                </Stat>
                <Stat
                  bg="orange.50"
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="orange.200"
                >
                  <StatLabel fontSize="xs" color="orange.700">Sin justificar</StatLabel>
                  <StatNumber fontSize="2xl" color="orange.600">{summary.unjustified_absences}</StatNumber>
                </Stat>
              </StatGroup>
            )}

            {/* History table */}
            {historyLoading ? (
              <Stack spacing={3} role="status" aria-label="Cargando historial">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} height="48px" borderRadius="md" speed={0.8}>
                    <Box height="48px" />
                  </Skeleton>
                ))}
              </Stack>
            ) : history.length === 0 ? (
              <Box
                textAlign="center"
                py={12}
                px={6}
                border="1px dashed"
                borderColor="gray.300"
                borderRadius="lg"
                bg="white"
              >
                <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={1}>
                  No hay registros de asistencia
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {fromDate || toDate
                    ? 'No se encontraron asistencias en el rango de fechas seleccionado.'
                    : 'Este alumno no tiene asistencias registradas.'}
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
                <Table variant="striped" colorScheme="gray">
                  <Thead bg="gray.100">
                    <Tr>
                      <Th fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="gray.600" py={4}>
                        Fecha
                      </Th>
                      <Th fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="gray.600" py={4}>
                        Estado
                      </Th>
                      <Th fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="gray.600" py={4}>
                        Justificada
                      </Th>
                      <Th fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="gray.600" py={4}>
                        Nota
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {history.map((record, idx) => (
                      <Tr
                        key={record.id}
                        style={{ '--row-index': idx }}
                        sx={{
                          _hover: { bg: 'gray.100', transition: 'background-color 160ms ease-out' },
                          _active: { bg: 'gray.200' },
                          animation: 'fadeSlideIn 300ms ease-out both',
                          animationDelay: 'calc(var(--row-index, 0) * 30ms)',
                        }}
                      >
                        <Td py={3} fontSize="sm">
                          {new Date(record.date).toLocaleDateString('es-AR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Td>
                        <Td py={3}>
                          <Badge
                            colorScheme={statusColors[record.status] || 'gray'}
                            variant="subtle"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            {statusLabels[record.status] || record.status}
                          </Badge>
                        </Td>
                        <Td py={3}>
                          {record.is_justified ? (
                            <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="full">
                              Sí
                            </Badge>
                          ) : (
                            <Text fontSize="sm" color="gray.400">—</Text>
                          )}
                        </Td>
                        <Td py={3} fontSize="sm" color="gray.600">
                          {record.justification_note || '—'}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Box as="style" display="none">
                  {`
                    @keyframes fadeSlideIn {
                      from { opacity: 0; transform: translateY(6px); }
                      to   { opacity: 1; transform: translateY(0); }
                    }
                  `}
                </Box>
              </TableContainer>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
