import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Badge,
  Text,
  VStack,
  HStack,
  Select,
  SimpleGrid,
} from '@chakra-ui/react';
import ChildSelector from '../../components/ChildSelector';
import { parentService } from '../../services/parentService';
import { gradesService } from '../../services/gradesService';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import DataTable from '../../components/DataTable';

const GRADE_TYPE_LABELS = {
  examen: 'Examen',
  trabajo: 'Trabajo Práctico',
  tarea: 'Tarea',
  oral: 'Oral',
  otro: 'Otro',
};

const TYPE_OPTIONS = ['examen', 'trabajo', 'tarea', 'oral', 'otro'];

const PERIOD_OPTIONS = [
  { value: '1', label: '1er trimestre (Mar-May)' },
  { value: '2', label: '2do trimestre (Jun-Ago)' },
  { value: '3', label: '3er trimestre (Sep-Dic)' },
];

function getGradeColor(value) {
  if (value === undefined || value === null) return 'onSurfaceVariant';
  if (value >= 7) return 'success';
  if (value >= 4) return 'yellow.500';
  return 'error';
}

function getPeriodFromDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const month = d.getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return '1';
  if (month >= 6 && month <= 8) return '2';
  if (month >= 9 && month <= 12) return '3';
  return null; // fuera del año lectivo (Ene-Feb)
}

function getSubjectName(g) {
  return g.Subject?.name || g.subject_name || 'General';
}

