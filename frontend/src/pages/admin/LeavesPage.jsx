import {
  Box, Heading, Tabs, TabList, TabPanels, TabPanel, Tab, Button,
  Card, CardBody, Text, VStack, HStack, Badge, useToast,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter, useDisclosure,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { FiCheck, FiX, FiExternalLink } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import api from '../../services/api';

const statusConfig = {
  aprobada: { color: 'green', label: 'Aprobada' },
  pendiente: { color: 'yellow', label: 'Pendiente' },
  rechazada: { color: 'red', label: 'Rechazada' },
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  const fetchLeaves = () => {
    setLoading(true);
    setError(null);
    api.get('/teacher-leaves')
      .then((res) => setLeaves(res.data?.data || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const pendingLeaves = leaves.filter((l) => l.status === 'pendiente');
  const historyLeaves = leaves.filter((l) => l.status !== 'pendiente');

  const openConfirm = (leave, status) => {
    setActionTarget(leave);
    setActionStatus(status);
    onOpen();
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      await api.put(`/teacher-leaves/${actionTarget.id}/status`, { status: actionStatus });
      toast({
        title: `Licencia ${actionStatus === 'aprobada' ? 'aprobada' : 'rechazada'}`,
        status: 'success', duration: 3000, isClosable: true, position: 'top-right',
      });
      onClose();
      fetchLeaves();
    } catch (err) {
      toast({
        title: 'Error al actualizar',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 5000, isClosable: true, position: 'top-right',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const historyColumns = [
    { key: 'created_at', label: 'Fecha', render: (l) => new Date(l.created_at).toLocaleDateString() },
    { key: 'teacher', label: 'Docente', render: (l) => l.Teacher ? `${l.Teacher.first_name} ${l.Teacher.last_name}` : l.teacher_name || '—' },
    { key: 'type', label: 'Tipo', render: (l) => l.type || '—' },
    {
      key: 'status', label: 'Estado',
      render: (l) => {
        const cfg = statusConfig[l.status] || { color: 'gray', label: l.status };
        return <Badge variant="subtle" colorScheme={cfg.color}>{cfg.label}</Badge>;
      },
    },
    { key: 'days', label: 'Días', render: (l) => l.days ?? '—' },
    {
      key: 'certificate', label: 'Certificado',
      render: (l) => l.certificate_url ? (
        <Button
          as="a"
          href={l.certificate_url}
          target="_blank"
          size="sm"
          variant="ghost"
          leftIcon={<FiExternalLink />}
          borderRadius="pill"
          _active={{ transform: 'scale(0.97)' }}
          transition="transform 160ms ease-out"
        >
          Ver
        </Button>
      ) : '—',
    },
  ];

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchLeaves} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Licencias Docentes
      </Heading>
      <Tabs variant="soft-rounded" colorScheme="brand">
        <TabList mb={6}>
          <Tab borderRadius="pill" _active={{ transform: 'scale(0.97)' }} transition="transform 160ms ease-out">
            Pendientes de revisión
          </Tab>
          <Tab borderRadius="pill" _active={{ transform: 'scale(0.97)' }} transition="transform 160ms ease-out">
            Historial
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            {loading ? (
              <LoadingSkeleton variant="card" rows={3} />
            ) : pendingLeaves.length === 0 ? (
              <Box textAlign="center" py={12} px={6} borderRadius="card" bg="containerLow">
                <Text fontSize="lg" fontWeight="semibold" color="onSurface" mb={1}>
                  No hay licencias pendientes
                </Text>
                <Text fontSize="sm" color="onSurfaceVariant">
                  Todas las licencias han sido revisadas.
                </Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {pendingLeaves.map((leave) => (
                  <Card key={leave.id} borderRadius="card" boxShadow="warmSm" bg="white">
                    <CardBody>
                      <HStack spacing={4} align="flex-start" wrap="wrap">
                        <VStack align="flex-start" flex={1} spacing={1}>
                          <Text fontWeight={600}>
                            {leave.Teacher ? `${leave.Teacher.first_name} ${leave.Teacher.last_name}` : leave.teacher_name || 'Docente'}
                          </Text>
                          <Text fontSize="sm" color="onSurfaceVariant">
                            {new Date(leave.created_at).toLocaleDateString()} — {leave.type || 'Licencia'}
                          </Text>
                          {leave.days && (
                            <Text fontSize="sm" color="onSurfaceVariant">
                              {leave.days} día(s)
                            </Text>
                          )}
                        </VStack>
                        <HStack spacing={2}>
                          <Badge variant="subtle" colorScheme="yellow" fontSize="xs">
                            Pendiente
                          </Badge>
                          {leave.certificate_url && (
                            <Button
                              as="a"
                              href={leave.certificate_url}
                              target="_blank"
                              size="sm"
                              variant="ghost"
                              leftIcon={<FiExternalLink />}
                              borderRadius="pill"
                              _active={{ transform: 'scale(0.97)' }}
                              transition="transform 160ms ease-out"
                            >
                              Certificado
                            </Button>
                          )}
                        </HStack>
                      </HStack>
                      <HStack spacing={3} mt={4} justify="flex-end">
                        <Button
                          leftIcon={<FiCheck />}
                          variant="success"
                          size="sm"
                          onClick={() => openConfirm(leave, 'aprobada')}
                          _active={{ transform: 'scale(0.97)' }}
                          transition="transform 160ms ease-out"
                        >
                          Aprobar
                        </Button>
                        <Button
                          leftIcon={<FiX />}
                          variant="danger"
                          size="sm"
                          onClick={() => openConfirm(leave, 'rechazada')}
                          _active={{ transform: 'scale(0.97)' }}
                          transition="transform 160ms ease-out"
                        >
                          Rechazar
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}
          </TabPanel>
          <TabPanel px={0}>
            <DataTable
              columns={historyColumns}
              data={historyLeaves}
              loading={loading}
              emptyMessage="No hay licencias en el historial"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} motionPreset="scale">
        <AlertDialogOverlay />
        <AlertDialogContent borderRadius="card">
          <AlertDialogHeader fontFamily="heading">
            {actionStatus === 'aprobada' ? 'Aprobar licencia' : 'Rechazar licencia'}
          </AlertDialogHeader>
          <AlertDialogBody>
            ¿Está seguro de que desea {actionStatus === 'aprobada' ? 'aprobar' : 'rechazar'} esta licencia?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="ghost" _active={{ transform: 'scale(0.97)' }} transition="transform 160ms ease-out">
              Cancelar
            </Button>
            <Button
              colorScheme={actionStatus === 'aprobada' ? 'green' : 'red'}
              ml={3}
              isLoading={actionLoading}
              onClick={handleAction}
              _active={{ transform: 'scale(0.97)' }}
              transition="transform 160ms ease-out"
            >
              {actionStatus === 'aprobada' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
