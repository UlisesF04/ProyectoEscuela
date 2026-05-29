import {
  Box, Heading, Select, Button, HStack, FormControl, FormLabel,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, useToast, IconButton, Table, Thead, Tbody, Tr, Th, Td,
  TableContainer,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { FiSave, FiCheck } from 'react-icons/fi';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { gradesService } from '../../services/gradesService';
import { teacherService } from '../../services/teacherService';

const PERIODS = ['1er Trimestre', '2do Trimestre', '3er Trimestre', 'Recuperatorio'];
const TYPES = ['Examen', 'Trabajo', 'Tarea', 'Oral', 'Otro'];

export default function GradesPage() {
  const toast = useToast();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [period, setPeriod] = useState(PERIODS[0]);
  const [gradeType, setGradeType] = useState(TYPES[0]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [error, setError] = useState(null);
  const [savingRow, setSavingRow] = useState(null);
  const [dirtyValues, setDirtyValues] = useState({});

  const fetchSubjects = useCallback(() => {
    setLoading(true);
    setError(null);
    teacherService.getMyCourses()
      .then((res) => {
        const data = res.data || res || [];
        setSubjects(data);
        if (data.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(data[0].id?.toString() || '');
        }
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSubjects(); }, []);

  useEffect(() => {
    if (!selectedSubjectId) return;
    setLoadingGrades(true);
    setDirtyValues({});
    gradesService.getSubjectGrades(selectedSubjectId)
      .then((res) => {
        const data = res.data || res || [];
        setGrades(data);
      })
      .catch(() => {
        setGrades([]);
        toast({ title: 'Error', description: 'No se pudieron cargar las calificaciones', status: 'error', duration: 3000, isClosable: true, position: 'top-right' });
      })
      .finally(() => setLoadingGrades(false));
  }, [selectedSubjectId]);

  const handleGradeChange = (studentId, value) => {
    setDirtyValues((prev) => ({ ...prev, [studentId]: value }));
  };

  const getGradeValue = (student) => {
    if (dirtyValues[student.id] !== undefined) return dirtyValues[student.id];
    return student.grade ?? '';
  };

  const isValidGrade = (val) => {
    if (val === '' || val === undefined || val === null) return false;
    const n = parseFloat(val);
    return !isNaN(n) && n >= 0 && n <= 10;
  };

  const getGradeError = (student) => {
    const val = getGradeValue(student);
    if (val === '' || val === undefined || val === null) return false;
    const n = parseFloat(val);
    return isNaN(n) || n < 0 || n > 10;
  };

  const buildPayload = (student, val) => ({
    student_id: student.student_id || student.id,
    subject_id: parseInt(selectedSubjectId),
    grade: parseFloat(val),
    period,
    type: gradeType,
  });

  const saveGrade = async (student) => {
    const val = getGradeValue(student);
    if (!isValidGrade(val)) return;
    setSavingRow(student.id);
    try {
      const payload = buildPayload(student, val);
      if (student.grade_id || student.id_grade) {
        await gradesService.updateGrade(student.grade_id || student.id_grade, payload);
      } else {
        await gradesService.createGrade(payload);
      }
      setDirtyValues((prev) => {
        const next = { ...prev };
        delete next[student.id];
        return next;
      });
      setGrades((prev) =>
        prev.map((g) =>
          g.id === student.id ? { ...g, grade: parseFloat(val), grade_id: g.grade_id || 'saved' } : g
        )
      );
      toast({ title: 'Nota guardada', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'No se pudo guardar', status: 'error', duration: 3000, isClosable: true, position: 'top-right' });
    } finally {
      setSavingRow(null);
    }
  };

  const saveAll = async () => {
    const keys = Object.keys(dirtyValues);
    if (keys.length === 0) {
      toast({ title: 'Sin cambios', description: 'No hay notas pendientes por guardar', status: 'info', duration: 2000, isClosable: true, position: 'top-right' });
      return;
    }
    const invalid = keys.filter((k) => !isValidGrade(dirtyValues[k]));
    if (invalid.length > 0) {
      toast({ title: 'Notas inválidas', description: 'Corrija los valores resaltados antes de guardar', status: 'warning', duration: 3000, isClosable: true, position: 'top-right' });
      return;
    }
    setSavingBatch(true);
    let saved = 0;
    let failed = 0;
    for (const studentId of keys) {
      const student = grades.find((g) => g.id === parseInt(studentId));
      if (!student) continue;
      try {
        const payload = buildPayload(student, dirtyValues[studentId]);
        if (student.grade_id || student.id_grade) {
          await gradesService.updateGrade(student.grade_id || student.id_grade, payload);
        } else {
          await gradesService.createGrade(payload);
        }
        saved++;
      } catch {
        failed++;
      }
    }
    setDirtyValues({});
    if (failed > 0) {
      toast({ title: `Guardadas ${saved}, fallaron ${failed}`, status: 'warning', duration: 3000, isClosable: true, position: 'top-right' });
    } else {
      toast({ title: `Todas las notas guardadas (${saved})`, status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
    }
    setSavingBatch(false);
    setLoadingGrades(true);
    gradesService.getSubjectGrades(selectedSubjectId)
      .then((res) => setGrades(res.data || res || []))
      .catch(() => {})
      .finally(() => setLoadingGrades(false));
  };

  if (loading) return <LoadingSkeleton variant="text" rows={5} />;

  if (!subjects || subjects.length === 0) {
    return (
      <Box>
        <Heading as="h1" size="lg" mb={6} fontFamily="heading">Calificaciones</Heading>
        <EmptyState
          title="No tiene materias asignadas"
          description="Contacte al administrador."
        />
      </Box>
    );
  }

  const hasDirty = Object.keys(dirtyValues).length > 0;

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchSubjects} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">Calificaciones</Heading>

      <HStack spacing={4} mb={6} flexWrap="wrap">
        <FormControl w="220px">
          <FormLabel fontSize="sm" color="onSurfaceVariant">Materia</FormLabel>
          <Select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} borderRadius="input">
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl w="180px">
          <FormLabel fontSize="sm" color="onSurfaceVariant">Periodo</FormLabel>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} borderRadius="input">
            {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </FormControl>
        <FormControl w="160px">
          <FormLabel fontSize="sm" color="onSurfaceVariant">Tipo</FormLabel>
          <Select value={gradeType} onChange={(e) => setGradeType(e.target.value)} borderRadius="input">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormControl>
      </HStack>

      {loadingGrades ? (
        <LoadingSkeleton variant="table" rows={5} columns={3} />
      ) : grades.length === 0 ? (
        <EmptyState title="No hay alumnos en esta materia" description="Asigne alumnos a la materia desde el panel de administración." />
      ) : (
        <Box>
          <Box borderRadius="card" border="1px solid" borderColor="outlineVariant" overflow="hidden" bg="white" boxShadow="warmSm">
            <TableContainer>
              <Table variant="simple">
                <Thead bg="containerLow">
                  <Tr>
                    <Th fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="onSurfaceVariant" py={4}>Alumno</Th>
                    <Th fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="onSurfaceVariant" py={4}>Nota</Th>
                    <Th fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="onSurfaceVariant" py={4} w="80px">Acción</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {grades.map((student, idx) => {
                    const val = getGradeValue(student);
                    const isInvalid = getGradeError(student);
                    const isDirty = dirtyValues[student.id] !== undefined;
                    const isSaving = savingRow === student.id;
                    return (
                      <Tr
                        key={student.id}
                        _hover={{ bg: 'containerLow', transition: 'background-color 160ms ease-out' }}
                        sx={{ animation: 'fadeSlideIn 300ms ease-out both', animationDelay: `${idx * 30}ms` }}
                      >
                        <Td py={3} fontSize="sm">
                          {`${student.first_name || ''} ${student.last_name || ''}`.trim() || student.student_name || '—'}
                        </Td>
                        <Td py={3}>
                          <NumberInput
                            value={val}
                            onChange={(v) => handleGradeChange(student.id, v)}
                            min={0} max={10} step={0.01} precision={2}
                            keepWithinRange={false} clampValueOnBlur
                            size="sm" w="120px"
                          >
                            <NumberInputField
                              borderRadius="input"
                              borderColor={isInvalid ? 'error' : isDirty ? 'primary' : 'outlineVariant'}
                              _focus={{ borderColor: 'primary', boxShadow: 'outline' }}
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                          {isInvalid && (
                            <Box as="span" fontSize="xs" color="error" mt={1}>Debe estar entre 0 y 10</Box>
                          )}
                        </Td>
                        <Td py={3}>
                          <IconButton
                            icon={isSaving ? <FiSave /> : <FiCheck />}
                            size="sm"
                            variant="ghost"
                            colorScheme={isDirty ? 'brand' : 'gray'}
                            borderRadius="pill"
                            isDisabled={!isDirty || isInvalid || isSaving}
                            isLoading={isSaving}
                            onClick={() => saveGrade(student)}
                            minW="44px" minH="44px"
                            _active={{ transform: 'scale(0.96)' }}
                            transition="transform 120ms ease-out"
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>

          {hasDirty && (
            <Button
              mt={4}
              leftIcon={<FiSave />}
              onClick={saveAll}
              isLoading={savingBatch}
              loadingText="Guardando..."
              colorScheme="brand"
            >
              Guardar todas ({Object.keys(dirtyValues).length})
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
