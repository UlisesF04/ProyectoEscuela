import {
  Box, Heading, Button, HStack, VStack, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, FormControl, FormLabel, FormErrorMessage,
  Input, Select, useToast, Text, Divider, Spinner, Center, Flex, Avatar,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter, IconButton,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiToggleRight, FiUsers, FiUserPlus, FiSearch, FiLink, FiX,
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import { adminService } from '../../services/adminService';

const RELATION_OPTIONS = [
  { value: 'Madre', label: 'Madre' },
  { value: 'Padre', label: 'Padre' },
  { value: 'Tutor', label: 'Tutor' },
  { value: 'Otro', label: 'Otro' },
];

const emptyForm = { first_name: '', last_name: '', dni: '', course_id: '' };

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseFilter, setCourseFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState(emptyForm);

  const [parentsOpen, setParentsOpen] = useState(false);
  const [parentsStudent, setParentsStudent] = useState(null);
  const [parents, setParents] = useState([]);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [parentSearchEmail, setParentSearchEmail] = useState('');
  const [parentResults, setParentResults] = useState([]);
  const [parentSearching, setParentSearching] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [parentRelationship, setParentRelationship] = useState('');

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteMode, setDeleteMode] = useState('deactivate');

  const toast = useToast();
  const cancelRef = useRef();

  const fetchStudents = () => {
    setLoading(true);
    setError(null);
    adminService.getStudents()
      .then((data) => setStudents(data || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  const fetchCourses = () => {
    adminService.getCourses()
      .then((data) => setCourses(data || []))
      .catch(() => {});
  };

  useEffect(() => { fetchStudents(); fetchCourses(); }, []);

  const filteredStudents = useMemo(() => {
    if (!courseFilter) return students;
    return students.filter((s) => s.course_id === Number(courseFilter));
  }, [students, courseFilter]);

  const validate = (data) => {
    const errors = {};
    if (!data.first_name?.trim()) errors.first_name = 'El nombre es obligatorio';
    if (!data.last_name?.trim()) errors.last_name = 'El apellido es obligatorio';
    if (!data.course_id) errors.course_id = 'El curso es obligatorio';
    return errors;
  };

  const handleCreate = async () => {
    const errors = validate(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      await adminService.createStudent({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        dni: formData.dni.trim() || undefined,
        course_id: Number(formData.course_id),
      });
      toast({ title: 'Alumno creado', description: 'El alumno fue creado exitosamente.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setCreateOpen(false);
      setFormData(emptyForm);
      setFormErrors({});
      fetchStudents();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditFormData({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      dni: student.dni || '',
      course_id: student.course_id?.toString() || '',
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEdit = async () => {
    const errors = validate(editFormData);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      await adminService.updateStudent(editingStudent.id, {
        first_name: editFormData.first_name.trim(),
        last_name: editFormData.last_name.trim(),
        dni: editFormData.dni.trim() || undefined,
        course_id: Number(editFormData.course_id),
      });
      toast({ title: 'Alumno actualizado', description: 'Los cambios fueron guardados.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setEditOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    } finally {
      setSubmitting(false);
    }
  };

  const openParentsModal = async (student) => {
    setParentsStudent(student);
    setParentsOpen(true);
    setParentsLoading(true);
    setParentSearchEmail('');
    setParentResults([]);
    setSelectedParentId(null);
    setParentRelationship('');
    try {
      const data = await adminService.getParents(student.id);
      setParents(data || []);
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
      setParents([]);
    } finally {
      setParentsLoading(false);
    }
  };

  const handleSearchParent = async () => {
    if (!parentSearchEmail.trim()) return;
    setParentSearching(true);
    setParentResults([]);
    setSelectedParentId(null);
    try {
      const data = await adminService.getUsersByRole('padre');
      const filtered = data.filter(
        (u) =>
          u.email?.toLowerCase().includes(parentSearchEmail.toLowerCase()) ||
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(parentSearchEmail.toLowerCase()),
      );
      setParentResults(filtered);
      if (filtered.length === 0) {
        toast({ title: 'Sin resultados', description: 'No se encontraron padres con ese criterio.', status: 'info', duration: 3000, isClosable: true, position: 'top-right' });
      }
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    } finally {
      setParentSearching(false);
    }
  };

  const handleLinkParent = async () => {
    if (!selectedParentId || !parentsStudent) return;
    try {
      await adminService.linkParent(parentsStudent.id, {
        user_id: selectedParentId,
        relationship: parentRelationship || undefined,
      });
      toast({ title: 'Padre vinculado', description: 'El padre fue vinculado al alumno.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setParentSearchEmail('');
      setParentResults([]);
      setSelectedParentId(null);
      setParentRelationship('');
      const data = await adminService.getParents(parentsStudent.id);
      setParents(data || []);
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    }
  };

  const openDeleteDialog = (student, mode) => {
    setDeletingStudent(student);
    setDeleteMode(mode);
    setDeleteAlertOpen(true);
  };

  const handleReactivate = async (student) => {
    try {
      await adminService.reactivateStudent(student.id);
      toast({ title: 'Alumno reactivado', description: 'El alumno fue reactivado correctamente.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      fetchStudents();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    }
  };

  const handleDeactivate = async () => {
    if (!deletingStudent) return;
    try {
      await adminService.deactivateStudent(deletingStudent.id);
      toast({ title: 'Alumno desactivado', description: 'El alumno fue desactivado correctamente.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setDeleteAlertOpen(false);
      setDeletingStudent(null);
      fetchStudents();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    }
  };

  const handlePermanentDelete = async () => {
    if (!deletingStudent) return;
    try {
      await adminService.permanentDeleteStudent(deletingStudent.id);
      toast({ title: 'Alumno eliminado', description: 'El alumno fue eliminado definitivamente.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setDeleteAlertOpen(false);
      setDeletingStudent(null);
      fetchStudents();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    }
  };

  const columns = [
    {
      key: 'is_active',
      label: 'Estado',
      render: (s) => (
        <Box
          as="span"
          px={3}
          py={1}
          borderRadius="pill"
          fontSize="xs"
          fontWeight={500}
          bg={s.is_active ? 'success' : 'error'}
          color="white"
        >
          {s.is_active ? 'Activo' : 'Inactivo'}
        </Box>
      ),
    },
    { key: 'first_name', label: 'Nombre', render: (s) => `${s.first_name} ${s.last_name}` },
    { key: 'dni', label: 'DNI', render: (s) => s.dni || '—' },
    { key: 'course', label: 'Curso', render: (s) => s.Course?.name || '—' },
  ];

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchStudents} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Alumnos
      </Heading>

      <HStack spacing={4} mb={6} flexWrap="wrap">
        <Select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          maxW="240px"
          bg="white"
          placeholder="Todos los cursos"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.level} ({c.year})
            </option>
          ))}
        </Select>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => { setFormData(emptyForm); setFormErrors({}); setCreateOpen(true); }}
        >
          Crear Alumno
        </Button>
      </HStack>

      <DataTable
        columns={columns}
        data={filteredStudents}
        loading={loading}
        emptyMessage="No hay alumnos registrados"
        emptyDescription="Cree el primer alumno usando el botón superior."
        emptyAction={
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={() => { setFormData(emptyForm); setFormErrors({}); setCreateOpen(true); }}
          >
            Crear Alumno
          </Button>
        }
        actions={(student) => [
          { label: 'Editar', icon: FiEdit2, onClick: () => openEditModal(student), variant: 'ghost' },
          { label: 'Asignar Padres', icon: FiUsers, onClick: () => openParentsModal(student), colorScheme: 'brand', variant: 'outline' },
          ...(student.is_active
            ? [{ label: 'Desactivar', icon: FiToggleRight, onClick: () => openDeleteDialog(student, 'deactivate'), colorScheme: 'orange', variant: 'ghost' }]
            : [
                { label: 'Reactivar', icon: FiToggleRight, onClick: () => handleReactivate(student), colorScheme: 'green', variant: 'ghost' },
                { label: 'Eliminar', icon: FiTrash2, onClick: () => openDeleteDialog(student, 'permanent'), colorScheme: 'red', variant: 'ghost' },
              ]
          ),
        ]}
      />

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside" closeOnOverlayClick={!submitting}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">Crear Alumno</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <FormControl isInvalid={!!formErrors.first_name}>
                  <FormLabel fontSize="sm">Nombre</FormLabel>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Juan"
                    bg="white"
                  />
                  <FormErrorMessage>{formErrors.first_name}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!formErrors.last_name}>
                  <FormLabel fontSize="sm">Apellido</FormLabel>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Pérez"
                    bg="white"
                  />
                  <FormErrorMessage>{formErrors.last_name}</FormErrorMessage>
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel fontSize="sm">DNI</FormLabel>
                <Input
                  value={formData.dni}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                  placeholder="12345678"
                  bg="white"
                />
              </FormControl>
              <FormControl isInvalid={!!formErrors.course_id}>
                <FormLabel fontSize="sm">Curso</FormLabel>
                <Select
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  bg="white"
                  placeholder="Seleccionar curso"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.level} ({c.year})
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{formErrors.course_id}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setCreateOpen(false)} isDisabled={submitting}>
              Cancelar
            </Button>
            <Button colorScheme="brand" onClick={handleCreate} isLoading={submitting}>
              Crear Alumno
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside" closeOnOverlayClick={!submitting}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">Editar Alumno</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="full">
                <FormControl isInvalid={!!formErrors.first_name}>
                  <FormLabel fontSize="sm">Nombre</FormLabel>
                  <Input
                    value={editFormData.first_name}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    bg="white"
                  />
                  <FormErrorMessage>{formErrors.first_name}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!formErrors.last_name}>
                  <FormLabel fontSize="sm">Apellido</FormLabel>
                  <Input
                    value={editFormData.last_name}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    bg="white"
                  />
                  <FormErrorMessage>{formErrors.last_name}</FormErrorMessage>
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel fontSize="sm">DNI</FormLabel>
                <Input
                  value={editFormData.dni}
                  onChange={(e) => setEditFormData({ ...editFormData, dni: e.target.value })}
                  bg="white"
                />
              </FormControl>
              <FormControl isInvalid={!!formErrors.course_id}>
                <FormLabel fontSize="sm">Curso</FormLabel>
                <Select
                  value={editFormData.course_id}
                  onChange={(e) => setEditFormData({ ...editFormData, course_id: e.target.value })}
                  bg="white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.level} ({c.year})
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{formErrors.course_id}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditOpen(false)} isDisabled={submitting}>
              Cancelar
            </Button>
            <Button colorScheme="brand" onClick={handleEdit} isLoading={submitting}>
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Parents Modal */}
      <Modal isOpen={parentsOpen} onClose={() => setParentsOpen(false)} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">
            Padres — {parentsStudent ? `${parentsStudent.first_name} ${parentsStudent.last_name}` : ''}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {parentsLoading ? (
              <Center py={8}>
                <Spinner color="primary" size="lg" />
              </Center>
            ) : parents.length === 0 ? (
              <Text color="onSurfaceVariant" textAlign="center" py={4} mb={4}>
                No hay padres vinculados a este alumno.
              </Text>
            ) : (
              <VStack spacing={2} align="stretch" mb={6}>
                <Text fontWeight={600} fontSize="sm" color="onSurfaceVariant" mb={1}>
                  Padres vinculados
                </Text>
                {parents.map((p, idx) => (
                  <Flex
                    key={p.id}
                    p={3}
                    bg="containerLow"
                    borderRadius="input"
                    align="center"
                    justify="space-between"
                    sx={{
                      animation: 'fadeSlideIn 200ms ease-out both',
                      animationDelay: `${idx * 30}ms`,
                    }}
                  >
                    <HStack spacing={3}>
                      <Avatar size="sm" name={`${p.user.first_name} ${p.user.last_name}`} bg="green.400" />
                      <Box>
                        <Text fontWeight={500} fontSize="sm">
                          {p.user.first_name} {p.user.last_name}
                        </Text>
                        <Text fontSize="xs" color="onSurfaceVariant">
                          {p.user.email} {p.relationship ? `· ${p.relationship}` : ''}
                        </Text>
                      </Box>
                    </HStack>
                  </Flex>
                ))}
              </VStack>
            )}

            <Divider my={4} />

            <Text fontWeight={600} fontSize="sm" mb={3}>Vincular Nuevo Padre</Text>
            <HStack spacing={3} mb={3}>
              <Input
                value={parentSearchEmail}
                onChange={(e) => setParentSearchEmail(e.target.value)}
                placeholder="Buscar por email o nombre..."
                bg="white"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchParent(); }}
              />
              <Button
                colorScheme="brand"
                variant="outline"
                onClick={handleSearchParent}
                isLoading={parentSearching}
                leftIcon={<FiSearch />}
              >
                Buscar
              </Button>
            </HStack>

            {parentResults.length > 0 && (
              <VStack spacing={2} align="stretch" mb={4}>
                {parentResults.map((p) => (
                  <Flex
                    key={p.id}
                    p={3}
                    borderRadius="input"
                    border="1px solid"
                    borderColor={selectedParentId === p.id ? 'primary' : 'outlineVariant'}
                    bg={selectedParentId === p.id ? 'brand.50' : 'white'}
                    cursor="pointer"
                    onClick={() => setSelectedParentId(p.id)}
                    align="center"
                    justify="space-between"
                    _hover={{ borderColor: 'primary' }}
                    transition="all 160ms ease-out"
                  >
                    <HStack spacing={3}>
                      <Avatar size="sm" name={`${p.first_name} ${p.last_name}`} bg="green.400" />
                      <Box>
                        <Text fontWeight={500} fontSize="sm">
                          {p.first_name} {p.last_name}
                        </Text>
                        <Text fontSize="xs" color="onSurfaceVariant">{p.email}</Text>
                      </Box>
                    </HStack>
                    {selectedParentId === p.id && (
                      <Badge colorScheme="brand">Seleccionado</Badge>
                    )}
                  </Flex>
                ))}
              </VStack>
            )}

            {selectedParentId && (
              <HStack spacing={3} align="flex-end">
                <FormControl>
                  <FormLabel fontSize="sm">Parentesco</FormLabel>
                  <Select
                    value={parentRelationship}
                    onChange={(e) => setParentRelationship(e.target.value)}
                    bg="white"
                    placeholder="Seleccionar parentesco"
                  >
                    {RELATION_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  colorScheme="brand"
                  leftIcon={<FiLink />}
                  onClick={handleLinkParent}
                >
                  Vincular
                </Button>
              </HStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setParentsOpen(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete AlertDialog */}
      <AlertDialog isOpen={deleteAlertOpen} leastDestructiveRef={cancelRef} onClose={() => setDeleteAlertOpen(false)}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontFamily="heading" fontSize="lg">
            {deleteMode === 'deactivate' ? 'Desactivar Alumno' : 'Eliminar Alumno'}
          </AlertDialogHeader>
          <AlertDialogBody>
            {deleteMode === 'deactivate'
              ? '¿Está seguro de desactivar a este alumno? Todavía puede reactivarlo después.'
              : '¿Está seguro de eliminar a este alumno definitivamente? Esta acción es permanente y no se puede deshacer.'}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} variant="ghost" onClick={() => setDeleteAlertOpen(false)}>
              Cancelar
            </Button>
            <Button
              colorScheme={deleteMode === 'deactivate' ? 'orange' : 'red'}
              onClick={deleteMode === 'deactivate' ? handleDeactivate : handlePermanentDelete}
              ml={3}
            >
              {deleteMode === 'deactivate' ? 'Desactivar' : 'Eliminar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
