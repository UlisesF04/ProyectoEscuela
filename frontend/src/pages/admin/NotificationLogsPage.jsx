import {
  Box, Heading, HStack, Select, Input, Badge, Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import api from '../../services/api';

const channelColors = {
  SMS: 'blue',
  Email: 'purple',
  WhatsApp: 'green',
};

const statusColors = {
  Enviado: 'green',
  enviado: 'green',
  sent: 'green',
  Fallido: 'red',
  fallido: 'red',
  failed: 'red',
};

export default function NotificationLogsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertTypeFilter, setAlertTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchNotifications = () => {
    setLoading(true);
    setError(null);
    const params = {};
    if (alertTypeFilter) params.alert_type = alertTypeFilter;
    if (statusFilter) params.status = statusFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    api.get('/notifications', { params })
      .then((res) => setNotifications(res.data?.data || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, [alertTypeFilter, statusFilter, dateFrom, dateTo]);

  const columns = [
    {
      key: 'created_at', label: 'Fecha',
      render: (n) => n.created_at ? new Date(n.created_at).toLocaleString() : '—',
    },
    {
      key: 'recipient', label: 'Destinatario',
      render: (n) => n.recipient_name || n.recipient_email || n.recipient || '—',
    },
    {
      key: 'student', label: 'Alumno',
      render: (n) => n.Student ? `${n.Student.first_name} ${n.Student.last_name}` : n.student_name || '—',
    },
    {
      key: 'alert_type', label: 'Tipo Alerta',
      render: (n) => {
        const labels = { absence: 'Inasistencia', low_grade: 'Nota Baja', overdue_task: 'Tarea Vencida' };
        return labels[n.alert_type] || n.alert_type || '—';
      },
    },
    {
      key: 'channel', label: 'Canal',
      render: (n) => (
        <Badge variant="subtle" colorScheme={channelColors[n.channel] || 'gray'} fontSize="xs">
          {n.channel || '—'}
        </Badge>
      ),
    },
    {
      key: 'status', label: 'Estado',
      render: (n) => (
        <Badge variant="subtle" colorScheme={statusColors[n.status] || 'gray'} fontSize="xs">
          {n.status || '—'}
        </Badge>
      ),
    },
  ];

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchNotifications} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Notificaciones
      </Heading>

      <HStack spacing={4} mb={6} wrap="wrap">
        <Box>
          <Text fontSize="xs" fontWeight={600} color="onSurfaceVariant" mb={1} textTransform="uppercase" letterSpacing="wider">
            Tipo Alerta
          </Text>
          <Select
            value={alertTypeFilter}
            onChange={(e) => setAlertTypeFilter(e.target.value)}
            placeholder="Todos"
            borderRadius="input"
            size="sm"
            w="160px"
          >
            <option value="absence">Inasistencia</option>
            <option value="low_grade">Nota Baja</option>
            <option value="overdue_task">Tarea Vencida</option>
          </Select>
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
            <option value="Enviado">Enviado</option>
            <option value="Fallido">Fallido</option>
          </Select>
        </Box>
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
      </HStack>

      <DataTable
        columns={columns}
        data={notifications}
        loading={loading}
        emptyMessage="No hay notificaciones registradas"
        emptyDescription="Las notificaciones aparecerán aquí cuando se envíen."
      />
    </Box>
  );
}
