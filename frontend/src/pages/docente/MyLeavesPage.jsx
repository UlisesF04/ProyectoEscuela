import {
  Box, Heading, Select, Button, HStack, VStack, Text, Badge, useToast,
  FormControl, FormLabel, Input, Textarea, SimpleGrid, Card, CardBody,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, Divider,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiSend } from 'react-icons/fi';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';

const LEAVE_TYPES = ['Enfermedad', 'Personal', 'Gremial'];
const STATUS_COLORS = { Aprobada: 'green', Pendiente: 'yellow', Rechazada: 'red' };

export default function MyLeavesPage() {
  const toast = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    tipo: LEAVE_TYPES[0],
    fecha_inicio: '',
    fecha_fin: '',
    notas: '',
  });

  const fetchLeaves = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/teacher-leaves')
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setLeaves(data);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeaves(); }, []);

  const calcDays = () => {
    if (!form.fecha_inicio || !form.fecha_fin) return 0;
    const start = new Date(form.fecha_inicio);
    const end = new Date(form.fecha_fin);
    if (end <= start) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const days = calcDays();

  const handleSubmit = async () => {
    if (!form.fecha_inicio || !form.fecha_fin) {
      toast({ title: 'Campos requeridos', description: 'Seleccione fecha de inicio y fin', status: 'warning', duration: 3000, isClosable: true, position: 'top-right' });
      return;
    }
    if (new Date(form.fecha_fin) <= new Date(form.fecha_inicio)) {
      toast({ title: 'Error', description: 'La fecha de fin debe ser posterior a la de inicio', status: 'error', duration: 3000, isClosable: true, position: 'top-right' });
      return;
    }
    setSaving(true);
    try {
      await api.post('/teacher-leaves', {
        tipo: form.tipo,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        notas: form.notas,
      });
      toast({ title: 'Licencia solicitada', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
      setForm({ tipo: LEAVE_TYPES[0], fecha_inicio: '', fecha_fin: '', notas: '' });
      fetchLeaves();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo solicitar la licencia', status: 'error', duration: 3000, isClosable: true, position: 'top-right' });
    } finally {
      setSaving(false);
    }
  };

  const totalDaysThisYear = leaves
    .filter((l) => {
      if (!l.fecha_inicio) return false;
      const year = new Date(l.fecha_inicio).getFullYear();
      return year === new Date().getFullYear() && l.estado === 'Aprobada';
    })
    .reduce((sum, l) => {
      if (!l.fecha_inicio || !l.fecha_fin) return sum;
      const start = new Date(l.fecha_inicio);
      const end = new Date(l.fecha_fin);
      return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }, 0);

  if (loading && leaves.length === 0) return <LoadingSkeleton variant="text" rows={5} />;

  const columns = [
    {
      key: 'fechas',
      label: 'Fechas',
      render: (l) => {
        const start = l.fecha_inicio ? new Date(l.fecha_inicio).toLocaleDateString() : '—';
        const end = l.fecha_fin ? new Date(l.fecha_fin).toLocaleDateString() : '—';
        return `${start} → ${end}`;
      },
    },
    { key: 'tipo', label: 'Tipo' },
    {
      key: 'dias',
      label: 'Días',
      render: (l) => {
        if (!l.fecha_inicio || !l.fecha_fin) return '—';
        const start = new Date(l.fecha_inicio);
        const end = new Date(l.fecha_fin);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (l) => (
        <Badge colorScheme={STATUS_COLORS[l.estado] || 'gray'} variant="solid">
          {l.estado || 'Pendiente'}
        </Badge>
      ),
    },
  ];

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchLeaves} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">Mis Licencias</Heading>

      <Card mb={8}>
        <CardBody>
          <Heading as="h3" size="sm" mb={4} fontFamily="heading">Solicitar Licencia</Heading>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Tipo</FormLabel>
                <Select
                  value={form.tipo}
                  onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))}
                  borderRadius="input"
                >
                  {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Fecha inicio</FormLabel>
                <Input
                  type="date"
                  value={form.fecha_inicio}
                  onChange={(e) => setForm((p) => ({ ...p, fecha_inicio: e.target.value }))}
                  borderRadius="input"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Fecha fin</FormLabel>
                <Input
                  type="date"
                  value={form.fecha_fin}
                  onChange={(e) => setForm((p) => ({ ...p, fecha_fin: e.target.value }))}
                  borderRadius="input"
                  isInvalid={form.fecha_inicio && form.fecha_fin && new Date(form.fecha_fin) <= new Date(form.fecha_inicio)}
                />
              </FormControl>
            </SimpleGrid>

            <HStack spacing={4}>
              <Box
                px={4} py={2} borderRadius="pill" bg="containerLow"
                fontSize="sm" color="onSurfaceVariant"
              >
                Días solicitados: <Box as="span" fontWeight={600} color="primary">{days}</Box>
              </Box>
            </HStack>

            <FormControl>
              <FormLabel fontSize="sm" color="onSurfaceVariant">Notas</FormLabel>
              <Textarea
                value={form.notas}
                onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
                placeholder="Notas opcionales..."
                borderRadius="input"
                rows={2}
              />
            </FormControl>

            {form.fecha_inicio && form.fecha_fin && new Date(form.fecha_fin) <= new Date(form.fecha_inicio) && (
              <Text fontSize="sm" color="error">
                La fecha de fin debe ser posterior a la de inicio
              </Text>
            )}

            <Button
              leftIcon={<FiSend />}
              colorScheme="brand"
              onClick={handleSubmit}
              isLoading={saving}
              loadingText="Solicitando..."
              alignSelf="flex-start"
            >
              Solicitar
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <Box mb={6}>
        <Text fontSize="sm" color="onSurfaceVariant">
          Días solicitados este año:{' '}
          <Box as="span" fontWeight={600} color="primary" fontSize="lg">{totalDaysThisYear}</Box>
        </Text>
      </Box>

      <Heading as="h3" size="sm" mb={4} fontFamily="heading">Historial de Licencias</Heading>

      {leaves.length === 0 ? (
        <EmptyState title="Sin licencias" description="No hay solicitudes de licencia registradas." />
      ) : (
        <Box borderRadius="card" border="1px solid" borderColor="outlineVariant" overflow="hidden" bg="white" boxShadow="warmSm">
          <TableContainer>
            <Table variant="simple">
              <Thead bg="containerLow">
                <Tr>
                  {columns.map((col) => (
                    <Th key={col.key} fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="onSurfaceVariant" py={4}>
                      {col.label}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {leaves.map((l, idx) => (
                  <Tr
                    key={l.id || idx}
                    _hover={{ bg: 'containerLow', transition: 'background-color 160ms ease-out' }}
                    sx={{ animation: 'fadeSlideIn 300ms ease-out both', animationDelay: `${idx * 30}ms` }}
                  >
                    {columns.map((col) => (
                      <Td key={col.key} py={3} fontSize="sm">
                        {col.render ? col.render(l) : l[col.key] ?? '—'}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
