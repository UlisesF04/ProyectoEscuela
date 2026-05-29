import {
  Box, Heading, Tabs, TabList, TabPanels, TabPanel, Tab, Button,
  Text, VStack, HStack, Badge, useToast, Card, CardBody,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter, useDisclosure,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { FiCheck, FiExternalLink } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import api from '../../services/api';
import { attendanceService } from '../../services/attendanceService';

export default function PendingCertificatesPage() {
  const [pending, setPending] = useState([]);
  const [justifiedHistory, setJustifiedHistory] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [justifyTarget, setJustifyTarget] = useState(null);
  const [justifying, setJustifying] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  const fetchPending = () => {
    setLoadingPending(true);
    setError(null);
    api.get('/attendances/pending-certificates')
      .then((res) => setPending(res.data?.data || []))
      .catch((err) => setError(err))
      .finally(() => setLoadingPending(false));
  };

  const fetchHistory = () => {
    setLoadingHistory(true);
    api.get('/attendances', { params: { is_justified: true } })
      .then((res) => setJustifiedHistory(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    fetchPending();
    fetchHistory();
  }, []);

  const openJustifyConfirm = (attendance) => {
    setJustifyTarget(attendance);
    onOpen();
  };

  const handleJustify = async () => {
    if (!justifyTarget) return;
    setJustifying(true);
    try {
      await attendanceService.justify(justifyTarget.id, {});
      toast({ title: 'Asistencia justificada', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      onClose();
      fetchPending();
      fetchHistory();
    } catch (err) {
      toast({
        title: 'Error al justificar',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 5000, isClosable: true, position: 'top-right',
      });
    } finally {
      setJustifying(false);
    }
  };

  const historyColumns = [
    {
      key: 'date', label: 'Fecha',
      render: (r) => r.date ? new Date(r.date).toLocaleDateString() : '—',
    },
    {
      key: 'student', label: 'Alumno',
      render: (r) => r.Student ? `${r.Student.first_name} ${r.Student.last_name}` : r.student_name || '—',
    },
    {
      key: 'status', label: 'Estado',
      render: (r) => (
        <Badge variant="subtle" colorScheme="green" fontSize="xs">Justificada</Badge>
      ),
    },
    {
      key: 'certificate', label: 'Certificado',
      render: (r) => r.certificate_url ? (
        <Button
          as="a"
          href={r.certificate_url}
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
      <ErrorAlert error={error} onRetry={fetchPending} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Justificaciones Pendientes
      </Heading>
      <Tabs variant="soft-rounded" colorScheme="brand">
        <TabList mb={6}>
          <Tab borderRadius="pill" _active={{ transform: 'scale(0.97)' }} transition="transform 160ms ease-out">
            Pendientes
          </Tab>
          <Tab borderRadius="pill" _active={{ transform: 'scale(0.97)' }} transition="transform 160ms ease-out">
            Historial de Justificadas
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            {loadingPending ? (
              <LoadingSkeleton variant="card" rows={3} />
            ) : pending.length === 0 ? (
              <Box textAlign="center" py={12} px={6} borderRadius="card" bg="containerLow">
                <Text fontSize="lg" fontWeight="semibold" color="onSurface" mb={1}>
                  No hay justificaciones pendientes
                </Text>
                <Text fontSize="sm" color="onSurfaceVariant">
                  Todas las ausencias han sido procesadas.
                </Text>
              </Box>
            ) : (
              <VStack spacing={4} align="stretch">
                {pending.map((att) => (
                  <Card key={att.id} borderRadius="card" boxShadow="warmSm" bg="white">
                    <CardBody>
                      <HStack spacing={4} align="flex-start" wrap="wrap">
                        <VStack align="flex-start" flex={1} spacing={1}>
                          <Text fontWeight={600}>
                            {att.Student ? `${att.Student.first_name} ${att.Student.last_name}` : att.student_name || 'Alumno'}
                          </Text>
                          <Text fontSize="sm" color="onSurfaceVariant">
                            {att.date ? new Date(att.date).toLocaleDateString() : '—'}
                          </Text>
                        </VStack>
                        {att.certificate_url && (
                          <Button
                            as="a"
                            href={att.certificate_url}
                            target="_blank"
                            size="sm"
                            variant="ghost"
                            leftIcon={<FiExternalLink />}
                            borderRadius="pill"
                            _active={{ transform: 'scale(0.97)' }}
                            transition="transform 160ms ease-out"
                          >
                            Ver Certificado
                          </Button>
                        )}
                        <Button
                          leftIcon={<FiCheck />}
                          colorScheme="brand"
                          size="sm"
                          onClick={() => openJustifyConfirm(att)}
                          _active={{ transform: 'scale(0.97)' }}
                          transition="transform 160ms ease-out"
                        >
                          Justificar
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
              data={justifiedHistory}
              loading={loadingHistory}
              emptyMessage="No hay asistencias justificadas"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} motionPreset="scale">
        <AlertDialogOverlay />
        <AlertDialogContent borderRadius="card">
          <AlertDialogHeader fontFamily="heading">
            Justificar ausencia
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text mb={2}>
              <strong>Esta acción es irreversible. ¿Está seguro?</strong>
            </Text>
            <Text fontSize="sm" color="onSurfaceVariant">
              {justifyTarget?.Student
                ? `${justifyTarget.Student.first_name} ${justifyTarget.Student.last_name}`
                : 'El alumno'}{' '}
              — {justifyTarget?.date ? new Date(justifyTarget.date).toLocaleDateString() : ''}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="ghost" _active={{ transform: 'scale(0.97)' }} transition="transform 160ms ease-out">
              Cancelar
            </Button>
            <Button
              colorScheme="brand"
              ml={3}
              isLoading={justifying}
              onClick={handleJustify}
              _active={{ transform: 'scale(0.97)' }}
              transition="transform 160ms ease-out"
            >
              Justificar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
