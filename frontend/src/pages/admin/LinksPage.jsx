import {
  Box, Heading, Button, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, Select, useDisclosure, VStack,
  Text, Badge, useToast, Input, HStack, IconButton, List, ListItem,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiUsers, FiLink, FiX, FiSearch } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import api from '../../services/api';
import { adminService } from '../../services/adminService';

const relationColors = {
  Madre: 'pink',
  Padre: 'blue',
  Tutor: 'purple',
};

export default function LinksPage() {
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parentEmail, setParentEmail] = useState('');
  const [relation, setRelation] = useState('Madre');
  const [linking, setLinking] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchStudents = () => {
    setLoading(true);
    setError(null);
    adminService.getStudents()
      .then((res) => setStudents(res.data || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const openParentsModal = async (student) => {
    setSelectedStudent(student);
    setParentEmail('');
    setRelation('Madre');
    setSearchResults([]);
    setParentsLoading(true);
    onOpen();
    try {
      const res = await adminService.getParents(student.id);
      setParents(res.data || []);
    } catch {
      setParents([]);
    } finally {
      setParentsLoading(false);
    }
  };

  const handleSearchParent = async () => {
    if (!parentEmail.trim()) return;
    setSearching(true);
    try {
      const res = await api.get('/users/search', { params: { email: parentEmail, role: 'padre' } });
      setSearchResults(res.data?.data || []);
      if (!res.data?.data?.length) {
        toast({ title: 'No se encontraron padres con ese email', status: 'info', duration: 3000, isClosable: true, position: 'top-right' });
      }
    } catch {
      setSearchResults([]);
      toast({ title: 'Error al buscar padre', status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    } finally {
      setSearching(false);
    }
  };

  const handleLink = async (parentId) => {
    setLinking(true);
    try {
      await adminService.linkParent(selectedStudent.id, { parent_id: parentId, relation });
      toast({ title: 'Vinculación exitosa', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      const res = await adminService.getParents(selectedStudent.id);
      setParents(res.data || []);
      setSearchResults([]);
      setParentEmail('');
    } catch (err) {
      toast({
        title: 'Error al vincular',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 5000, isClosable: true, position: 'top-right',
      });
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async (parentId) => {
    try {
      await api.delete(`/students/${selectedStudent.id}/parents/${parentId}`);
      toast({ title: 'Padre desvinculado', status: 'info', duration: 3000, isClosable: true, position: 'top-right' });
      const res = await adminService.getParents(selectedStudent.id);
      setParents(res.data || []);
    } catch (err) {
      toast({
        title: 'Error al desvincular',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 5000, isClosable: true, position: 'top-right',
      });
    }
  };

  const columns = [
    { key: 'first_name', label: 'Nombre', render: (s) => `${s.first_name} ${s.last_name}` },
    { key: 'dni', label: 'DNI' },
    { key: 'course', label: 'Curso', render: (s) => s.Course?.name || '—' },
  ];

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchStudents} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Vínculos Padre-Alumno
      </Heading>
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        emptyMessage="No hay alumnos registrados"
        actions={[
          {
            label: 'Ver Padres', icon: FiUsers, colorScheme: 'brand', variant: 'outline',
            onClick: (student) => openParentsModal(student),
          },
        ]}
      />

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside" motionPreset="scale">
        <ModalOverlay />
        <ModalContent borderRadius="card">
          <ModalHeader fontFamily="heading">
            Padres de {selectedStudent?.first_name} {selectedStudent?.last_name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight={600} mb={2} fontSize="sm" color="onSurfaceVariant">
                  Padres vinculados
                </Text>
                {parentsLoading ? (
                  <LoadingSkeleton variant="text" rows={2} />
                ) : parents.length === 0 ? (
                  <Text fontSize="sm" color="onSurfaceVariant" fontStyle="italic">
                    Sin padres vinculados
                  </Text>
                ) : (
                  <List spacing={2}>
                    {parents.map((p) => (
                      <ListItem
                        key={p.id}
                        p={3}
                        borderRadius="input"
                        bg="containerLow"
                        display="flex"
                        alignItems="center"
                        gap={3}
                      >
                        <Text flex={1} fontWeight={500} fontSize="sm">{p.email}</Text>
                        <Badge
                          variant="subtle"
                          colorScheme={relationColors[p.ParentStudent?.relation] || 'gray'}
                          fontSize="xs"
                        >
                          {p.ParentStudent?.relation || '—'}
                        </Badge>
                        <IconButton
                          icon={<FiX />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          borderRadius="pill"
                          onClick={() => handleUnlink(p.id)}
                          minW="44px" minH="44px"
                          _active={{ transform: 'scale(0.97)' }}
                          transition="transform 160ms ease-out"
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>

              <Box borderTop="1px solid" borderColor="outline" pt={4}>
                <Text fontWeight={600} mb={3} fontSize="sm" color="onSurfaceVariant">
                  Vincular nuevo padre
                </Text>
                <HStack spacing={2} mb={3}>
                  <Input
                    placeholder="Buscar por email del padre..."
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchParent()}
                    borderRadius="input"
                  />
                  <Button
                    leftIcon={<FiSearch />}
                    colorScheme="brand"
                    onClick={handleSearchParent}
                    isLoading={searching}
                    _active={{ transform: 'scale(0.97)' }}
                    transition="transform 160ms ease-out"
                  >
                    Buscar
                  </Button>
                </HStack>
                {searchResults.length > 0 && (
                  <List spacing={2} mb={3}>
                    {searchResults.map((u) => (
                      <ListItem
                        key={u.id}
                        p={3}
                        borderRadius="input"
                        bg="containerHigh"
                        display="flex"
                        alignItems="center"
                        gap={3}
                      >
                        <Text flex={1} fontSize="sm">
                          {u.first_name} {u.last_name} — {u.email}
                        </Text>
                        <Select
                          value={relation}
                          onChange={(e) => setRelation(e.target.value)}
                          w="130px"
                          size="sm"
                          borderRadius="input"
                        >
                          <option value="Madre">Madre</option>
                          <option value="Padre">Padre</option>
                          <option value="Tutor">Tutor</option>
                        </Select>
                        <Button
                          size="sm"
                          colorScheme="brand"
                          leftIcon={<FiLink />}
                          isLoading={linking}
                          onClick={() => handleLink(u.id)}
                          _active={{ transform: 'scale(0.97)' }}
                          transition="transform 160ms ease-out"
                        >
                          Vincular
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
