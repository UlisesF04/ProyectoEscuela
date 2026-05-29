import {
  Box, Heading, Card, CardBody, Text, Button, Input, Switch,
  VStack, HStack, useToast, SimpleGrid, Spacer, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import api from '../../services/api';

const defaultConfig = {
  absence_threshold: 10,
  notification_time: '18:00',
  alerts_enabled: {
    absence: true,
    low_grade: true,
    overdue_task: true,
  },
};

export default function ConfigurationPage() {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchConfig = () => {
    setLoading(true);
    setError(null);
    api.get('/config')
      .then((res) => {
        if (res.data?.data) setConfig({ ...defaultConfig, ...res.data.data });
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchConfig(); }, []);

  const saveConfig = async (key, value) => {
    setSaving(key);
    try {
      const updated = { ...config, [key]: value };
      await api.put('/config', updated);
      setConfig(updated);
      toast({ title: 'Configuración guardada', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    } catch (err) {
      toast({
        title: 'Error al guardar',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 5000, isClosable: true, position: 'top-right',
      });
    } finally {
      setSaving(null);
    }
  };

  const toggleAlert = async (key) => {
    const newAlerts = { ...config.alerts_enabled, [key]: !config.alerts_enabled[key] };
    const updated = { ...config, alerts_enabled: newAlerts };
    setSaving(`alert_${key}`);
    try {
      await api.put('/config', updated);
      setConfig(updated);
      toast({ title: 'Configuración guardada', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    } catch (err) {
      toast({
        title: 'Error al guardar',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 5000, isClosable: true, position: 'top-right',
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingSkeleton variant="card" rows={3} />;

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchConfig} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Configuración
      </Heading>
      <VStack spacing={6} align="stretch">
        <Card borderRadius="card" boxShadow="warmSm" bg="white">
          <CardBody>
            <HStack spacing={6} align="flex-start" wrap="wrap">
              <Box flex={1} minW="200px">
                <Text fontWeight={600} fontSize="md" mb={1}>Umbral de Ausencias Críticas</Text>
                <Text fontSize="sm" color="onSurfaceVariant">
                  Número máximo de ausencias antes de alertar al padre.
                </Text>
              </Box>
              <HStack spacing={3}>
                <NumberInput
                  value={config.absence_threshold}
                  onChange={(value) => setConfig({ ...config, absence_threshold: parseInt(value) || 0 })}
                  min={1}
                  max={50}
                  w="100px"
                  borderRadius="input"
                >
                  <NumberInputField borderRadius="input" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="brand"
                  size="sm"
                  isLoading={saving === 'absence_threshold'}
                  onClick={() => saveConfig('absence_threshold', config.absence_threshold)}
                  _active={{ transform: 'scale(0.97)' }}
                  transition="transform 160ms ease-out"
                >
                  Guardar
                </Button>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        <Card borderRadius="card" boxShadow="warmSm" bg="white">
          <CardBody>
            <HStack spacing={6} align="flex-start" wrap="wrap">
              <Box flex={1} minW="200px">
                <Text fontWeight={600} fontSize="md" mb={1}>Horario de Notificaciones</Text>
                <Text fontSize="sm" color="onSurfaceVariant">
                  Hora en que se envían las notificaciones automáticas.
                </Text>
              </Box>
              <HStack spacing={3}>
                <Input
                  type="time"
                  value={config.notification_time}
                  onChange={(e) => setConfig({ ...config, notification_time: e.target.value })}
                  w="140px"
                  borderRadius="input"
                />
                <Button
                  leftIcon={<FiSave />}
                  colorScheme="brand"
                  size="sm"
                  isLoading={saving === 'notification_time'}
                  onClick={() => saveConfig('notification_time', config.notification_time)}
                  _active={{ transform: 'scale(0.97)' }}
                  transition="transform 160ms ease-out"
                >
                  Guardar
                </Button>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        <Card borderRadius="card" boxShadow="warmSm" bg="white">
          <CardBody>
            <Text fontWeight={600} fontSize="md" mb={4}>Alertas habilitadas</Text>
            <VStack spacing={4} align="stretch">
              {[
                { key: 'absence', label: 'Inasistencia', desc: 'Notificar al padre cuando el alumno falta' },
                { key: 'low_grade', label: 'Nota Baja', desc: 'Notificar al padre cuando el alumno tiene una nota baja' },
                { key: 'overdue_task', label: 'Tarea Vencida', desc: 'Notificar al padre cuando el alumno tiene tareas vencidas' },
              ].map((alert) => (
                <HStack key={alert.key} spacing={4} p={3} borderRadius="input" bg="containerLow">
                  <Box flex={1}>
                    <Text fontWeight={500} fontSize="sm">{alert.label}</Text>
                    <Text fontSize="xs" color="onSurfaceVariant">{alert.desc}</Text>
                  </Box>
                  <Switch
                    colorScheme="brand"
                    isChecked={config.alerts_enabled?.[alert.key] ?? true}
                    onChange={() => toggleAlert(alert.key)}
                    isDisabled={saving === `alert_${alert.key}`}
                  />
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
