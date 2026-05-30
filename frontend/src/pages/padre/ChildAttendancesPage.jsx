import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Text,
  Link,
} from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';
import ChildSelector from '../../components/ChildSelector';
import AttendanceSummary from '../../components/AttendanceSummary';
import { parentService } from '../../services/parentService';
import { attendanceService } from '../../services/attendanceService';
import ErrorAlert from '../../components/ErrorAlert';
import DataTable from '../../components/DataTable';

const statusConfig = {
  presente: { colorScheme: 'green', label: 'Presente' },
  ausente: { colorScheme: 'red', label: 'Ausente' },
  tarde: { colorScheme: 'orange', label: 'Tarde' },
};

export default function ChildAttendancesPage() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    parentService.getMyChildren()
      .then((data) => {
        setChildren(data || []);
        if (data && data.length > 0) setSelectedChild(data[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    setError(null);
    attendanceService.getStudentHistory(selectedChild.id)
      .then((result) => {
        const list = Array.isArray(result) ? result : result?.records || [];
        setRecords(list);
        setSummary(result?.summary || null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  const attendancePercent = (() => {
    if (!summary) return 100;
    const total = summary.totalDays || summary.total || 0;
    if (total === 0) return 100;
    const present = summary.present || summary.presentes || 0;
    const late = summary.late || summary.tardes || 0;
    return Math.round(((present + late) / total) * 100);
  })();

  const showLowAttendanceAlert = attendancePercent < 80;

  const columns = [
    {
      key: 'fecha',
      label: 'Fecha',
      render: (item) => {
        const d = item.fecha || item.date || item.created_at;
        return d ? new Date(d).toLocaleDateString('es-AR') : '—';
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (item) => {
        const status = (item.estado || item.status || 'presente').toLowerCase();
        const config = statusConfig[status] || { colorScheme: 'gray', label: status };
        return (
          <Badge colorScheme={config.colorScheme} variant="subtle" px={3} py={1}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'justificada',
      label: '¿Justificada?',
      render: (item) => {
        const justified = item.justificada ?? item.justified ?? item.is_justified;
        return (
          <Badge
            colorScheme={justified ? 'green' : 'gray'}
            variant="subtle"
            px={3}
            py={1}
          >
            {justified ? 'Sí' : 'No'}
          </Badge>
        );
      },
    },
    {
      key: 'certificado',
      label: 'Certificado',
      render: (item) => {
        const certUrl = item.certificado_url || item.certificate_url || item.certificate;
        return certUrl ? (
          <Link href={certUrl} color="primary" isExternal fontSize="sm" fontWeight={500}>
            Ver certificado
          </Link>
        ) : (
          <Text color="onSurfaceVariant">—</Text>
        );
      },
    },
  ];

  return (
    <Box>
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Asistencias
      </Heading>

      <ErrorAlert error={error} />

      <ChildSelector
        children={children}
        selectedChild={selectedChild}
        onChange={setSelectedChild}
      />

      {showLowAttendanceAlert && selectedChild && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Asistencia crítica</AlertTitle>
            <AlertDescription>
              Asistencia por debajo del umbral crítico (80%)
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {selectedChild && (
        <AttendanceSummary totals={summary} />
      )}

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        emptyMessage="No hay registros de asistencia"
      />
    </Box>
  );
}
