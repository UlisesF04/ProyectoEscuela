import {
  Box, Heading, Button, HStack, VStack, Badge,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, FormControl, FormLabel, FormErrorMessage,
  Input, useToast, Text, Divider, Spinner, Center, Flex,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiBookOpen, FiBook, FiX } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import CustomSelect from '../../components/CustomSelect';
import { adminService } from '../../services/adminService';

const emptyForm = { name: '', year: '', division: '', level: '' };

const LEVEL_OPTIONS = [
  { value: 'primaria', label: 'Primaria' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'inicial', label: 'Inicial' },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState(emptyForm);

  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [subjectsCourse, setSubjectsCourse] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);

  const toast = useToast();
  const initialRef = useRef();

  const fetchCourses = () => {
    setLoading(true);
    setError(null);
    adminService.getCourses()
      .then((data) => setCourses(data || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const validate = (data) => {
    const errors = {};
    if (!data.name?.trim()) errors.name = 'El nombre es obligatorio';
    if (!data.year?.toString().trim()) errors.year = 'El año es obligatorio';
    else if (isNaN(Number(data.year)) || Number(data.year) < 1900 || Number(data.year) > 2100) errors.year = 'Año inválido (1900-2100)';
    if (!data.division?.trim()) errors.division = 'La división es obligatoria';
    if (!data.level?.trim()) errors.level = 'El nivel es obligatorio';
    return errors;
  };

  const handleCreate = async () => {
    const errors = validate(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      await adminService.createCourse({
        name: formData.name.trim(),
        year: Number(formData.year),
        division: formData.division.trim(),
        level: formData.level,
      });
      toast({ title: 'Curso creado', description: 'El curso fue creado exitosamente.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setCreateOpen(false);
      setFormData(emptyForm);
      setFormErrors({});
      fetchCourses();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setEditFormData({
      name: course.name || '',
      year: course.year?.toString() || '',
      division: course.division || '',
      level: course.level || '',
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
      await adminService.updateCourse(editingCourse.id, {
        name: editFormData.name.trim(),
        year: Number(editFormData.year),
        division: editFormData.division.trim(),
        level: editFormData.level,
      });
      toast({ title: 'Curso actualizado', description: 'Los cambios fueron guardados.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setEditOpen(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    } finally {
      setSubmitting(false);
    }
  };

  const openSubjectsModal = async (course) => {
    setSubjectsCourse(course);
    setSubjectsOpen(true);
    setSubjectsLoading(true);
    setNewSubjectName('');
    try {
      const data = await adminService.getSubjects(course.id);
      setSubjects(data || []);
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
      setSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !subjectsCourse) return;
    setAddingSubject(true);
    try {
      await adminService.createSubject(subjectsCourse.id, { name: newSubjectName.trim() });
      toast({ title: 'Materia agregada', description: 'La materia fue creada exitosamente.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      setNewSubjectName('');
      const data = await adminService.getSubjects(subjectsCourse.id);
      setSubjects(data || []);
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    } finally {
      setAddingSubject(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`¿Eliminar el curso "${course.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await adminService.deleteCourse(course.id);
      toast({ title: 'Curso eliminado', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
      fetchCourses();
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || err.message, status: 'error', duration: 5000, isClosable: true, position: 'top-right' });
    }
  };

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'year', label: 'Año' },
    { key: 'division', label: 'División' },
    { key: 'level', label: 'Nivel', render: (c) => (
      <Badge variant="subtle" colorScheme="brand" textTransform="capitalize">
        {c.level}
      </Badge>
    ) },
    {
      key: 'subjects_count',
      label: 'Materias',
      render: (c) => (
        <Badge variant="subtle" colorScheme="blue">
          {c.subjects_count ?? 0} materias
        </Badge>
      ),
    },
  ];

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchCourses} />
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Heading as="h1" size="lg" fontFamily="heading">
          Cursos
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => { setFormData(emptyForm); setFormErrors({}); setCreateOpen(true); }}
        >
          Crear Curso
        </Button>
      </Flex>

      <DataTable
        columns={columns}
        data={courses}
        loading={loading}
        emptyMessage="No hay cursos registrados"
        emptyDescription="Cree el primer curso usando el botón superior."
        emptyAction={
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={() => { setFormData(emptyForm); setFormErrors({}); setCreateOpen(true); }}
          >
            Crear Curso
          </Button>
        }
        actions={(course) => [
          { label: 'Editar', icon: FiEdit2, onClick: () => openEditModal(course), variant: 'ghost' },
          { label: 'Ver Materias', icon: FiBookOpen, onClick: () => openSubjectsModal(course), colorScheme: 'brand', variant: 'outline' },
        ]}
      />

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside" closeOnOverlayClick={!submitting}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">Crear Curso</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!formErrors.name}>
                <FormLabel fontSize="sm">Nombre</FormLabel>
                <Input
                  ref={initialRef}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="1° A"
                  bg="white"
                />
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              </FormControl>
              <HStack spacing={4} w="full">
                <FormControl isInvalid={!!formErrors.year}>
                  <FormLabel fontSize="sm">Año</FormLabel>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2026"
                    bg="white"
                  />
                  <FormErrorMessage>{formErrors.year}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!formErrors.division}>
                  <FormLabel fontSize="sm">División</FormLabel>
                  <Input
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    placeholder="A"
                    bg="white"
                  />
                  <FormErrorMessage>{formErrors.division}</FormErrorMessage>
                </FormControl>
              </HStack>
              <FormControl isInvalid={!!formErrors.level}>
                <FormLabel fontSize="sm">Nivel</FormLabel>
                <CustomSelect
                  value={formData.level}
                  onChange={(val) => setFormData({ ...formData, level: val })}
                  placeholder="Seleccionar nivel"
                >
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </CustomSelect>
                <FormErrorMessage>{formErrors.level}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setCreateOpen(false)} isDisabled={submitting}>
              Cancelar
            </Button>
            <Button colorScheme="brand" onClick={handleCreate} isLoading={submitting}>
              Crear Curso
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside" closeOnOverlayClick={!submitting}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">Editar Curso</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isInvalid={!!formErrors.name}>
                <FormLabel fontSize="sm">Nombre</FormLabel>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  bg="white"
                />
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              </FormControl>
              <HStack spacing={4} w="full">
                <FormControl isInvalid={!!formErrors.year}>
                  <FormLabel fontSize="sm">Año</FormLabel>
                  <Input
                    type="number"
                    value={editFormData.year}
                    onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                    bg="white"
                  />
                  <FormErrorMessage>{formErrors.year}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={!!formErrors.division}>
                  <FormLabel fontSize="sm">División</FormLabel>
                  <Input
                    value={editFormData.division}
                    onChange={(e) => setEditFormData({ ...editFormData, division: e.target.value })}
                    bg="white"
                  />
                  <FormErrorMessage>{formErrors.division}</FormErrorMessage>
                </FormControl>
              </HStack>
              <FormControl isInvalid={!!formErrors.level}>
                <FormLabel fontSize="sm">Nivel</FormLabel>
                <CustomSelect
                  value={editFormData.level}
                  onChange={(val) => setEditFormData({ ...editFormData, level: val })}
                >
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </CustomSelect>
                <FormErrorMessage>{formErrors.level}</FormErrorMessage>
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

      {/* Subjects Modal */}
      <Modal isOpen={subjectsOpen} onClose={() => setSubjectsOpen(false)} size={{ base: 'full', md: 'md', lg: 'lg' }} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">
            Materias — {subjectsCourse?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {subjectsLoading ? (
              <Center py={8}>
                <Spinner color="primary" size="lg" />
              </Center>
            ) : subjects.length === 0 ? (
              <Text color="onSurfaceVariant" textAlign="center" py={6}>
                No hay materias registradas para este curso.
              </Text>
            ) : (
              <VStack spacing={2} align="stretch" mb={4}>
                {subjects.map((subject, idx) => (
                  <Flex
                    key={subject.id}
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
                      <Box as={FiBook} color="primary" />
                      <Text fontWeight={500}>{subject.name}</Text>
                    </HStack>
                  </Flex>
                ))}
              </VStack>
            )}

            <Divider my={4} />

            <Text fontWeight={600} fontSize="sm" mb={3}>Agregar Materia</Text>
            <HStack spacing={3}>
              <Input
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Nombre de la materia"
                bg="white"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubject(); }}
              />
              <Button
                colorScheme="brand"
                onClick={handleAddSubject}
                isLoading={addingSubject}
                isDisabled={!newSubjectName.trim()}
                leftIcon={<FiPlus />}
              >
                Agregar
              </Button>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setSubjectsOpen(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
