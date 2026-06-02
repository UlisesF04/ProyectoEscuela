import {
  Box, Heading, HStack, Select, Input, Badge, Text,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import { notificationsService } from '../../services/notificationsService';

const channelColors = {
  email: 'purple',
  sms: 'blue',
  whatsapp: 'green',
};

const statusColors = {
  enviado: 'green',
  sent: 'green',
  fallido: 'red',
  failed: 'red',
};

function getStatusColor(status) {
  return statusColors[status?.toLowerCase()] || 'gray';
}

function getChannelColor(channel) {
  return channelColors[channel?.toLowerCase()] || 'gray';
}

const alertTypeLabels = {
  AUSENCIAS_CRITICAS: 'Inasistencias Críticas',
  RIESGO_REGULARIDAD: 'Riesgo de Regularidad',
  CALIFICACION_BAJA: 'Nota Baja',
  TAREA_PENDIENTE: 'Tarea Pendiente',
  LICENCIA_DOCENTE_VENCIMIENTO: 'Licencia por Vencer',
};

function formatAlertType(type) {
  return alertTypeLabels[type] || type || '—';
}

export default function NotificationLogsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertTypeFilter, setAlertTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (alertTypeFilter) params.alert_type = alertTypeFilter;
    if (statusFilter) params.status = statusFilter;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;

    notificationsService.getAll(params)
      .then((data) => setNotifications(data || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [alertTypeFilter, statusFilter, dateFrom, dateTo]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const columns = [
    {
      key: 'sent_at', label: 'Fecha',
      render: (n) => n.sent_at ? new Date(n.sent_at).toLocaleString() : '—',
    },
    {
      key: 'recipient_email', label: 'Destinatario',
      render: (n) => n.recipient_name || n.recipient_email || '—',
    },
    {
      key: 'student_name', label: 'Alumno',
      render: (n) => n.student_name || '—',
    },
    {
      key: 'type', label: 'Tipo',
      render: (n) => (
        <Badge variant="subtle" colorScheme="brand" fontSize="xs">
          {formatAlertType(n.type || n.alert_type)}
        </Badge>
      ),
    },
    {
      key: 'channel', label: 'Canal',
      render: (n) => (
        <Badge variant="subtle" colorScheme={getChannelColor(n.channel)} fontSize="xs">
          {n.channel || '—'}
        </Badge>
      ),
    },
    {
      key: 'status', label: 'Estado',
      render: (n) => (
        <Badge variant="subtle" colorScheme={getStatusColor(n.status)} fontSize="xs">
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
            w="180px"
          >
            {Object.entries(alertTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
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
            <option value="enviado">Enviado</option>
            <option value="fallido">Fallido</option>
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
