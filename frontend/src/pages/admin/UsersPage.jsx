import {
  Box, Heading, Button, Input, HStack, VStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, FormControl, FormLabel, FormErrorMessage,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  InputGroup, InputLeftElement, useToast, Text,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiToggleRight, FiSearch, FiUserPlus, FiRefreshCw,
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import CustomSelect from '../../components/CustomSelect';
import { adminService } from '../../services/adminService';

const roleColors = {
  admin: 'red',
  preceptor: 'orange',
  docente: 'blue',
  padre: 'green',
};

const ROLE_OPTIONS = [
  { value: 'docente', label: 'Docente' },
  { value: 'preceptor', label: 'Preceptor/a' },
  { value: 'padre', label: 'Padre/Madre' },
];

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: '',
  phone_whatsapp: '',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState(emptyForm);

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteMode, setDeleteMode] = useState('deactivate');

  const toast = useToast();
  const cancelRef = useRef();

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    adminService.getUsers()
      .then((data) => setUsers(data || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.first_name?.toLowerCase().includes(q) ||
          u.last_name?.toLowerCase().includes(q),
      );
    }
    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }
    return result;
  }, [users, search, roleFilter]);

  const validateForm = (data, isEdit = false) => {
    const errors = {};
    if (!data.first_name?.trim()) errors.first_name = 'El nombre es obligatorio';
    if (!data.last_name?.trim()) errors.last_name = 'El apellido es obligatorio';
    if (!data.email?.trim()) errors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email inválido';
    if (!isEdit && !data.password?.trim()) errors.password = 'La contraseña es obligatoria';
    if (!isEdit && data.password && data.password.length < 8) errors.password = 'Mínimo 8 caracteres';
    if (!data.role?.trim()) errors.role = 'El rol es obligatorio';
    return errors;
  };

  const handleCreate = async () => {
    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      await adminService.createUser({
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        role: formData.role,
        phone_whatsapp: formData.phone_whatsapp.trim() || undefined,
      });
      toast({ title: 'Usuario creado', description: 'El usuario fue creado exitosamente.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setCreateOpen(false);
      setFormData(emptyForm);
      setFormErrors({});
      fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      password: '',
      role: user.role || '',
      phone_whatsapp: user.phone_whatsapp || '',
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEdit = async () => {
    const errors = {};
    if (!editFormData.first_name?.trim()) errors.first_name = 'El nombre es obligatorio';
    if (!editFormData.last_name?.trim()) errors.last_name = 'El apellido es obligatorio';
    if (!editFormData.email?.trim()) errors.email = 'El email es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(editFormData.email)) errors.email = 'Email inválido';
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      await adminService.updateUser(editingUser.id, {
        email: editFormData.email.trim(),
        first_name: editFormData.first_name.trim(),
        last_name: editFormData.last_name.trim(),
        phone_whatsapp: editFormData.phone_whatsapp.trim() || undefined,
      });
      toast({ title: 'Usuario actualizado', description: 'Los cambios fueron guardados.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setEditOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (user, mode) => {
    setDeletingUser(user);
    setDeleteMode(mode);
    setDeleteAlertOpen(true);
  };

  const handleDeactivate = async () => {
    if (!deletingUser) return;
    try {
      await adminService.deactivateUser(deletingUser.id);
      toast({ title: 'Usuario desactivado', description: 'El usuario fue desactivado correctamente.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setDeleteAlertOpen(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    }
  };

  const handlePermanentDelete = async () => {
    if (!deletingUser) return;
    try {
      await adminService.permanentDeleteUser(deletingUser.id);
      toast({ title: 'Usuario eliminado', description: 'El usuario fue eliminado definitivamente.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setDeleteAlertOpen(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    }
  };

  const handleReactivate = async (user) => {
    try {
      await adminService.updateUser(user.id, { is_active: true });
      toast({ title: 'Usuario reactivado', description: 'El usuario fue reactivado correctamente.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      fetchUsers();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    }
  };

  const columns = [
    {
      key: 'is_active',
      label: 'Estado',
      render: (u) => (
        <Box
          as="span"
          px={3}
          py={1}
          borderRadius="pill"
          fontSize="xs"
          fontWeight={500}
          bg={u.is_active ? 'success' : 'error'}
          color="white"
        >
          {u.is_active ? 'Activo' : 'Inactivo'}
        </Box>
      ),
    },
    { key: 'first_name', label: 'Nombre', render: (u) => `${u.first_name} ${u.last_name}` },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Rol',
      render: (u) => (
        <Box
          as="span"
          px={3}
          py={1}
          borderRadius="pill"
          fontSize="xs"
          fontWeight={500}
          bg={`${roleColors[u.role] || 'gray'}.100`}
          color={`${roleColors[u.role] || 'gray'}.700`}
        >
          {u.role}
        </Box>
      ),
    },
    { key: 'phone_whatsapp', label: 'Teléfono', render: (u) => u.phone_whatsapp || '—' },
  ];

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchUsers} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Usuarios
      </Heading>

      <HStack spacing={4} mb={6} flexWrap="wrap">
        <InputGroup maxW="320px">
          <InputLeftElement pointerEvents="none">
            <Box as={FiSearch} color="onSurfaceVariant" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por email o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="white"
          />
        </InputGroup>
        <CustomSelect
          value={roleFilter}
          onChange={setRoleFilter}
          maxW="200px"
          placeholder="Todos los roles"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </CustomSelect>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => { setFormData(emptyForm); setFormErrors({}); setCreateOpen(true); }}
        >
          Crear Usuario
        </Button>
      </HStack>

      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="No hay usuarios registrados"
        emptyDescription="Cree el primer usuario usando el botón superior."
        emptyAction={
          <Button
            leftIcon={<FiUserPlus />}
            colorScheme="brand"
            onClick={() => { setFormData(emptyForm); setFormErrors({}); setCreateOpen(true); }}
          >
            Crear Usuario
          </Button>
        }
        actions={(user) => [
          { label: 'Editar', icon: FiEdit2, onClick: () => openEditModal(user), variant: 'ghost' },
          ...(user.is_active
            ? [{ label: 'Desactivar', icon: FiToggleRight, onClick: () => openDeleteDialog(user, 'deactivate'), colorScheme: 'orange', variant: 'ghost' }]
            : [
                { label: 'Reactivar', icon: FiRefreshCw, onClick: () => handleReactivate(user), colorScheme: 'green', variant: 'ghost' },
                { label: 'Eliminar', icon: FiTrash2, onClick: () => openDeleteDialog(user, 'permanent'), colorScheme: 'red', variant: 'ghost' },
              ]
          ),
        ]}
      />

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside" closeOnOverlayClick={!submitting}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">Crear Usuario</ModalHeader>
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
              <FormControl isInvalid={!!formErrors.email}>
                <FormLabel fontSize="sm">Email</FormLabel>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  bg="white"
                />
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!formErrors.role}>
                <FormLabel fontSize="sm">Rol</FormLabel>
                <CustomSelect
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val })}
                  placeholder="Seleccionar rol"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </CustomSelect>
                <FormErrorMessage>{formErrors.role}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!formErrors.password}>
                <FormLabel fontSize="sm">Contraseña</FormLabel>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  bg="white"
                />
                <FormErrorMessage>{formErrors.password}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Teléfono (WhatsApp)</FormLabel>
                <Input
                  value={formData.phone_whatsapp}
                  onChange={(e) => setFormData({ ...formData, phone_whatsapp: e.target.value })}
                  placeholder="+5491123456789"
                  bg="white"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setCreateOpen(false)} isDisabled={submitting}>
              Cancelar
            </Button>
            <Button colorScheme="brand" onClick={handleCreate} isLoading={submitting}>
              Crear Usuario
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside" closeOnOverlayClick={!submitting}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">Editar Usuario</ModalHeader>
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
              <FormControl isInvalid={!!formErrors.email}>
                <FormLabel fontSize="sm">Email</FormLabel>
                <Input
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  bg="white"
                />
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Rol</FormLabel>
                <Input value={editFormData.role} isDisabled bg="containerLow" />
                <Text fontSize="xs" color="onSurfaceVariant" mt={1}>El rol no se puede modificar.</Text>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Teléfono (WhatsApp)</FormLabel>
                <Input
                  value={editFormData.phone_whatsapp}
                  onChange={(e) => setEditFormData({ ...editFormData, phone_whatsapp: e.target.value })}
                  bg="white"
                />
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

      {/* Delete AlertDialog */}
      <AlertDialog isOpen={deleteAlertOpen} leastDestructiveRef={cancelRef} onClose={() => setDeleteAlertOpen(false)}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontFamily="heading" fontSize="lg">
            {deleteMode === 'deactivate' ? 'Desactivar Usuario' : 'Eliminar Usuario'}
          </AlertDialogHeader>
          <AlertDialogBody>
            {deleteMode === 'deactivate'
              ? '¿Está seguro de desactivar a este usuario? Todavía puede reactivarlo después.'
              : '¿Está seguro de eliminar a este usuario definitivamente? Esta acción es permanente y no se puede deshacer.'}
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
