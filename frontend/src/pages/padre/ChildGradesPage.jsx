import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';
import ChildSelector from '../../components/ChildSelector';
import { parentService } from '../../services/parentService';
import { gradesService } from '../../services/gradesService';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorAlert from '../../components/ErrorAlert';
import DataTable from '../../components/DataTable';

const periods = [
  { value: '1', label: '1er Trimestre' },
  { value: '2', label: '2do Trimestre' },
  { value: '3', label: '3er Trimestre' },
];

function getGradeColor(value) {
  if (value === undefined || value === null) return 'onSurfaceVariant';
  if (value >= 7) return 'success';
  if (value >= 4) return 'yellow.500';
  return 'error';
}

export default function ChildGradesPage() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [period, setPeriod] = useState('1');
  const [grades, setGrades] = useState([]);
  const [promedios, setPromedios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    parentService.getMyChildren()
      .then(setChildren)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    setError(null);
    gradesService.getStudentGrades(selectedChild.id, { period })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.grades || data?.records || [];
        setGrades(list);
        const subjects = {};
        list.forEach((g) => {
          const name = g.materia || g.subject_name || g.subject?.name || 'General';
          if (!subjects[name]) subjects[name] = { total: 0, count: 0 };
          subjects[name].total += Number(g.nota || g.grade || g.score || 0);
          subjects[name].count += 1;
        });
        setPromedios(
          Object.entries(subjects).map(([name, vals]) => ({
            name,
            promedio: (vals.total / vals.count).toFixed(1),
          }))
        );
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [selectedChild, period]);

  const hasLowGrades = grades.some(
    (g) => (g.nota ?? g.grade ?? g.score ?? 10) < 4
  );

  const columns = [
    {
      key: 'materia',
      label: 'Materia',
      render: (item) => (
        <Text fontWeight={500}>
          {item.materia || item.subject_name || item.subject?.name || '—'}
        </Text>
      ),
    },
    {
      key: 'nota',
      label: 'Nota',
      render: (item) => {
        const val = item.nota ?? item.grade ?? item.score;
        return (
          <Badge
            variant="subtle"
            colorScheme={
              val >= 7 ? 'green' : val >= 4 ? 'yellow' : 'red'
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
          {item.tipo || item.type || item.assessment_type || '—'}
        </Text>
      ),
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (item) => (
        <Text noOfLines={2}>
          {item.descripcion || item.description || '—'}
        </Text>
      ),
    },
    {
      key: 'fecha',
      label: 'Fecha',
      render: (item) => {
        const d = item.fecha || item.date || item.created_at;
        return d ? new Date(d).toLocaleDateString('es-AR') : '—';
      },
    },
  ];

  if (!selectedChild && children.length > 0 && !selectedChild) {
    setSelectedChild(children[0]);
  }

  return (
    <Box>
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Calificaciones
      </Heading>

      <ErrorAlert error={error} />

      <ChildSelector
        children={children}
        selectedChild={selectedChild}
        onChange={setSelectedChild}
      />

      {selectedChild && (
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          mb={6}
          maxW="250px"
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
      )}

      {hasLowGrades && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Calificaciones bajas</AlertTitle>
            <AlertDescription>
              Se detectaron calificaciones bajas
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {promedios.length > 0 && (
        <Box
          p={4}
          mb={4}
          borderRadius="card"
          bg="containerLow"
          boxShadow="warmSm"
        >
          <Text fontWeight={600} mb={2} fontSize="sm" color="onSurfaceVariant">
            Promedios por materia
          </Text>
          <HStack spacing={4} flexWrap="wrap">
            {promedios.map((p) => (
              <Box key={p.name} textAlign="center">
                <Text fontSize="xs" color="onSurfaceVariant">
                  {p.name}
                </Text>
                <Text
                  fontSize="lg"
                  fontWeight={700}
                  color={getGradeColor(Number(p.promedio))}
                >
                  {p.promedio}
                </Text>
              </Box>
            ))}
          </HStack>
        </Box>
      )}

      <DataTable
        columns={columns}
        data={grades}
        loading={loading}
        emptyMessage="No hay calificaciones registradas para este período"
      />
    </Box>
  );
}
