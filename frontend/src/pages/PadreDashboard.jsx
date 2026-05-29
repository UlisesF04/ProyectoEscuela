import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useDisclosure,
  useToast,
  Heading,
  Spinner,
  Center,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiUsers, FiBookOpen, FiCalendar, FiUser } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import { parentService } from '../services/parentService';
import { gradesService } from '../services/gradesService';
import { attendanceService } from '../services/attendanceService';
import { useAuth } from '../context/AuthContext';

const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('T')[0].split('-');
  return `${parseInt(day, 10)} de ${months[parseInt(month, 10) - 1]} de ${year}`;
}

const statusColors = {
  presente: 'green',
  ausente: 'red',
  tarde: 'orange',
};

const statusLabels = {
  presente: 'Presente',
  ausente: 'Ausente',
  tarde: 'Tarde',
};

function ChildrenSection() {
  const toast = useToast();

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isOpen: isGradesOpen, onOpen: onGradesOpen, onClose: onGradesClose } = useDisclosure();
  const { isOpen: isAttendanceOpen, onOpen: onAttendanceOpen, onClose: onAttendanceClose } = useDisclosure();

  const [selectedChild, setSelectedChild] = useState(null);
  const [grades, setGrades] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const showToast = useCallback((status, title, description) => {
    toast({ title, description, status, duration: 3000, isClosable: true, position: 'top-right' });
  }, [toast]);

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    try {
      const data = await parentService.getMyChildren();
      setChildren(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los hijos');
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleViewGrades = async (child) => {
    setSelectedChild(child);
    setGradesLoading(true);
    setGrades([]);
    onGradesOpen();
    try {
      const data = await gradesService.getStudentGrades(child.id);
      setGrades(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar las notas');
    } finally {
      setGradesLoading(false);
    }
  };

  const handleViewAttendance = async (child) => {
    setSelectedChild(child);
    setAttendanceLoading(true);
    setAttendanceRecords([]);
    setAttendanceSummary(null);
    onAttendanceOpen();
    try {
      const result = await attendanceService.getStudentHistory(child.id);
      setAttendanceRecords(result.records || []);
      setAttendanceSummary(result.summary || null);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudo cargar la asistencia');
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="3px" />
          <Text color="gray.500">Cargando hijos...</Text>
        </VStack>
      </Center>
    );
  }

  if (children.length === 0) {
    return (
      <Box
        textAlign="center"
        py={16}
        px={6}
        mx={6}
        mt={6}
        border="1px dashed"
        borderColor="gray.300"
        borderRadius="lg"
        bg="white"
      >
        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={1}>
          No hay hijos vinculados
        </Text>
        <Text fontSize="sm" color="gray.500">
          No tenés hijos registrados en el sistema. Contactá a la administración si esto es un error.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Mis Hijos</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {children.map((child) => (
          <Card
            key={child.id}
            variant="outline"
            bg="white"
            borderColor="gray.200"
            _hover={{ shadow: 'md', borderColor: 'green.300' }}
            transition="box-shadow 200ms ease-out, border-color 200ms ease-out"
          >
            <CardHeader pb={2}>
              <Heading size="md" color="gray.800">
                {child.first_name} {child.last_name}
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                DNI: {child.dni}
              </Text>
            </CardHeader>
            <CardBody pt={0}>
              <Text fontSize="sm" color="gray.600" mb={4}>
                {child.course?.name || child.course_name || 'Curso no asignado'}
                {child.course?.year ? ` (${child.course.year})` : ''}
              </Text>
              <HStack spacing={3}>
                <Button
                  size="sm"
                  leftIcon={<FiBookOpen />}
                  colorScheme="green"
                  variant="outline"
                  onClick={() => handleViewGrades(child)}
                  _active={{ transform: 'scale(0.96)' }}
                  transition="transform 120ms ease-out"
                >
                  Ver Notas
                </Button>
                <Button
                  size="sm"
                  leftIcon={<FiCalendar />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => handleViewAttendance(child)}
                  _active={{ transform: 'scale(0.96)' }}
                  transition="transform 120ms ease-out"
                >
                  Ver Asistencias
                </Button>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Grades Modal */}
      <Modal isOpen={isGradesOpen} onClose={onGradesClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Notas de {selectedChild?.first_name} {selectedChild?.last_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {gradesLoading ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="green.500" thickness="3px" />
                  <Text color="gray.500">Cargando notas...</Text>
                </VStack>
              </Center>
            ) : grades.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text fontSize="lg" fontWeight="semibold" color="gray.500">
                  No hay notas registradas
                </Text>
              </Box>
            ) : (
              <TableContainer
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                overflow="hidden"
              >
                <Table variant="striped" colorScheme="gray" size="sm">
                  <Thead bg="gray.100">
                    <Tr>
                      <Th>Materia</Th>
                      <Th>Nota</Th>
                      <Th>Tipo</Th>
                      <Th>Descripción</Th>
                      <Th>Fecha</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {grades.map((g) => (
                      <Tr key={g.id}>
                        <Td fontWeight="medium" color="gray.700">
                          {g.subject_name || g.subject?.name || 'General'}
                        </Td>
                        <Td fontWeight="semibold">{g.grade}</Td>
                        <Td>
                          <Badge
                            colorScheme="purple"
                            variant="subtle"
                            px={2}
                            py={1}
                            borderRadius="full"
                          >
                            {g.type}
                          </Badge>
                        </Td>
                        <Td>{g.description || '—'}</Td>
                        <Td>{formatDate(g.date)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Attendance Modal */}
      <Modal isOpen={isAttendanceOpen} onClose={onAttendanceClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Asistencias de {selectedChild?.first_name} {selectedChild?.last_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {attendanceLoading ? (
              <Center py={10}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" thickness="3px" />
                  <Text color="gray.500">Cargando asistencias...</Text>
                </VStack>
              </Center>
            ) : attendanceRecords.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text fontSize="lg" fontWeight="semibold" color="gray.500">
                  No hay registros de asistencia
                </Text>
              </Box>
            ) : (
              <>
                {attendanceSummary && (
                  <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={6}>
                    <Stat bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="gray.200">
                      <StatLabel fontSize="xs">Total</StatLabel>
                      <StatNumber fontSize="xl">{attendanceSummary.total_days}</StatNumber>
                    </Stat>
                    <Stat bg="green.50" p={3} borderRadius="lg" border="1px solid" borderColor="green.200">
                      <StatLabel fontSize="xs" color="green.700">Presentes</StatLabel>
                      <StatNumber fontSize="xl" color="green.600">
                        {attendanceSummary.total_days - attendanceSummary.total_absences}
                      </StatNumber>
                    </Stat>
                    <Stat bg="red.50" p={3} borderRadius="lg" border="1px solid" borderColor="red.200">
                      <StatLabel fontSize="xs" color="red.700">Ausencias</StatLabel>
                      <StatNumber fontSize="xl" color="red.600">{attendanceSummary.total_absences}</StatNumber>
                    </Stat>
                    <Stat bg="yellow.50" p={3} borderRadius="lg" border="1px solid" borderColor="yellow.200">
                      <StatLabel fontSize="xs" color="yellow.700">Justificadas</StatLabel>
                      <StatNumber fontSize="xl" color="yellow.600">{attendanceSummary.justified_absences}</StatNumber>
                    </Stat>
                    <Stat bg="orange.50" p={3} borderRadius="lg" border="1px solid" borderColor="orange.200">
                      <StatLabel fontSize="xs" color="orange.700">Sin justificar</StatLabel>
                      <StatNumber fontSize="xl" color="orange.600">{attendanceSummary.unjustified_absences}</StatNumber>
                    </Stat>
                  </SimpleGrid>
                )}

                <TableContainer border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden">
                  <Table variant="striped" colorScheme="gray" size="sm">
                    <Thead bg="gray.100">
                      <Tr>
                        <Th>Fecha</Th>
                        <Th>Estado</Th>
                        <Th>Justificada</Th>
                        <Th>Nota</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {attendanceRecords.map((r) => (
                        <Tr key={r.id}>
                          <Td>{formatDate(r.date)}</Td>
                          <Td>
                            <Badge
                              colorScheme={statusColors[r.status] || 'gray'}
                              variant="subtle"
                              px={2}
                              py={1}
                              borderRadius="full"
                            >
                              {statusLabels[r.status] || r.status}
                            </Badge>
                          </Td>
                          <Td>
                            {r.is_justified ? (
                              <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="full">
                                Sí
                              </Badge>
                            ) : (
                              <Text fontSize="sm" color="gray.400">—</Text>
                            )}
                          </Td>
                          <Td fontSize="sm" color="gray.600">
                            {r.justification_note || '—'}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function ProfileSection() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Center h="400px">
        <Text color="gray.500">No se pudo cargar la información del perfil.</Text>
      </Center>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Mi Perfil</Heading>

      <Card variant="outline" bg="white" borderColor="gray.200" maxW="600px">
        <CardHeader pb={2}>
          <Heading size="md" color="gray.800">
            {user.first_name} {user.last_name}
          </Heading>
        </CardHeader>
        <CardBody pt={0}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={1}>
                Email
              </Text>
              <Text color="gray.800">{user.email}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={1}>
                Rol
              </Text>
              <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="full">
                {user.role === 'padre' ? 'Padre/Madre' : user.role}
              </Badge>
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.500" mb={1}>
                Teléfono
              </Text>
              <Text color="gray.800">{user.phone || '—'}</Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}

export default function PadreDashboard() {
  const sections = [
    { id: 'children', label: 'Mis Hijos', icon: FiUsers, component: ChildrenSection },
    { id: 'profile', label: 'Mi Perfil', icon: FiUser, component: ProfileSection },
  ];

  return <DashboardLayout sections={sections} />;
}
