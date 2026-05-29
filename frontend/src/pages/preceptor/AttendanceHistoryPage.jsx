import {
  Box, Heading, Select, Input, Text, HStack, Badge, VStack,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import AttendanceSummary from '../../components/AttendanceSummary';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import { adminService } from '../../services/adminService';
import { attendanceService } from '../../services/attendanceService';

const statusColors = {
  presente: 'green',
  ausente: 'red',
  tarde: 'amber',
};

export default function AttendanceHistoryPage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    adminService.getCourses()
      .then((res) => setCourses(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourseId) { setStudents([]); setSelectedStudentId(''); return; }
    adminService.getStudents()
      .then((res) => {
        const filtered = (res.data || []).filter(
          (s) => s.course_id === parseInt(selectedCourseId) || s.Course?.id === parseInt(selectedCourseId)
        );
        setStudents(filtered);
      })
      .catch(() => {});
  }, [selectedCourseId]);

  const fetchHistory = () => {
    if (!selectedStudentId) return;
    setLoading(true);
    setError(null);
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (statusFilter) params.status = statusFilter;

    attendanceService.getStudentHistory(selectedStudentId, params)
      .then((res) => {
        setRecords(res.records || []);
        setSummary(res.summary || null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, [selectedStudentId, dateFrom, dateTo, statusFilter]);

  const selectedStudent = students.find((s) => s.id === parseInt(selectedStudentId));

  const columns = [
    {
      key: 'date', label: 'Fecha',
      render: (r) => r.date ? new Date(r.date).toLocaleDateString() : '—',
    },
    {
      key: 'status', label: 'Estado',
      render: (r) => (
        <Badge variant="subtle" colorScheme={statusColors[r.status] || 'gray'} fontSize="xs">
          {r.status || '—'}
        </Badge>
      ),
    },
    {
      key: 'is_justified', label: '¿Justificada?',
      render: (r) => (
        <Badge variant="subtle" colorScheme={r.is_justified ? 'green' : 'gray'} fontSize="xs">
          {r.is_justified ? 'Sí' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'certificate', label: 'Certificado',
      render: (r) => r.certificate_url ? (
        <Box
          as="a"
          href={r.certificate_url}
          target="_blank"
          rel="noopener noreferrer"
          display="inline-flex"
          alignItems="center"
          gap={1}
          fontSize="sm"
          color="primary"
        >
          <FiExternalLink size={14} />
          Ver
        </Box>
      ) : '—',
    },
    {
      key: 'registered_by', label: 'Registrado por',
      render: (r) => r.registered_by_name || r.registered_by || '—',
    },
  ];

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchHistory} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Historial de Asistencias
      </Heading>

      <VStack spacing={6} align="stretch">
        <HStack spacing={4} wrap="wrap">
          <Box flex={1} minW="200px">
            <Text fontSize="xs" fontWeight={600} color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="wider">
              Curso
            </Text>
            <Select
              placeholder="Seleccionar curso"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              borderRadius="input"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Box>
          <Box flex={1} minW="200px">
            <Text fontSize="xs" fontWeight={600} color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="wider">
              Alumno
            </Text>
            <Select
              placeholder={selectedCourseId ? 'Seleccionar alumno' : 'Seleccione un curso primero'}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              isDisabled={!selectedCourseId}
              borderRadius="input"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
              ))}
            </Select>
          </Box>
        </HStack>

        {!selectedStudentId ? (
          <Box textAlign="center" py={12} px={6} borderRadius="card" bg="containerLow">
            <Text fontSize="lg" fontWeight="semibold" color="onSurface" mb={1}>
              Seleccione un alumno para ver su historial
            </Text>
            <Text fontSize="sm" color="onSurfaceVariant">
              Elija un curso y luego seleccione un alumno.
            </Text>
          </Box>
        ) : loading ? (
          <LoadingSkeleton variant="card" rows={2} />
        ) : (
          <>
            <AttendanceSummary totals={summary} />

            <HStack spacing={4} wrap="wrap">
              <Box>
                <Text fontSize="xs" fontWeight={600} color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="wider">
                  Desde
                </Text>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  borderRadius="input"
                  size="sm"
                  w="160px"
                />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight={600} color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="wider">
                  Hasta
                </Text>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  borderRadius="input"
                  size="sm"
                  w="160px"
                />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight={600} color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="wider">
                  Estado
                </Text>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  placeholder="Todos"
                  borderRadius="input"
                  size="sm"
                  w="140px"
                >
                  <option value="presente">Presente</option>
                  <option value="ausente">Ausente</option>
                  <option value="tarde">Tarde</option>
                </Select>
              </Box>
            </HStack>

            <DataTable
              columns={columns}
              data={records}
              loading={loading}
              emptyMessage="No se encontraron registros de asistencia"
              emptyDescription={`${selectedStudent?.first_name || ''} ${selectedStudent?.last_name || ''} no tiene registros en este período.`}
            />
          </>
        )}
      </VStack>
    </Box>
  );
}