export default function ChildGradesPage() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter state (client-side, all default to "Todos")
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  useEffect(() => {
    parentService.getMyChildren()
      .then((data) => {
        setChildren(data || []);
        if (data && data.length > 0) setSelectedChild(data[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    setError(null);
    // Reset filters when switching child
    setSubjectFilter('all');
    setTypeFilter('all');
    setPeriodFilter('all');
    gradesService.getStudentGrades(selectedChild.id)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.grades || data?.records || [];
        setGrades(list);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  // Derive available subjects from the loaded grades (alphabetical)
  const availableSubjects = useMemo(() => {
    const names = new Set();
    grades.forEach((g) => {
      const n = getSubjectName(g);
      if (n && n !== 'General') names.add(n);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'es-AR'));
  }, [grades]);

  // Apply filters client-side
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      if (subjectFilter !== 'all') {
        if (getSubjectName(g) !== subjectFilter) return false;
      }
      if (typeFilter !== 'all' && g.type !== typeFilter) return false;
      if (periodFilter !== 'all') {
        const p = getPeriodFromDate(g.date || g.created_at);
        if (p !== periodFilter) return false;
      }
      return true;
    });
  }, [grades, subjectFilter, typeFilter, periodFilter]);

  // Per-subject averages from the filtered list
  const promedios = useMemo(() => {
    if (filteredGrades.length === 0) return [];
    const subjects = {};
    filteredGrades.forEach((g) => {
      const name = getSubjectName(g);
      if (!subjects[name]) subjects[name] = { total: 0, count: 0 };
      subjects[name].total += Number(g.grade || 0);
      subjects[name].count += 1;
    });
    return Object.entries(subjects)
      .map(([name, vals]) => ({
        name,
        promedio: vals.count > 0 ? (vals.total / vals.count).toFixed(1) : '—',
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es-AR'));
  }, [filteredGrades]);

  const hasLowGrades = filteredGrades.some((g) => (g.grade ?? 10) < 4);

  const filtersActive =
    subjectFilter !== 'all' || typeFilter !== 'all' || periodFilter !== 'all';

  const handleClearFilters = () => {
    setSubjectFilter('all');
    setTypeFilter('all');
    setPeriodFilter('all');
  };

  const columns = [
    {
      key: 'materia',
      label: 'Materia',
      render: (item) => (
        <Text fontWeight={500}>
          {getSubjectName(item)}
        </Text>
      ),
    },
    {
      key: 'nota',
      label: 'Nota',
      render: (item) => {
        const val = item.grade;
        return (
          <Badge
            variant="subtle"
            colorScheme={
              val !== null && val !== undefined
                ? val >= 7 ? 'green' : val >= 4 ? 'yellow' : 'red'
                : 'gray'
            }
            fontSize="md"
            px={3}
            py={1}
          >
            {val !== undefined && val !== null ? val : '—'}
          </Badge>
        );
      },
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (item) => (
        <Text color="onSurfaceVariant">
          {GRADE_TYPE_LABELS[item.type] || item.type || '—'}
        </Text>
      ),
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (item) => {
        const d = item.date || item.created_at;
        return d ? new Date(d).toLocaleDateString('es-AR') : '—';
      },
    },
  ];

  return (
    <Box>
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Calificaciones
      </Heading>

      <ChildSelector
        children={children}
        selectedChild={selectedChild}
        onChange={setSelectedChild}
      />

      {loading ? (
        <LoadingSkeleton variant="table" rows={6} columns={4} />
      ) : (
        <>
          {hasLowGrades && selectedChild && (
            <Box bg="error" bgOpacity={0.1} p={4} borderRadius="md" mb={4}>
              <Text fontWeight={600} color="error">
                Se detectaron calificaciones bajas
                {filtersActive ? ' con los filtros aplicados' : ''}
              </Text>
            </Box>
          )}

          {/* Filter bar */}
          {grades.length > 0 && (
            <Box
              mb={4}
              p={{ base: 3, md: 4 }}
              borderRadius="card"
              bg="containerLow"
              boxShadow="warmSm"
              border="1px solid"
              borderColor="outlineVariant"
            >
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={filtersActive ? 3 : 0}>
                <Box>
                  <Text
                    as="label"
                    htmlFor="filter-materia"
                    fontSize="xs"
                    color="onSurfaceVariant"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    mb={1.5}
                    display="block"
                  >
                    Materia
                  </Text>
                  <Select
                    id="filter-materia"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    borderRadius="input"
                    bg="white"
                    isDisabled={availableSubjects.length === 0}
                  >
                    <option value="all">Todas</option>
                    {availableSubjects.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text
                    as="label"
                    htmlFor="filter-tipo"
                    fontSize="xs"
                    color="onSurfaceVariant"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    mb={1.5}
                    display="block"
                  >
                    Tipo de nota
                  </Text>
                  <Select
                    id="filter-tipo"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    borderRadius="input"
                    bg="white"
                  >
                    <option value="all">Todos</option>
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {GRADE_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text
                    as="label"
                    htmlFor="filter-periodo"
                    fontSize="xs"
                    color="onSurfaceVariant"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                    mb={1.5}
                    display="block"
                  >
                    Periodo
                  </Text>
                  <Select
                    id="filter-periodo"
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value)}
                    borderRadius="input"
                    bg="white"
                  >
                    <option value="all">Todos</option>
                    {PERIOD_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </Box>
              </SimpleGrid>

              {filtersActive && (
                <HStack
                  justify="space-between"
                  fontSize="sm"
                  color="onSurfaceVariant"
                  pt={1}
                >
                  <Text>
                    Mostrando {filteredGrades.length} de {grades.length} calificaciones
                  </Text>
                  <Box
                    as="button"
                    type="button"
                    onClick={handleClearFilters}
                    color="primary"
                    fontWeight={600}
                    transition="opacity 160ms ease-out"
                    _hover={{ opacity: 0.75 }}
                    _active={{ transform: 'scale(0.97)' }}
                  >
                    Limpiar filtros
                  </Box>
                </HStack>
              )}
            </Box>
          )}

          {/* Per-subject averages card (only if there are filtered grades) */}
          {promedios.length > 0 && (
            <Box
              p={4}
              mb={4}
              borderRadius="card"
              bg="containerLow"
              boxShadow="warmSm"
              border="1px solid"
              borderColor="outlineVariant"
            >
              <Text
                fontWeight={600}
                mb={3}
                fontSize="sm"
                color="onSurfaceVariant"
                textTransform="uppercase"
                letterSpacing="0.06em"
              >
                Promedios por materia
              </Text>
              <HStack spacing={6} flexWrap="wrap">
                {promedios.map((p) => (
                  <VStack key={p.name} align="flex-start" spacing={0}>
                    <Text fontSize="xs" color="onSurfaceVariant">
                      {p.name}
                    </Text>
                    <Text
                      fontSize="2xl"
                      fontWeight={700}
                      color={getGradeColor(Number(p.promedio))}
                      lineHeight="1"
                    >
                      {p.promedio}
                    </Text>
                  </VStack>
                ))}
              </HStack>
            </Box>
          )}

          <DataTable
            columns={columns}
            data={filteredGrades}
            loading={false}
            emptyMessage={
              filtersActive
                ? 'No hay calificaciones con esos filtros'
                : 'No hay calificaciones registradas'
            }
            emptyDescription={
              filtersActive
                ? 'Probá cambiar o limpiar los filtros para ver más resultados.'
                : 'Cuando se registren calificaciones para este estudiante, las vas a ver acá.'
            }
          />
        </>
      )}
    </Box>
  );
}
