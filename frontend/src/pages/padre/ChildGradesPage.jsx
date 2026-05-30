import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Badge,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import ChildSelector from '../../components/ChildSelector';
import { parentService } from '../../services/parentService';
import { gradesService } from '../../services/gradesService';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorAlert from '../../components/ErrorAlert';
import DataTable from '../../components/DataTable';

function getGradeColor(value) {
  if (value === undefined || value === null) return 'onSurfaceVariant';
  if (value >= 7) return 'success';
  if (value >= 4) return 'yellow.500';
  return 'error';
}

export default function ChildGradesPage() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [grades, setGrades] = useState([]);
  const [promedios, setPromedios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    gradesService.getStudentGrades(selectedChild.id)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.grades || data?.records || [];
        setGrades(list);
        const subjects = {};
        list.forEach((g) => {
          const name = g.Subject?.name || g.subject_name || 'General';
          if (!subjects[name]) subjects[name] = { total: 0, count: 0 };
          subjects[name].total += Number(g.grade || 0);
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
  }, [selectedChild]);

  const hasLowGrades = grades.some((g) => (g.grade ?? 10) < 4);

  const columns = [
    {
      key: 'materia',
      label: 'Materia',
      render: (item) => (
        <Text fontWeight={500}>
          {item.Subject?.name || item.subject_name || '—'}
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
          {item.type || item.assessment_type || '—'}
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

      <ErrorAlert error={error} />

      <ChildSelector
        children={children}
        selectedChild={selectedChild}
        onChange={setSelectedChild}
      />

      {hasLowGrades && selectedChild && (
        <Box bg="error" bgOpacity={0.1} p={4} borderRadius="md" mb={4}>
          <Text fontWeight={600} color="error">
            Se detectaron calificaciones bajas
          </Text>
        </Box>
      )}

      {promedios.length > 0 && (
        <Box p={4} mb={4} borderRadius="card" bg="containerLow" boxShadow="warmSm">
          <Text fontWeight={600} mb={2} fontSize="sm" color="onSurfaceVariant">
            Promedios por materia
          </Text>
          <HStack spacing={4} flexWrap="wrap">
            {promedios.map((p) => (
              <Box key={p.name} textAlign="center">
                <Text fontSize="xs" color="onSurfaceVariant">{p.name}</Text>
                <Text fontSize="lg" fontWeight={700} color={getGradeColor(Number(p.promedio))}>
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
        emptyMessage="No hay calificaciones registradas"
      />
    </Box>
  );
}
