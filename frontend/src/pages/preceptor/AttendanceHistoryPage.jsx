import {
  Box, Heading, Select, Input, Text, SimpleGrid, Stat, StatLabel, StatNumber,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { attendanceService } from '../../services/attendanceService';
import DataTable from '../../components/DataTable';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';

const statusConfig = {
  presente: { colorScheme: 'green', label: 'Presente' },
  ausente: { colorScheme: 'red', label: 'Ausente' },
  tarde: { colorScheme: 'orange', label: 'Tarde' },
};

export default function AttendanceHistoryPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService.getCourses()
      .then((data) => setCourses(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCourseId || !selectedDate) return;
    setLoading(true);
    setError(null);
    attendanceService.getCourseAttendance(parseInt(selectedCourseId), selectedDate)
      .then((result) => {
        setRecords(result.records || []);
        setSummary(result.summary || null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [selectedCourseId, selectedDate]);

  const columns = [
    {
      key: 'student', label: 'Alumno',
      render: (r) => <Text fontWeight={500}>{r.first_name} {r.last_name}</Text>,
    },
    {
      key: 'status', label: 'Estado',
      render: (r) => {
        if (!r.status) return <Text color="onSurfaceVariant">—</Text>;
        const cfg = statusConfig[r.status] || { colorScheme: 'gray', label: r.status };
        return (
          <Text
            as="span"
            px={3} py={1}
            borderRadius="pill"
            fontSize="sm"
            fontWeight={600}
            bg={`${cfg.colorScheme}.100`}
            color={`${cfg.colorScheme}.700`}
          >
            {cfg.label}
          </Text>
        );
      },
    },
    {
      key: 'justificada', label: 'Justificada',
      render: (r) => r.is_justified ? 'Sí' : 'No',
    },
  ];

  return (
    <Box>
      <ErrorAlert error={error} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">Historial de Asistencia</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
        <Box>
          <Text fontSize="xs" fontWeight={600} color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="wider">Curso</Text>
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
        <Box>
          <Text fontSize="xs" fontWeight={600} color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="wider">Fecha</Text>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            borderRadius="input"
          />
        </Box>
      </SimpleGrid>

      {!selectedCourseId ? (
        <Box textAlign="center" py={12} px={6} borderRadius="card" bg="containerLow">
          <Text fontSize="lg" fontWeight="semibold" color="onSurface" mb={1}>
            Seleccione un curso y fecha
          </Text>
          <Text fontSize="sm" color="onSurfaceVariant">
            Elija un curso y una fecha para ver el historial de asistencia.
          </Text>
        </Box>
      ) : loading ? (
        <LoadingSkeleton variant="table" rows={5} columns={3} />
      ) : (
        <>
          {summary && (
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
              <Box p={4} borderRadius="card" bg="white" boxShadow="warmSm" textAlign="center" borderLeft="4px solid" borderColor="success">
                <Stat>
                  <StatLabel color="success" fontSize="sm">Presentes</StatLabel>
                  <StatNumber color="success" fontSize="2xl" fontWeight={700}>{summary.presente || 0}</StatNumber>
                </Stat>
              </Box>
              <Box p={4} borderRadius="card" bg="white" boxShadow="warmSm" textAlign="center" borderLeft="4px solid" borderColor="error">
                <Stat>
                  <StatLabel color="error" fontSize="sm">Ausentes</StatLabel>
                  <StatNumber color="error" fontSize="2xl" fontWeight={700}>{summary.ausente || 0}</StatNumber>
                </Stat>
              </Box>
              <Box p={4} borderRadius="card" bg="white" boxShadow="warmSm" textAlign="center" borderLeft="4px solid" borderColor="amber">
                <Stat>
                  <StatLabel color="amber" fontSize="sm">Tardes</StatLabel>
                  <StatNumber color="amber" fontSize="2xl" fontWeight={700}>{summary.tarde || 0}</StatNumber>
                </Stat>
              </Box>
              <Box p={4} borderRadius="card" bg="white" boxShadow="warmSm" textAlign="center" borderLeft="4px solid" borderColor="blue.400">
                <Stat>
                  <StatLabel color="blue.400" fontSize="sm">Justificadas</StatLabel>
                  <StatNumber color="blue.400" fontSize="2xl" fontWeight={700}>{summary.justificadas || 0}</StatNumber>
                </Stat>
              </Box>
            </SimpleGrid>
          )}

          <DataTable
            columns={columns}
            data={records}
            loading={loading}
            emptyMessage="No hay registros de asistencia para esta fecha"
          />
        </>
      )}
    </Box>
  );
}
