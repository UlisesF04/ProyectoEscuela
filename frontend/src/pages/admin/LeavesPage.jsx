import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  TableContainer, Badge, Button, useToast, Flex,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { FiDownload } from 'react-icons/fi';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { licencesService } from '../../services/licencesService';
import api from '../../services/api';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

async function handleDownload(id, fileName, toast) {
  try {
    const response = await licencesService.download(id);
    const contentType = response.headers['content-type'];
    if (!contentType || (!contentType.startsWith('application/') && !contentType.startsWith('image/'))) {
      throw new Error('Tipo de archivo inesperado');
    }
    const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'licencia';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch {
    toast({
      title: 'Error al descargar',
      description: 'No se pudo descargar el archivo',
      status: 'error', duration: 3000, isClosable: true, position: 'top-right',
    });
  }
}

export default function LeavesPage() {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchLicences = useCallback(() => {
    setLoading(true);
    setError(null);
    licencesService.getAllForAdmin()
      .then((data) => setLicences(Array.isArray(data) ? data : []))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLicences(); }, [fetchLicences]);
  useEffect(() => {
    api.post('/admin/stats/page-visit', { page: '/admin/leaves' }).catch(() => {});
  }, []);

  const columns = [
    {
      key: 'createdAt', label: 'Fecha',
      render: (l) => (
        <Text fontSize="sm" color="onSurface">{formatDate(l.createdAt)}</Text>
      ),
    },
    {
      key: 'user', label: 'Docente',
      render: (l) => {
        if (!l.user) return <Text fontSize="sm" color="onSurfaceVariant">—</Text>;
        return (
          <Box>
            <Text fontSize="sm" fontWeight={500} color="onSurface">
              {l.user.first_name} {l.user.last_name}
            </Text>
            <Badge variant="subtle" colorScheme="brand" fontSize="2xs">
              {l.user.role}
            </Badge>
          </Box>
        );
      },
    },
    {
      key: 'title', label: 'Licencia',
      render: (l) => <Text fontSize="sm" color="onSurface">{l.title}</Text>,
    },
    {
      key: 'file', label: 'Documentación',
      render: (l) => l.has_file ? (
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<FiDownload />}
          onClick={() => handleDownload(l.id, l.file_name, toast)}
          borderRadius="pill"
        >
          {l.file_name || 'Descargar'}
        </Button>
      ) : (
        <Text fontSize="sm" color="onSurfaceVariant">Sin archivo</Text>
      ),
    },
  ];

  if (loading) return <LoadingSkeleton variant="text" rows={6} />;

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchLicences} />
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="lg" fontFamily="heading">
          Licencias Docentes
        </Heading>
        <Text fontSize="sm" color="onSurfaceVariant">
          Total: {licences.length}
        </Text>
      </Flex>

      {licences.length === 0 ? (
        <EmptyState
          title="Sin licencias"
          description="No hay licencias registradas en el sistema."
        />
      ) : (
        <Box
          borderRadius="card"
          border="1px solid"
          borderColor="outlineVariant"
          overflow="hidden"
          bg="white"
          boxShadow="warmSm"
        >
          <TableContainer>
            <Table variant="simple">
              <Thead bg="containerLow">
                <Tr>
                  {columns.map((col) => (
                    <Th
                      key={col.key}
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color="onSurfaceVariant"
                      py={4}
                    >
                      {col.label}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {licences.map((l, idx) => (
                  <Tr
                    key={l.id || idx}
                    _hover={{ bg: 'containerLow', transition: 'background-color 160ms ease-out' }}
                    sx={{
                      animation: 'fadeSlideIn 300ms ease-out both',
                      animationDelay: `${idx * 30}ms`,
                    }}
                  >
                    {columns.map((col) => (
                      <Td key={col.key} py={3}>
                        {col.render ? col.render(l) : l[col.key] ?? '—'}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
