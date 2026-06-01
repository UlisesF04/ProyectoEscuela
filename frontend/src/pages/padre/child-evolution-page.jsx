import { useState, useEffect } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import ChildSelector from '../../components/ChildSelector';
import GradeEvolutionView from '../../components/grade-evolution-view';
import { parentService } from '../../services/parentService';
import { gradesService } from '../../services/gradesService';

export default function ChildEvolutionPage() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const [error, setError] = useState(null);

  // Load children on mount
  useEffect(() => {
    let mounted = true;
    setLoadingChildren(true);
    parentService
      .getMyChildren()
      .then((data) => {
        if (!mounted) return;
        const list = data || [];
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0]);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (mounted) setLoadingChildren(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Load evolution when selected child changes
  useEffect(() => {
    if (!selectedChild) return;
    let mounted = true;
    setLoadingEvolution(true);
    setError(null);
    setEvolution(null);
    gradesService
      .getStudentEvolution(selectedChild.id)
      .then((data) => {
        if (!mounted) return;
        setEvolution(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (mounted) setLoadingEvolution(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedChild]);

  const handleRetry = () => {
    if (!selectedChild) return;
    setError(null);
    setLoadingEvolution(true);
    setEvolution(null);
    gradesService
      .getStudentEvolution(selectedChild.id)
      .then((data) => setEvolution(data))
      .catch((err) => setError(err))
      .finally(() => setLoadingEvolution(false));
  };

  return (
    <Box>
      <Box mb={6}>
        <Heading
          as="h1"
          fontSize={{ base: '2xl', md: '3xl' }}
          color="onSurface"
          fontWeight={700}
          mb={1}
        >
          Evolución académica
        </Heading>
        <Text color="onSurfaceVariant" fontSize="sm">
          Seguimiento de calificaciones por materia a lo largo del tiempo.
        </Text>
      </Box>

      {loadingChildren ? null : (
        <ChildSelector
          children={children}
          selectedChild={selectedChild}
          onChange={setSelectedChild}
        />
      )}

      <GradeEvolutionView
        data={evolution}
        loading={loadingEvolution}
        error={error}
        onRetry={handleRetry}
      />
    </Box>
  );
}
