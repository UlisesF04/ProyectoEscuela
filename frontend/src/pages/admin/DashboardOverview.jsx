import {
  Box, Flex, Heading, SimpleGrid, Stat, StatLabel, StatNumber, Badge, Text, HStack, VStack,
} from '@chakra-ui/react';
import { FiUsers, FiBookOpen, FiUserCheck, FiBell, FiCalendar } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';

const ALERT_TYPE_LABELS = {
  absence: 'Inasistencia',
  low_grade: 'Nota Baja',
  overdue_task: 'Tarea Vencida',
};

export default function DashboardOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/admin/stats')
      .then((res) => {
        setData(res.data?.data || null);
      })
      .catch((err) => {
        setError(err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <LoadingSkeleton variant="card" rows={2} />;

  const notifications = data?.recentNotifications || [];

  const cards = [
    { label: 'Usuarios Activos', value: data?.users ?? '—', color: 'primary', icon: FiUsers, path: '/admin/users' },
    { label: 'Cursos Activos', value: data?.courses ?? '—', color: 'secondary', icon: FiBookOpen, path: '/admin/courses' },
    { label: 'Alumnos Registrados', value: data?.students ?? '—', color: 'success', icon: FiUserCheck, path: '/admin/students' },
    {
      label: 'Nuevas Licencias',
      value: data?.newLeaves ?? '—',
      color: 'orange',
      icon: FiCalendar,
      path: '/admin/leaves',
      formatValue: (v) => `${v} ${v === 1 ? 'Nueva' : 'Nuevas'}`,
    },
    {
      label: 'Notificaciones Hoy',
      value: notifications.length ?? '—',
      color: 'purple',
      icon: FiBell,
      path: '/admin/notifications',
    },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchStats} />

      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Dashboard
      </Heading>

      {!data ? (
        <EmptyState
          icon={FiBell}
          title="Aún no hay datos cargados"
          description="Los datos del dashboard aparecerán cuando haya actividad en el sistema."
        />
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6}>
            {cards.map((card) => (
              <Box
                key={card.label}
                p={6}
                borderRadius="card"
                bg="white"
                boxShadow="warm"
                borderTop="3px solid"
                borderTopColor={card.color}
                cursor="pointer"
                onClick={() => navigate(card.path)}
                _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                _active={{ transform: 'scale(0.97)' }}
                transition="all 200ms ease-out"
              >
                <Flex align="center" mb={3} gap={2}>
                  <Box as={card.icon} color={card.color} size="20px" />
                  {card.badge && (
                    <Badge colorScheme="orange" fontSize="xs" ml="auto">
                      {card.badge}
                    </Badge>
                  )}
                </Flex>
                <Stat>
                  <StatLabel color="onSurfaceVariant">{card.label}</StatLabel>
                  <StatNumber color={card.color} fontSize="3xl" fontWeight={700}>
                    {card.formatValue ? card.formatValue(card.value) : card.value}
                  </StatNumber>
                </Stat>
              </Box>
            ))}
          </SimpleGrid>

          {/* Recent Activity */}
          <Box
            mt={8}
            p={5}
            borderRadius="card"
            bg="white"
            boxShadow="warm"
          >
            <Heading as="h2" size="md" mb={4} fontFamily="heading">
              Actividad Reciente
            </Heading>

            {notifications.length === 0 ? (
              <EmptyState
                icon={FiBell}
                title="Sin actividad reciente"
                description="No hay notificaciones recientes para mostrar."
              />
            ) : (
              <VStack spacing={3} align="stretch">
                {notifications.slice(0, 5).map((n, i) => (
                  <Flex
                    key={n.id || i}
                    p={3}
                    borderRadius="md"
                    bg="containerLow"
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    gap={2}
                  >
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight={600} fontSize="sm" color="onSurface">
                        {n.student_name || '—'}
                      </Text>
                      <Text fontSize="xs" color="onSurfaceVariant">
                        {ALERT_TYPE_LABELS[n.alert_type] || n.alert_type || '—'}
                      </Text>
                    </VStack>
                    <HStack spacing={3}>
                      <Badge
                        colorScheme={
                          n.status === 'sent' ? 'green'
                            : n.status === 'pending' ? 'yellow'
                            : 'gray'
                        }
                        fontSize="xs"
                      >
                        {n.status === 'sent' ? 'Enviada'
                          : n.status === 'pending' ? 'Pendiente'
                          : n.status || '—'}
                      </Badge>
                      <Text fontSize="xs" color="onSurfaceVariant" whiteSpace="nowrap">
                        {formatDate(n.created_at || n.date)}
                      </Text>
                    </HStack>
                  </Flex>
                ))}
              </VStack>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
