import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  useDisclosure,
  Select,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  HStack,
  VStack,
  Heading,
  Text,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  SimpleGrid,
  Skeleton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { AddIcon, WarningIcon, CheckIcon } from '@chakra-ui/icons';
import { FiUsers, FiCalendar, FiUserCheck } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import AttendanceGrid from '../components/AttendanceGrid';
import { attendanceService } from '../services/attendanceService';
import { adminService } from '../services/adminService';
import api from '../services/api';

function todayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function StudentsSection() {
  const toast = useToast();

  const showToast = useCallback((status, title, description) => {
    toast({ title, description, status, duration: 3000, isClosable: true, position: 'top-right' });
  }, [toast]);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const dc = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const cancelRef = useRef();

  const [studentsList, setStudentsList] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const cs = useDisclosure();
  const es = useDisclosure();
  const [studentForm, setStudentForm] = useState({ first_name: '', last_name: '', dni: '', birth_date: '', course_id: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentErrors, setStudentErrors] = useState({});

  const pc = useDisclosure();
  const [viewingStudentParents, setViewingStudentParents] = useState(null);
  const [currentParents, setCurrentParents] = useState([]);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [parentsAvailable, setParentsAvailable] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState('');

  const uc = useDisclosure();
  const [userForm, setUserForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'padre', phone_whatsapp: '' });
  const [userErrors, setUserErrors] = useState({});
  const [userCreating, setUserCreating] = useState(false);

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await adminService.getCourses();
      setCourses(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los cursos');
    } finally {
      setCoursesLoading(false);
    }
  }, [showToast]);

  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const data = await adminService.getStudents();
      setStudentsList(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los alumnos');
    } finally {
      setStudentsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  const resetStudentForm = () => {
    setStudentForm({ first_name: '', last_name: '', dni: '', birth_date: '', course_id: '' });
    setStudentErrors({});
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      dni: student.dni || '',
      birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
      course_id: student.course_id || '',
    });
    setStudentErrors({});
    es.onOpen();
  };

  const validateStudentForm = () => {
    const errs = {};
    if (!studentForm.first_name.trim()) errs.first_name = 'El nombre es requerido';
    if (!studentForm.last_name.trim()) errs.last_name = 'El apellido es requerido';
    if (!studentForm.course_id) errs.course_id = 'El curso es requerido';
    setStudentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateStudent = async () => {
    if (!validateStudentForm()) return;
    const payload = {
      first_name: studentForm.first_name,
      last_name: studentForm.last_name,
      course_id: parseInt(studentForm.course_id, 10),
    };
    if (studentForm.dni.trim()) payload.dni = studentForm.dni;
    if (studentForm.birth_date) payload.birth_date = studentForm.birth_date;
    try {
      await adminService.createStudent(payload);
      showToast('success', 'Alumno creado', 'El alumno se registró correctamente');
      cs.onClose();
      resetStudentForm();
      fetchStudents();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al crear alumno');
    }
  };

  const handleUpdateStudent = async () => {
    if (!validateStudentForm()) return;
    const payload = {
      first_name: studentForm.first_name,
      last_name: studentForm.last_name,
      course_id: parseInt(studentForm.course_id, 10),
    };
    if (studentForm.dni.trim()) payload.dni = studentForm.dni;
    if (studentForm.birth_date) payload.birth_date = studentForm.birth_date;
    try {
      await adminService.updateStudent(editingStudent.id, payload);
      showToast('success', 'Alumno actualizado', 'Los cambios se guardaron correctamente');
      es.onClose();
      resetStudentForm();
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al actualizar alumno');
    }
  };

  const handleDeactivateStudent = async (student) => {
    try {
      await adminService.deactivateStudent(student.id);
      showToast('success', 'Alumno desactivado', `Se desactivó a ${student.first_name} ${student.last_name}`);
      fetchStudents();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al desactivar alumno');
    }
  };

  const handleActivateStudent = async (student) => {
    try {
      await adminService.updateStudent(student.id, { is_active: true });
      showToast('success', 'Alumno activado', `Se activó a ${student.first_name} ${student.last_name}`);
      fetchStudents();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al activar alumno');
    }
  };

  const openParents = async (student) => {
    setViewingStudentParents(student);
    setParentsLoading(true);
    setSelectedParentId('');
    try {
      const [parentsData, allUsers] = await Promise.all([
        adminService.getParents(student.id),
        adminService.getUsersByRole('padre'),
      ]);
      setCurrentParents(parentsData || []);
      setParentsAvailable(allUsers || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al cargar padres');
    } finally {
      setParentsLoading(false);
    }
    pc.onOpen();
  };

  const handleLinkParent = async () => {
    if (!selectedParentId) return;
    try {
      await adminService.linkParent(viewingStudentParents.id, { user_id: parseInt(selectedParentId, 10) });
      showToast('success', 'Padre vinculado', 'Se vinculó al padre/madre con el alumno');
      setSelectedParentId('');
      const data = await adminService.getParents(viewingStudentParents.id);
      setCurrentParents(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al vincular padre');
    }
  };

  const openDeleteConfirm = (target, type) => {
    setDeleteTarget(target);
    setDeleteType(type);
    dc.onOpen();
  };

  const handleConfirmPermanentDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteType === 'student') {
        await adminService.permanentDeleteStudent(deleteTarget.id);
        showToast('success', 'Estudiante eliminado', `Se eliminó definitivamente a ${deleteTarget.first_name} ${deleteTarget.last_name}`);
        dc.onClose();
        setDeleteTarget(null);
        setDeleteType(null);
        fetchStudents();
      }
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al eliminar');
      dc.onClose();
    }
  };

  const studentColumns = [
    {
      key: 'status', label: 'Estado',
      render: (s) => (s.is_active !== false
        ? <Badge colorScheme="green" variant="subtle">Activo</Badge>
        : <Badge colorScheme="red" variant="subtle">Inactivo</Badge>),
    },
    { key: 'first_name', label: 'Nombre', render: (s) => `${s.first_name} ${s.last_name}` },
    { key: 'dni', label: 'DNI', render: (s) => s.dni || '—' },
    {
      key: 'course', label: 'Curso',
      render: (s) => (s.Course ? `${s.Course.name} (${s.Course.year})` : s.course_id || '—'),
    },
  ];

  const studentActions = (s) => {
    if (s.is_active === false) {
      return [
        { label: 'Editar', colorScheme: 'blue', onClick: openEditStudent },
        {
          label: 'Activar', colorScheme: 'green', variant: 'outline',
          onClick: (student) => { if (window.confirm(`¿Activar a ${student.first_name} ${student.last_name}?`)) handleActivateStudent(student); },
        },
        {
          label: 'Eliminar', colorScheme: 'red', variant: 'solid',
          onClick: (student) => openDeleteConfirm(student, 'student'),
        },
        { label: 'Ver Padres', colorScheme: 'purple', variant: 'outline', onClick: openParents },
      ];
    }
    return [
      { label: 'Editar', colorScheme: 'blue', onClick: openEditStudent },
      {
        label: 'Desactivar', colorScheme: 'orange', variant: 'outline',
        onClick: (s) => { if (window.confirm(`¿Desactivar a ${s.first_name} ${s.last_name}?`)) handleDeactivateStudent(s); },
      },
      { label: 'Ver Padres', colorScheme: 'purple', variant: 'outline', onClick: openParents },
    ];
  };

  const resetUserForm = () => {
    setUserForm({ email: '', password: '', first_name: '', last_name: '', role: 'padre', phone_whatsapp: '' });
    setUserErrors({});
  };

  const validateUserForm = () => {
    const errs = {};
    if (!userForm.email.trim()) errs.email = 'El email es requerido';
    if (!userForm.password.trim() || userForm.password.length < 8) errs.password = 'La contraseña debe tener al menos 8 caracteres';
    if (!userForm.first_name.trim()) errs.first_name = 'El nombre es requerido';
    if (!userForm.last_name.trim()) errs.last_name = 'El apellido es requerido';
    setUserErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateUserForm()) return;
    setUserCreating(true);
    try {
      await adminService.createUser({
        email: userForm.email,
        password: userForm.password,
        first_name: userForm.first_name,
        last_name: userForm.last_name,
        role: userForm.role,
        phone_whatsapp: userForm.phone_whatsapp || undefined,
      });
      showToast('success', 'Usuario creado', 'El usuario fue registrado correctamente');
      uc.onClose();
      resetUserForm();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudo crear el usuario');
    } finally {
      setUserCreating(false);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>Alumnos y Padres</Heading>
      <HStack spacing={4} mb={4}>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => { resetStudentForm(); cs.onOpen(); }}
          _active={{ transform: 'scale(0.96)' }}
          transition="transform 120ms ease-out"
        >
          Crear Alumno
        </Button>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="green"
          onClick={() => { resetUserForm(); uc.onOpen(); }}
          _active={{ transform: 'scale(0.96)' }}
          transition="transform 120ms ease-out"
        >
          Crear Usuario
        </Button>
      </HStack>
      <DataTable columns={studentColumns} data={studentsList} loading={studentsLoading} actions={studentActions} emptyMessage="No hay alumnos registrados" />

      <Modal isOpen={cs.isOpen} onClose={cs.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Alumno</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!studentErrors.first_name}>
                <FormLabel>Nombre</FormLabel>
                <Input value={studentForm.first_name} onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })} placeholder="Nombre" />
                <FormErrorMessage>{studentErrors.first_name}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!studentErrors.last_name}>
                <FormLabel>Apellido</FormLabel>
                <Input value={studentForm.last_name} onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })} placeholder="Apellido" />
                <FormErrorMessage>{studentErrors.last_name}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>DNI</FormLabel>
                <Input value={studentForm.dni} onChange={(e) => setStudentForm({ ...studentForm, dni: e.target.value })} placeholder="12345678" />
              </FormControl>
              <FormControl>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <Input type="date" value={studentForm.birth_date} onChange={(e) => setStudentForm({ ...studentForm, birth_date: e.target.value })} max={todayString()} />
              </FormControl>
              <FormControl isRequired isInvalid={!!studentErrors.course_id}>
                <FormLabel>Curso</FormLabel>
                <Select value={studentForm.course_id} onChange={(e) => setStudentForm({ ...studentForm, course_id: e.target.value })} placeholder="Seleccionar curso">
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.year}){c.division ? ` - ${c.division}` : ''}</option>
                  ))}
                </Select>
                <FormErrorMessage>{studentErrors.course_id}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={cs.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Cancelar</Button>
            <Button colorScheme="blue" onClick={handleCreateStudent} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Crear</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ─── Create User Modal ───────────────────────────── */}
      <Modal isOpen={uc.isOpen} onClose={uc.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Usuario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!userErrors.first_name}>
                <FormLabel>Nombre</FormLabel>
                <Input value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} placeholder="Nombre" />
                <FormErrorMessage>{userErrors.first_name}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!userErrors.last_name}>
                <FormLabel>Apellido</FormLabel>
                <Input value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} placeholder="Apellido" />
                <FormErrorMessage>{userErrors.last_name}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!userErrors.email}>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="correo@ejemplo.com" />
                <FormErrorMessage>{userErrors.email}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!userErrors.password}>
                <FormLabel>Contraseña</FormLabel>
                <Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="Mínimo 8 caracteres" />
                <FormErrorMessage>{userErrors.password}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Rol</FormLabel>
                <Select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="padre">Padre/Madre</option>
                  <option value="docente">Docente</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Teléfono (WhatsApp)</FormLabel>
                <Input value={userForm.phone_whatsapp} onChange={(e) => setUserForm({ ...userForm, phone_whatsapp: e.target.value })} placeholder="+541234567890" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={uc.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Cancelar</Button>
            <Button colorScheme="green" onClick={handleCreateUser} isLoading={userCreating} loadingText="Creando..." _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Crear</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={es.isOpen} onClose={es.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Alumno</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={!!studentErrors.first_name}>
                <FormLabel>Nombre</FormLabel>
                <Input value={studentForm.first_name} onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })} />
                <FormErrorMessage>{studentErrors.first_name}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!studentErrors.last_name}>
                <FormLabel>Apellido</FormLabel>
                <Input value={studentForm.last_name} onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })} />
                <FormErrorMessage>{studentErrors.last_name}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>DNI</FormLabel>
                <Input value={studentForm.dni} onChange={(e) => setStudentForm({ ...studentForm, dni: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <Input type="date" value={studentForm.birth_date} onChange={(e) => setStudentForm({ ...studentForm, birth_date: e.target.value })} max={todayString()} />
              </FormControl>
              <FormControl isRequired isInvalid={!!studentErrors.course_id}>
                <FormLabel>Curso</FormLabel>
                <Select value={studentForm.course_id} onChange={(e) => setStudentForm({ ...studentForm, course_id: e.target.value })} placeholder="Seleccionar curso">
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.year}){c.division ? ` - ${c.division}` : ''}</option>
                  ))}
                </Select>
                <FormErrorMessage>{studentErrors.course_id}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={es.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Cancelar</Button>
            <Button colorScheme="blue" onClick={handleUpdateStudent} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Guardar Cambios</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={pc.isOpen} onClose={pc.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Padres de {viewingStudentParents?.first_name || ''} {viewingStudentParents?.last_name || ''}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <HStack mb={4}>
              <Select value={selectedParentId} onChange={(e) => setSelectedParentId(e.target.value)} placeholder="Seleccionar padre/madre">
                {parentsAvailable.map((p) => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.email})</option>
                ))}
              </Select>
              <Button colorScheme="green" onClick={handleLinkParent} isDisabled={!selectedParentId} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">
                Vincular
              </Button>
            </HStack>
            {parentsLoading ? (
              <Skeleton height="40px" borderRadius="md" speed={0.8} />
            ) : currentParents.length === 0 ? (
              <Box textAlign="center" py={6} border="1px dashed" borderColor="gray.300" borderRadius="md">
                <Text color="gray.500">Este alumno no tiene padres vinculados.</Text>
                <Text fontSize="sm" color="gray.400" mt={1}>Seleccioná un padre/madre de la lista y hacé clic en Vincular.</Text>
              </Box>
            ) : (
              currentParents.map((p) => (
                <Box key={p.id} p={3} borderBottom="1px" borderColor="gray.100" _hover={{ bg: 'gray.50', transition: 'background-color 160ms ease-out' }}>
                  <Text fontWeight="medium" fontSize="sm">{p.User?.first_name} {p.User?.last_name}</Text>
                  <Text fontSize="xs" color="gray.500">{p.User?.email} {p.relationship ? `— ${p.relationship}` : ''}</Text>
                </Box>
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={pc.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={dc.isOpen} onClose={dc.onClose} leastDestructiveRef={cancelRef}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <HStack>
              <WarningIcon color="red.500" />
              <Text>Eliminar definitivamente</Text>
            </HStack>
          </AlertDialogHeader>
          <AlertDialogBody>
            {deleteType === 'student' && deleteTarget && (
              <Text>
                ¿Estás seguro de eliminar permanentemente a <strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong>?
                <Text as="div" mt={2} fontSize="sm" color="red.500">
                  Esta acción no se puede deshacer. Se eliminarán los vínculos parentales asociados.
                </Text>
              </Text>
            )}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={dc.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">
              Cancelar
            </Button>
            <Button colorScheme="red" ml={3} onClick={handleConfirmPermanentDelete} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">
              Eliminar definitivamente
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}

function AttendanceSection() {
  const toast = useToast();

  const showToast = useCallback((status, title, description) => {
    toast({ title, description, status, duration: 3000, isClosable: true, position: 'top-right' });
  }, [toast]);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await adminService.getCourses();
      setCourses(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los cursos');
    } finally {
      setCoursesLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [attendanceStudents, setAttendanceStudents] = useState([]);
  const [attendanceStudentsLoading, setAttendanceStudentsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [attendances, setAttendances] = useState({});
  const [savedAttendances, setSavedAttendances] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [summary, setSummary] = useState({ presente: 0, ausente: 0, tarde: 0, total: 0 });
  const [justifyModalOpen, setJustifyModalOpen] = useState(false);
  const [justifyingAttendance, setJustifyingAttendance] = useState(null);
  const [justificationNote, setJustificationNote] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [justifying, setJustifying] = useState(false);
  const fetchIdRef = useRef(0);

  const fetchAttendanceStudents = useCallback(async (courseId) => {
    if (!courseId) {
      setAttendanceStudents([]);
      return;
    }
    setAttendanceStudentsLoading(true);
    setAttendances({});
    setSavedAttendances({});
    setSummary({ presente: 0, ausente: 0, tarde: 0, total: 0 });
    try {
      const data = await adminService.getStudents();
      const filtered = (data || []).filter(s => s.course_id === parseInt(courseId, 10));
      setAttendanceStudents(filtered);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los alumnos');
      setAttendanceStudents([]);
    } finally {
      setAttendanceStudentsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAttendanceStudents(selectedCourseId);
  }, [selectedCourseId, fetchAttendanceStudents]);

  const fetchExistingAttendances = useCallback(async () => {
    if (!selectedCourseId || !selectedDate || attendanceStudents.length === 0) {
      return;
    }

    const fetchId = ++fetchIdRef.current;
    setLoadingSaved(true);
    try {
      const recordsMap = {};
      const savedMap = {};

      for (const student of attendanceStudents) {
        if (fetchId !== fetchIdRef.current) return;

        const result = await attendanceService.getStudentHistory(student.id, {
          from: selectedDate,
          to: selectedDate,
        });
        const dayRecord = result.records && result.records.length > 0 ? result.records[0] : null;
        const key = `${student.id}-${selectedDate}`;

        if (dayRecord) {
          recordsMap[key] = dayRecord.status;
          savedMap[key] = dayRecord;
        }
      }

      if (fetchId !== fetchIdRef.current) return;

      setAttendances((prev) => {
        const merged = { ...prev };
        Object.keys(recordsMap).forEach((k) => {
          merged[k] = recordsMap[k];
        });
        return merged;
      });
      setSavedAttendances((prev) => ({ ...prev, ...savedMap }));
    } catch (err) {
      if (fetchId === fetchIdRef.current) {
        showToast('error', 'Error', err.response?.data?.message || 'Error al cargar asistencias existentes');
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoadingSaved(false);
      }
    }
  }, [selectedCourseId, selectedDate, attendanceStudents, showToast]);

  useEffect(() => {
    fetchExistingAttendances();
  }, [fetchExistingAttendances]);

  const computeSummary = useCallback((attMap, total) => {
    const counts = { presente: 0, ausente: 0, tarde: 0 };
    Object.values(attMap).forEach((status) => {
      if (counts[status] !== undefined) counts[status]++;
    });
    setSummary({ ...counts, total });
  }, []);

  const handleStatusChange = (studentId, status) => {
    setAttendances((prev) => {
      const key = `${studentId}-${selectedDate}`;
      const next = { ...prev, [key]: status };
      computeSummary(next, attendanceStudents.length);
      return next;
    });
  };

  const getChangedRecords = () => {
    const records = [];
    attendanceStudents.forEach((student) => {
      const key = `${student.id}-${selectedDate}`;
      const newStatus = attendances[key];
      const saved = savedAttendances[key];
      if (newStatus && (!saved || saved.status !== newStatus)) {
        records.push({
          student_id: student.id,
          date: selectedDate,
          status: newStatus,
        });
      }
    });
    return records;
  };

  const handleSaveAll = async () => {
    const changedRecords = getChangedRecords();
    if (changedRecords.length === 0) {
      showToast('info', 'Sin cambios', 'No hay cambios para guardar');
      return;
    }

    setSaving(true);
    try {
      const created = await attendanceService.batchRegister(changedRecords);
      showToast('success', 'Asistencias guardadas', `${created.length} registro(s) guardado(s) correctamente`);

      const newSaved = { ...savedAttendances };
      created.forEach((rec) => {
        const key = `${rec.student_id}-${rec.date}`;
        newSaved[key] = rec;
      });
      setSavedAttendances(newSaved);

      const curAtt = { ...attendances };
      created.forEach((rec) => {
        const key = `${rec.student_id}-${rec.date}`;
        if (rec.status) curAtt[key] = rec.status;
      });
      setAttendances(curAtt);
      computeSummary(curAtt, attendanceStudents.length);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar las asistencias';
      showToast('error', 'Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const openJustifyModal = (attendanceRecord) => {
    setJustifyingAttendance(attendanceRecord);
    setJustificationNote(attendanceRecord.justification_note || '');
    setCertificateFile(null);
    setJustifyModalOpen(true);
  };

  const handleJustify = async () => {
    if (!justifyingAttendance) return;
    setJustifying(true);
    try {
      const attId = justifyingAttendance.id;

      if (certificateFile) {
        const formData = new FormData();
        formData.append('attendance_id', attId);
        formData.append('certificate', certificateFile);
        await attendanceService.uploadCertificate(formData);
      } else {
        await attendanceService.justify(attId, { justification_note: justificationNote });
      }

      showToast('success', 'Inasistencia justificada', 'Se registró la justificación correctamente');
      setJustifyModalOpen(false);
      setJustifyingAttendance(null);
      setJustificationNote('');
      setCertificateFile(null);
      fetchExistingAttendances();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al justificar la inasistencia';
      showToast('error', 'Error', msg);
    } finally {
      setJustifying(false);
    }
  };

  const changedCount = getChangedRecords().length;

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setAttendances({});
    setSavedAttendances({});
    setSummary({ presente: 0, ausente: 0, tarde: 0, total: 0 });
  };

  const justifiableStudents = attendanceStudents.filter((s) => {
    const key = `${s.id}-${selectedDate}`;
    const saved = savedAttendances[key];
    return saved && saved.status === 'ausente' && !saved.is_justified;
  });

  return (
    <Box>
      <Heading size="lg" mb={6}>Inasistencias</Heading>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
            Curso
          </FormLabel>
          <Select
            value={selectedCourseId}
            onChange={handleCourseChange}
            placeholder="Seleccionar curso"
            bg="white"
          >
            {coursesLoading ? (
              <option disabled>Cargando cursos...</option>
            ) : (
              courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.year}){c.division ? ` - ${c.division}` : ''}
                </option>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
            Fecha
          </FormLabel>
          <Input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            bg="white"
          />
        </FormControl>

        <FormControl display="flex" alignItems="flex-end">
          <Button
            colorScheme="blue"
            leftIcon={<CheckIcon />}
            onClick={handleSaveAll}
            isLoading={saving}
            isDisabled={!selectedCourseId || changedCount === 0}
            width="full"
            _active={{ transform: 'scale(0.96)' }}
            transition="transform 120ms ease-out"
          >
            Guardar Todo{changedCount > 0 ? ` (${changedCount})` : ''}
          </Button>
        </FormControl>
      </SimpleGrid>

      {!selectedCourseId && !attendanceStudentsLoading && (
        <Box
          textAlign="center"
          py={16}
          px={6}
          border="1px dashed"
          borderColor="gray.300"
          borderRadius="lg"
          bg="white"
        >
          <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={1}>
            Seleccioná un curso para comenzar
          </Text>
          <Text fontSize="sm" color="gray.500">
            Elegí un curso del selector superior para ver sus alumnos y registrar asistencias.
          </Text>
        </Box>
      )}

      {selectedCourseId && (
        <>
          <StatGroup mb={6} gap={4}>
            <Stat
              bg="white"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="gray.200"
            >
              <StatLabel fontSize="xs" color="gray.500">Total alumnos</StatLabel>
              <StatNumber fontSize="2xl">{summary.total || attendanceStudents.length}</StatNumber>
            </Stat>
            <Stat
              bg="green.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="green.200"
            >
              <StatLabel fontSize="xs" color="green.700">Presentes</StatLabel>
              <StatNumber fontSize="2xl" color="green.600">{summary.presente}</StatNumber>
            </Stat>
            <Stat
              bg="red.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="red.200"
            >
              <StatLabel fontSize="xs" color="red.700">Ausentes</StatLabel>
              <StatNumber fontSize="2xl" color="red.600">{summary.ausente}</StatNumber>
            </Stat>
            <Stat
              bg="orange.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="orange.200"
            >
              <StatLabel fontSize="xs" color="orange.700">Tardes</StatLabel>
              <StatNumber fontSize="2xl" color="orange.600">{summary.tarde}</StatNumber>
            </Stat>
          </StatGroup>

          {loadingSaved ? (
            <Skeleton height="300px" borderRadius="lg" speed={0.8} mb={4}>
              <Box height="300px" />
            </Skeleton>
          ) : (
            <>
              <AttendanceGrid
                students={attendanceStudents}
                selectedDate={selectedDate}
                attendances={attendances}
                onStatusChange={handleStatusChange}
                loading={attendanceStudentsLoading}
              />

              {justifiableStudents.length > 0 && (
                <Box mt={6}>
                  <Heading size="sm" mb={3} color="gray.700">
                    Justificar inasistencias
                  </Heading>
                  <Box
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                    overflow="hidden"
                    bg="white"
                  >
                    {justifiableStudents.map((student) => {
                      const key = `${student.id}-${selectedDate}`;
                      const saved = savedAttendances[key];
                      return (
                        <HStack
                          key={student.id}
                          p={3}
                          borderBottom="1px solid"
                          borderColor="gray.100"
                          _hover={{ bg: 'gray.50', transition: 'background-color 160ms ease-out' }}
                        >
                          <Text fontSize="sm" fontWeight="medium" flex={1}>
                            {student.first_name} {student.last_name}
                          </Text>
                          <Badge colorScheme="red" variant="subtle" mr={2}>
                            Ausente
                          </Badge>
                          <Button
                            size="xs"
                            colorScheme="yellow"
                            variant="outline"
                            onClick={() => openJustifyModal(saved)}
                            _active={{ transform: 'scale(0.96)' }}
                            transition="transform 120ms ease-out"
                          >
                            Justificar
                          </Button>
                        </HStack>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </>
          )}
        </>
      )}

      <Modal isOpen={justifyModalOpen} onClose={() => setJustifyModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Justificar Inasistencia</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nota de justificación</FormLabel>
                <Textarea
                  value={justificationNote}
                  onChange={(e) => setJustificationNote(e.target.value)}
                  placeholder="Opcional: agregá una nota..."
                  rows={3}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Certificado (opcional)</FormLabel>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setCertificateFile(e.target.files[0] || null)}
                  p={1}
                  py={1}
                  height="auto"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Formatos aceptados: JPG, PNG, PDF (máx 5MB)
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setJustifyModalOpen(false)}
              _active={{ transform: 'scale(0.96)' }}
              transition="transform 120ms ease-out"
            >
              Cancelar
            </Button>
            <Button
              colorScheme="yellow"
              onClick={handleJustify}
              isLoading={justifying}
              _active={{ transform: 'scale(0.96)' }}
              transition="transform 120ms ease-out"
            >
              Justificar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function TeachersSection() {
  const toast = useToast();

  const showToast = useCallback((status, title, description) => {
    toast({ title, description, status, duration: 3000, isClosable: true, position: 'top-right' });
  }, [toast]);

  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      const data = await adminService.getUsersByRole('docente');
      setTeachers(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los docentes');
    } finally {
      setTeachersLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const tc = useDisclosure();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [teacherSubjectsLoading, setTeacherSubjectsLoading] = useState(false);
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [teacherSelectedCourseId, setTeacherSelectedCourseId] = useState('');
  const [teacherCourseSubjects, setTeacherCourseSubjects] = useState([]);
  const [teacherSelectedSubjectId, setTeacherSelectedSubjectId] = useState('');

  const openTeacherModal = async (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherSubjectsLoading(true);
    setTeacherSelectedCourseId('');
    setTeacherSelectedSubjectId('');
    setTeacherCourseSubjects([]);
    try {
      const coursesData = await adminService.getCourses();
      setTeacherCourses(coursesData || []);
      const subjectPromises = (coursesData || []).map((c) => adminService.getSubjects(c.id));
      const subjectsResults = await Promise.all(subjectPromises);
      const allSubjects = subjectsResults.flat();
      const checkPromises = allSubjects.map((s) =>
        adminService.getTeachers(s.id).then((teachersResult) => ({
          subject: s,
          course: coursesData.find((c) => c.id === s.course_id),
          isAssigned: teachersResult.some((t) => t.user_id === teacher.id),
        }))
      );
      const results = await Promise.all(checkPromises);
      setTeacherSubjects(results.filter((r) => r.isAssigned));
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al cargar datos del docente');
    } finally {
      setTeacherSubjectsLoading(false);
    }
    tc.onOpen();
  };

  const handleTeacherCourseChange = async (courseId) => {
    setTeacherSelectedCourseId(courseId);
    setTeacherSelectedSubjectId('');
    if (!courseId) {
      setTeacherCourseSubjects([]);
      return;
    }
    try {
      const subjects = await adminService.getSubjects(parseInt(courseId, 10));
      setTeacherCourseSubjects(subjects || []);
    } catch {
      setTeacherCourseSubjects([]);
    }
  };

  const handleAssignSubject = async () => {
    if (!teacherSelectedSubjectId || !selectedTeacher) return;
    try {
      await adminService.assignTeacher(parseInt(teacherSelectedSubjectId, 10), {
        user_id: selectedTeacher.id,
      });
      showToast('success', 'Docente asignado', 'Se asignó el docente a la materia');
      const course = teacherCourses.find((c) => c.id === parseInt(teacherSelectedCourseId, 10));
      const subject = teacherCourseSubjects.find((s) => s.id === parseInt(teacherSelectedSubjectId, 10));
      setTeacherSubjects((prev) => [
        ...prev,
        { subject, course, isAssigned: true },
      ]);
      setTeacherSelectedCourseId('');
      setTeacherSelectedSubjectId('');
      setTeacherCourseSubjects([]);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al asignar docente');
    }
  };

  const handleRemoveSubject = async (subject) => {
    if (!selectedTeacher) return;
    try {
      await api.delete(`/subjects/${subject.subject.id}/teachers`, {
        data: { user_id: selectedTeacher.id },
      });
      showToast('success', 'Docente removido', `Se removió al docente de ${subject.subject.name}`);
      setTeacherSubjects((prev) => prev.filter((s) => s.subject.id !== subject.subject.id));
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al remover docente');
    }
  };

  const teacherColumns = [
    { key: 'first_name', label: 'Nombre', render: (t) => `${t.first_name} ${t.last_name}` },
    { key: 'email', label: 'Email' },
    { key: 'phone_whatsapp', label: 'Teléfono', render: (t) => t.phone_whatsapp || '—' },
  ];

  const teacherActions = [
    {
      label: 'Ver Materias',
      colorScheme: 'teal',
      onClick: openTeacherModal,
    },
  ];

  const assignedSubjects = teacherSubjects.filter((s) => s.isAssigned);

  return (
    <Box>
      <Heading size="lg" mb={6}>Docentes</Heading>
      <DataTable columns={teacherColumns} data={teachers} loading={teachersLoading} actions={teacherActions} emptyMessage="No hay docentes registrados" />

      <Modal isOpen={tc.isOpen} onClose={tc.onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Materias de {selectedTeacher?.first_name || ''} {selectedTeacher?.last_name || ''}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {teacherSubjectsLoading ? (
              <>
                <Skeleton height="40px" borderRadius="md" speed={0.8} mb={3} />
                <Skeleton height="40px" borderRadius="md" speed={0.8} mb={3} />
              </>
            ) : (
              <>
                <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.600">Materias asignadas</Text>
                {assignedSubjects.length === 0 ? (
                  <Box textAlign="center" py={6} border="1px dashed" borderColor="gray.300" borderRadius="md" mb={6}>
                    <Text color="gray.500">Este docente no tiene materias asignadas.</Text>
                    <Text fontSize="sm" color="gray.400" mt={1}>Usá el formulario de abajo para asignar una materia.</Text>
                  </Box>
                ) : (
                  <VStack spacing={2} align="stretch" mb={6}>
                    {assignedSubjects.map((s) => (
                      <Box key={s.subject.id} p={3} border="1px" borderColor="gray.200" borderRadius="md" _hover={{ bg: 'gray.50', transition: 'background-color 160ms ease-out' }}>
                        <HStack justify="space-between">
                          <Box>
                            <Text fontSize="sm" fontWeight="medium">{s.subject.name}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {s.course?.name || ''} ({s.course?.year || ''}){s.course?.division ? ` - ${s.course.division}` : ''}
                            </Text>
                          </Box>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleRemoveSubject(s)}
                            _active={{ transform: 'scale(0.96)' }}
                            transition="transform 120ms ease-out"
                          >
                            Quitar
                          </Button>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}

                <Text fontWeight="semibold" fontSize="sm" mb={2} color="gray.600">Asignar nueva materia</Text>
                <VStack spacing={3} align="stretch">
                  <FormControl>
                    <FormLabel fontSize="sm">Curso</FormLabel>
                    <Select
                      value={teacherSelectedCourseId}
                      onChange={(e) => handleTeacherCourseChange(e.target.value)}
                      placeholder="Seleccionar curso"
                    >
                      {teacherCourses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.year}){c.division ? ` - ${c.division}` : ''}</option>
                      ))}
                    </Select>
                  </FormControl>
                  {teacherSelectedCourseId && (
                    <FormControl>
                      <FormLabel fontSize="sm">Materia</FormLabel>
                      <Select
                        value={teacherSelectedSubjectId}
                        onChange={(e) => setTeacherSelectedSubjectId(e.target.value)}
                        placeholder="Seleccionar materia"
                      >
                        {teacherCourseSubjects
                          .filter((s) => !assignedSubjects.some((as) => as.subject.id === s.id))
                          .map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                      </Select>
                    </FormControl>
                  )}
                  <Button
                    colorScheme="blue"
                    onClick={handleAssignSubject}
                    isDisabled={!teacherSelectedSubjectId}
                    alignSelf="flex-start"
                    _active={{ transform: 'scale(0.96)' }}
                    transition="transform 120ms ease-out"
                  >
                    Asignar
                  </Button>
                </VStack>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={tc.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default function PreceptorDashboard() {
  const sections = [
    { id: 'students', label: 'Alumnos y Padres', icon: FiUsers, component: StudentsSection },
    { id: 'attendance', label: 'Inasistencias', icon: FiCalendar, component: AttendanceSection },
    { id: 'teachers', label: 'Docentes', icon: FiUserCheck, component: TeachersSection },
  ];

  return (
    <>
      <DashboardLayout sections={sections} />
      <Box as="style" display="none">
        {`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}
      </Box>
    </>
  );
}
