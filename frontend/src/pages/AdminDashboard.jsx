import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Badge,
  useToast,
  VStack,
  Heading,
  HStack,
  Text,
  Skeleton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { AddIcon, ViewIcon, WarningIcon, CheckIcon } from '@chakra-ui/icons';
import DashboardHeader from '../components/DashboardHeader';
import DataTable from '../components/DataTable';
import { adminService } from '../services/adminService';

const roleLabels = {
  admin: { label: 'Administrador', color: 'red' },
  preceptor: { label: 'Preceptor/a', color: 'orange' },
  docente: { label: 'Docente', color: 'blue' },
  padre: { label: 'Padre/Madre', color: 'green' },
};

function todayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export default function AdminDashboard() {
  const toast = useToast();
  const [tabIndex, setTabIndex] = useState(0);

  const showToast = useCallback((status, title, description) => {
    toast({ title, description, status, duration: 3000, isClosable: true, position: 'top-right' });
  }, [toast]);

  // ============================================================
  // USERS
  // ============================================================
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const cu = useDisclosure();
  const eu = useDisclosure();
  const [userForm, setUserForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: 'docente', phone_whatsapp: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [userErrors, setUserErrors] = useState({});

  // Delete confirmation dialog state
  const dc = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'user' | 'student'
  const cancelRef = useRef();

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los usuarios');
    } finally {
      setUsersLoading(false);
    }
  }, [showToast]);

  useEffect(() => { if (tabIndex === 0) fetchUsers(); }, [tabIndex, fetchUsers]);

  const resetUserForm = () => {
    setUserForm({ email: '', password: '', first_name: '', last_name: '', role: 'docente', phone_whatsapp: '' });
    setUserErrors({});
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      email: user.email || '',
      password: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role || 'docente',
      phone_whatsapp: user.phone_whatsapp || '',
    });
    setUserErrors({});
    eu.onOpen();
  };

  const validateUserForm = (isEdit) => {
    const errs = {};
    if (!userForm.email.trim()) errs.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(userForm.email)) errs.email = 'Email inválido';
    if (!isEdit && !userForm.password) errs.password = 'La contraseña es requerida';
    else if (!isEdit && userForm.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (!userForm.first_name.trim()) errs.first_name = 'El nombre es requerido';
    if (!userForm.last_name.trim()) errs.last_name = 'El apellido es requerido';
    setUserErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateUserForm(false)) return;
    try {
      await adminService.createUser(userForm);
      showToast('success', 'Usuario creado', 'El usuario se creó correctamente');
      cu.onClose();
      resetUserForm();
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Error al crear usuario';
      showToast('error', 'Error', msg);
    }
  };

  const handleUpdateUser = async () => {
    if (!validateUserForm(true)) return;
    const payload = {
      email: userForm.email,
      first_name: userForm.first_name,
      last_name: userForm.last_name,
      phone_whatsapp: userForm.phone_whatsapp || undefined,
    };
    if (userForm.password) payload.password = userForm.password;
    try {
      await adminService.updateUser(editingUser.id, payload);
      showToast('success', 'Usuario actualizado', 'Los cambios se guardaron correctamente');
      eu.onClose();
      resetUserForm();
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Error al actualizar usuario';
      showToast('error', 'Error', msg);
    }
  };

  const handleDeactivateUser = async (user) => {
    try {
      await adminService.deactivateUser(user.id);
      showToast('success', 'Usuario desactivado', `Se desactivó a ${user.first_name} ${user.last_name}`);
      fetchUsers();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al desactivar usuario');
    }
  };

  const handleActivateUser = async (user) => {
    try {
      await adminService.updateUser(user.id, { is_active: true });
      showToast('success', 'Usuario activado', `Se activó a ${user.first_name} ${user.last_name}`);
      fetchUsers();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al activar usuario');
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
      if (deleteType === 'user') {
        await adminService.permanentDeleteUser(deleteTarget.id);
        showToast('success', 'Usuario eliminado', `Se eliminó definitivamente a ${deleteTarget.first_name} ${deleteTarget.last_name}`);
      } else if (deleteType === 'student') {
        await adminService.permanentDeleteStudent(deleteTarget.id);
        showToast('success', 'Estudiante eliminado', `Se eliminó definitivamente a ${deleteTarget.first_name} ${deleteTarget.last_name}`);
      }
      dc.onClose();
      setDeleteTarget(null);
      setDeleteType(null);
      if (deleteType === 'user') fetchUsers();
      else fetchStudents();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al eliminar');
      dc.onClose();
    }
  };

  const userColumns = [
    {
      key: 'status', label: 'Estado',
      render: (u) => (u.is_active !== false
        ? <Badge colorScheme="green" variant="subtle">Activo</Badge>
        : <Badge colorScheme="red" variant="subtle">Inactivo</Badge>),
    },
    { key: 'first_name', label: 'Nombre', render: (u) => `${u.first_name} ${u.last_name}` },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Rol',
      render: (u) => {
        const info = roleLabels[u.role] || { label: u.role, color: 'gray' };
        return <Badge colorScheme={info.color}>{info.label}</Badge>;
      },
    },
    { key: 'phone_whatsapp', label: 'Teléfono', render: (u) => u.phone_whatsapp || '—' },
  ];

  const userActions = (u) => {
    if (u.is_active === false) {
      return [
        { label: 'Editar', colorScheme: 'blue', onClick: openEditUser },
        {
          label: 'Activar', colorScheme: 'green', variant: 'outline',
          onClick: (user) => { if (window.confirm(`¿Activar a ${user.first_name} ${user.last_name}?`)) handleActivateUser(user); },
        },
        {
          label: 'Eliminar', colorScheme: 'red', variant: 'solid',
          onClick: (user) => openDeleteConfirm(user, 'user'),
        },
      ];
    }
    return [
      { label: 'Editar', colorScheme: 'blue', onClick: openEditUser },
      {
        label: 'Desactivar', colorScheme: 'orange', variant: 'outline',
        onClick: (u) => {
          if (window.confirm(`¿Desactivar a ${u.first_name} ${u.last_name}?`)) handleDeactivateUser(u);
        },
      },
    ];
  };

  // ============================================================
  // COURSES
  // ============================================================
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const cc = useDisclosure();
  const ec = useDisclosure();
  const [courseForm, setCourseForm] = useState({ name: '', year: new Date().getFullYear(), division: '', level: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseErrors, setCourseErrors] = useState({});

  // Subjects sub-modal
  const sc = useDisclosure();
  const [viewingCourseSubjects, setViewingCourseSubjects] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

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

  useEffect(() => { if (tabIndex === 1) fetchCourses(); }, [tabIndex, fetchCourses]);

  const resetCourseForm = () => {
    setCourseForm({ name: '', year: new Date().getFullYear(), division: '', level: '' });
    setCourseErrors({});
  };

  const openEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name || '',
      year: course.year || new Date().getFullYear(),
      division: course.division || '',
      level: course.level || '',
    });
    setCourseErrors({});
    ec.onOpen();
  };

  const validateCourseForm = () => {
    const errs = {};
    if (!courseForm.name.trim()) errs.name = 'El nombre es requerido';
    if (!courseForm.year) errs.year = 'El año es requerido';
    setCourseErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateCourse = async () => {
    if (!validateCourseForm()) return;
    const payload = { name: courseForm.name, year: parseInt(courseForm.year, 10) };
    if (courseForm.division.trim()) payload.division = courseForm.division;
    if (courseForm.level.trim()) payload.level = courseForm.level;
    try {
      await adminService.createCourse(payload);
      showToast('success', 'Curso creado', 'El curso se creó correctamente');
      cc.onClose();
      resetCourseForm();
      fetchCourses();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al crear curso');
    }
  };

  const handleUpdateCourse = async () => {
    if (!validateCourseForm()) return;
    const payload = { name: courseForm.name, year: parseInt(courseForm.year, 10) };
    if (courseForm.division.trim()) payload.division = courseForm.division;
    if (courseForm.level.trim()) payload.level = courseForm.level;
    try {
      await adminService.updateCourse(editingCourse.id, payload);
      showToast('success', 'Curso actualizado', 'Los cambios se guardaron correctamente');
      ec.onClose();
      resetCourseForm();
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al actualizar curso');
    }
  };

  const handleDeleteCourse = async (course) => {
    try {
      await adminService.deleteCourse(course.id);
      showToast('success', 'Curso eliminado', `Se eliminó ${course.name}`);
      fetchCourses();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al eliminar curso');
    }
  };

  const openSubjects = async (course) => {
    setViewingCourseSubjects(course);
    setSubjectsLoading(true);
    setNewSubjectName('');
    try {
      const data = await adminService.getSubjects(course.id);
      setSubjects(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al cargar materias');
    } finally {
      setSubjectsLoading(false);
    }
    sc.onOpen();
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      await adminService.createSubject(viewingCourseSubjects.id, { name: newSubjectName });
      showToast('success', 'Materia agregada', `Se agregó "${newSubjectName}"`);
      setNewSubjectName('');
      const data = await adminService.getSubjects(viewingCourseSubjects.id);
      setSubjects(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al agregar materia');
    }
  };

  const courseColumns = [
    { key: 'name', label: 'Nombre' },
    { key: 'year', label: 'Año' },
    { key: 'division', label: 'División', render: (c) => c.division || '—' },
    { key: 'level', label: 'Nivel', render: (c) => c.level || '—' },
  ];

  const courseActions = [
    { label: 'Editar', colorScheme: 'blue', onClick: openEditCourse },
    {
      label: 'Eliminar', colorScheme: 'red', variant: 'ghost',
      onClick: (c) => { if (window.confirm(`¿Eliminar el curso "${c.name}"?`)) handleDeleteCourse(c); },
    },
    { label: 'Ver Materias', colorScheme: 'teal', variant: 'outline', onClick: openSubjects },
  ];

  // ============================================================
  // STUDENTS
  // ============================================================
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [allCourses, setAllCourses] = useState([]);

  const cs = useDisclosure();
  const es = useDisclosure();
  const [studentForm, setStudentForm] = useState({ first_name: '', last_name: '', dni: '', birth_date: '', course_id: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentErrors, setStudentErrors] = useState({});

  // Parents sub-modal
  const pc = useDisclosure();
  const [viewingStudentParents, setViewingStudentParents] = useState(null);
  const [parents, setParents] = useState([]);
  const [parentsLoading, setParentsLoading] = useState(false);
  const [parentsAvailable, setParentsAvailable] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState('');

  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const data = await adminService.getStudents();
      setStudents(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'No se pudieron cargar los alumnos');
    } finally {
      setStudentsLoading(false);
    }
  }, [showToast]);

  const fetchAllCourses = useCallback(async () => {
    try {
      const data = await adminService.getCourses();
      setAllCourses(data || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (tabIndex === 2) {
      fetchStudents();
      fetchAllCourses();
    }
  }, [tabIndex, fetchStudents, fetchAllCourses]);

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
      setParents(parentsData || []);
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
      setParents(data || []);
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.message || 'Error al vincular padre');
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

  return (
    <Box minH="100vh" bg="gray.50">
      <DashboardHeader />

      <Box maxW="1200px" mx="auto" p={6}>
        <Heading size="lg" mb={6}>Panel de Administración</Heading>

        <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Usuarios</Tab>
            <Tab>Cursos</Tab>
            <Tab>Alumnos</Tab>
          </TabList>

          <TabPanels>
            {/* ============ USERS TAB ============ */}
            <TabPanel className="tab-panel">
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                mb={4}
                onClick={() => { resetUserForm(); cu.onOpen(); }}
                _active={{ transform: 'scale(0.96)' }}
                transition="transform 120ms ease-out"
              >
                Crear Usuario
              </Button>
              <DataTable columns={userColumns} data={users} loading={usersLoading} actions={userActions} emptyMessage="No hay usuarios registrados" />

              {/* Create User Modal */}
              <Modal isOpen={cu.isOpen} onClose={cu.onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Crear Usuario</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <VStack spacing={4}>
                      <FormControl isRequired isInvalid={!!userErrors.email}>
                        <FormLabel>Email</FormLabel>
                        <Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="correo@ejemplo.com" />
                        <FormErrorMessage>{userErrors.email}</FormErrorMessage>
                      </FormControl>
                      <FormControl isRequired isInvalid={!!userErrors.password}>
                        <FormLabel>Contraseña</FormLabel>
                        <Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
                        <FormErrorMessage>{userErrors.password}</FormErrorMessage>
                      </FormControl>
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
                      <FormControl isRequired>
                        <FormLabel>Rol</FormLabel>
                        <Select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                          <option value="docente">Docente</option>
                          <option value="preceptor">Preceptor/a</option>
                          <option value="padre">Padre/Madre</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Teléfono (WhatsApp)</FormLabel>
                        <Input value={userForm.phone_whatsapp} onChange={(e) => setUserForm({ ...userForm, phone_whatsapp: e.target.value })} placeholder="+54 11 1234-5678" />
                      </FormControl>
                    </VStack>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={cu.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Cancelar</Button>
                    <Button colorScheme="blue" onClick={handleCreateUser} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Crear</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>

              {/* Edit User Modal */}
              <Modal isOpen={eu.isOpen} onClose={eu.onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Editar Usuario</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <VStack spacing={4}>
                      <FormControl isRequired isInvalid={!!userErrors.email}>
                        <FormLabel>Email</FormLabel>
                        <Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                        <FormErrorMessage>{userErrors.email}</FormErrorMessage>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Nueva contraseña (dejar vacío para mantener)</FormLabel>
                        <Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="Solo si deseas cambiarla" />
                      </FormControl>
                      <FormControl isRequired isInvalid={!!userErrors.first_name}>
                        <FormLabel>Nombre</FormLabel>
                        <Input value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} />
                        <FormErrorMessage>{userErrors.first_name}</FormErrorMessage>
                      </FormControl>
                      <FormControl isRequired isInvalid={!!userErrors.last_name}>
                        <FormLabel>Apellido</FormLabel>
                        <Input value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} />
                        <FormErrorMessage>{userErrors.last_name}</FormErrorMessage>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Teléfono (WhatsApp)</FormLabel>
                        <Input value={userForm.phone_whatsapp} onChange={(e) => setUserForm({ ...userForm, phone_whatsapp: e.target.value })} />
                      </FormControl>
                    </VStack>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={eu.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Cancelar</Button>
                    <Button colorScheme="blue" onClick={handleUpdateUser} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Guardar Cambios</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </TabPanel>

            {/* ============ COURSES TAB ============ */}
            <TabPanel>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                mb={4}
                onClick={() => { resetCourseForm(); cc.onOpen(); }}
                _active={{ transform: 'scale(0.96)' }}
                transition="transform 120ms ease-out"
              >
                Crear Curso
              </Button>
              <DataTable columns={courseColumns} data={courses} loading={coursesLoading} actions={courseActions} emptyMessage="No hay cursos registrados" />

              {/* Create Course Modal */}
              <Modal isOpen={cc.isOpen} onClose={cc.onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Crear Curso</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <VStack spacing={4}>
                      <FormControl isRequired isInvalid={!!courseErrors.name}>
                        <FormLabel>Nombre</FormLabel>
                        <Input value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="Ej: 1° A" />
                        <FormErrorMessage>{courseErrors.name}</FormErrorMessage>
                      </FormControl>
                      <FormControl isRequired isInvalid={!!courseErrors.year}>
                        <FormLabel>Año</FormLabel>
                        <Input type="number" value={courseForm.year} onChange={(e) => setCourseForm({ ...courseForm, year: e.target.value })} />
                        <FormErrorMessage>{courseErrors.year}</FormErrorMessage>
                      </FormControl>
                      <FormControl>
                        <FormLabel>División</FormLabel>
                        <Input value={courseForm.division} onChange={(e) => setCourseForm({ ...courseForm, division: e.target.value })} placeholder="Ej: A, B, Única" />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Nivel</FormLabel>
                        <Select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}>
                          <option value="">Seleccionar nivel</option>
                          <option value="Primaria">Primaria</option>
                          <option value="Secundaria">Secundaria</option>
                          <option value="Terciario">Terciario</option>
                        </Select>
                      </FormControl>
                    </VStack>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={cc.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Cancelar</Button>
                    <Button colorScheme="blue" onClick={handleCreateCourse} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Crear</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>

              {/* Edit Course Modal */}
              <Modal isOpen={ec.isOpen} onClose={ec.onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Editar Curso</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <VStack spacing={4}>
                      <FormControl isRequired isInvalid={!!courseErrors.name}>
                        <FormLabel>Nombre</FormLabel>
                        <Input value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} />
                        <FormErrorMessage>{courseErrors.name}</FormErrorMessage>
                      </FormControl>
                      <FormControl isRequired isInvalid={!!courseErrors.year}>
                        <FormLabel>Año</FormLabel>
                        <Input type="number" value={courseForm.year} onChange={(e) => setCourseForm({ ...courseForm, year: e.target.value })} />
                        <FormErrorMessage>{courseErrors.year}</FormErrorMessage>
                      </FormControl>
                      <FormControl>
                        <FormLabel>División</FormLabel>
                        <Input value={courseForm.division} onChange={(e) => setCourseForm({ ...courseForm, division: e.target.value })} />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Nivel</FormLabel>
                        <Select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}>
                          <option value="">Seleccionar nivel</option>
                          <option value="Primaria">Primaria</option>
                          <option value="Secundaria">Secundaria</option>
                          <option value="Terciario">Terciario</option>
                        </Select>
                      </FormControl>
                    </VStack>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={ec.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Cancelar</Button>
                    <Button colorScheme="blue" onClick={handleUpdateCourse} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Guardar Cambios</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>

              {/* Subjects Modal */}
              <Modal isOpen={sc.isOpen} onClose={sc.onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Materias de {viewingCourseSubjects?.name || ''}</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <HStack mb={4}>
                      <Input
                        placeholder="Nombre de la materia"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubject(); }}
                      />
                      <Button colorScheme="green" onClick={handleAddSubject} isDisabled={!newSubjectName.trim()} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">
                        Agregar
                      </Button>
                    </HStack>
                    {subjectsLoading ? (
                      <Skeleton height="40px" borderRadius="md" speed={0.8} />
                    ) : subjects.length === 0 ? (
                      <Box textAlign="center" py={6} border="1px dashed" borderColor="gray.300" borderRadius="md">
                        <Text color="gray.500">Este curso no tiene materias aún.</Text>
                        <Text fontSize="sm" color="gray.400" mt={1}>Agregá una materia usando el campo de arriba.</Text>
                      </Box>
                    ) : (
                      subjects.map((s) => (
                        <Box key={s.id} p={3} borderBottom="1px" borderColor="gray.100" _hover={{ bg: 'gray.50', transition: 'background-color 160ms ease-out' }}>
                          <Text fontSize="sm">{s.name}</Text>
                        </Box>
                      ))
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <Button onClick={sc.onClose} _active={{ transform: 'scale(0.96)' }} transition="transform 120ms ease-out">Cerrar</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </TabPanel>

            {/* ============ STUDENTS TAB ============ */}
            <TabPanel>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                mb={4}
                onClick={() => { resetStudentForm(); cs.onOpen(); }}
                _active={{ transform: 'scale(0.96)' }}
                transition="transform 120ms ease-out"
              >
                Crear Alumno
              </Button>
              <DataTable columns={studentColumns} data={students} loading={studentsLoading} actions={studentActions} emptyMessage="No hay alumnos registrados" />

              {/* Create Student Modal */}
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
                          {allCourses.map((c) => (
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

              {/* Edit Student Modal */}
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
                          {allCourses.map((c) => (
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

              {/* Parents Modal */}
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
                    ) : parents.length === 0 ? (
                      <Box textAlign="center" py={6} border="1px dashed" borderColor="gray.300" borderRadius="md">
                        <Text color="gray.500">Este alumno no tiene padres vinculados.</Text>
                        <Text fontSize="sm" color="gray.400" mt={1}>Seleccioná un padre/madre de la lista y hacé clic en Vincular.</Text>
                      </Box>
                    ) : (
                      parents.map((p) => (
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
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Delete Confirmation Dialog */}
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
              {deleteType === 'user' && deleteTarget && (
                <Text>
                  ¿Estás seguro de eliminar permanentemente a <strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong>?
                  <Text as="div" mt={2} fontSize="sm" color="red.500">
                    Esta acción no se puede deshacer. Se eliminarán todas las referencias (vínculos parentales, asignaciones docentes).
                  </Text>
                </Text>
              )}
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

        <Box as="style" display="none">
          {`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .chakra-tabs__tab-panel {
              animation: fadeSlideIn 200ms ease-out both;
            }
          `}
        </Box>
      </Box>
    </Box>
  );
}
