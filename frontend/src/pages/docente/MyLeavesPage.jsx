import {
  Box, Heading, Text, Button, VStack, HStack, Badge,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
  FormControl, FormLabel, Input, useToast, Card, CardBody, Divider,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { FiUpload, FiDownload, FiFileText } from 'react-icons/fi';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import FileUpload from '../../components/FileUpload';
import ErrorAlert from '../../components/ErrorAlert';
import EmptyState from '../../components/EmptyState';
import { licencesService } from '../../services/licencesService';

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

export default function MyLeavesPage() {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const toast = useToast();

  const fetchLicences = useCallback(() => {
    setLoading(true);
    setError(null);
    licencesService.getMyLicences()
      .then((data) => setLicences(Array.isArray(data) ? data : []))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLicences(); }, [fetchLicences]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: 'Campo requerido', description: 'Ingrese un título para la licencia',
        status: 'warning', duration: 3000, isClosable: true, position: 'top-right',
      });
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (file) formData.append('file', file);
      await licencesService.create(formData);
      toast({
        title: 'Licencia registrada',
        status: 'success', duration: 2000, isClosable: true, position: 'top-right',
      });
      setTitle('');
      setFile(null);
      fetchLicences();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'No se pudo registrar la licencia',
        status: 'error', duration: 3000, isClosable: true, position: 'top-right',
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'createdAt', label: 'Fecha',
      render: (l) => (
        <Text fontSize="sm" color="onSurface">{formatDate(l.createdAt)}</Text>
      ),
    },
    {
      key: 'title', label: 'Título',
      render: (l) => <Text fontSize="sm" color="onSurface" fontWeight={500}>{l.title}</Text>,
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

  if (loading && licences.length === 0) return <LoadingSkeleton variant="text" rows={5} />;

  return (
    <Box>
      <ErrorAlert error={error} onRetry={fetchLicences} />
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Mis Licencias
      </Heading>

      <Card mb={8}>
        <CardBody>
          <Heading as="h3" size="sm" mb={4} fontFamily="heading">
            Registrar Licencia
          </Heading>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="onSurfaceVariant">Título</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Licencia por enfermedad"
                borderRadius="input"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" color="onSurfaceVariant">
                Archivo adjunto <Box as="span" color="onSurfaceVariant" fontWeight="normal">(opcional)</Box>
              </FormLabel>
              <FileUpload value={file} onChange={setFile} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" hint="PDF, DOC, DOCX, JPG, PNG - Máx 10 MB" />
            </FormControl>

            <Button
              leftIcon={<FiUpload />}
              colorScheme="brand"
              onClick={handleSubmit}
              isLoading={saving}
              loadingText="Registrando..."
              alignSelf="flex-start"
            >
              Registrar
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <Divider mb={6} borderColor="outlineVariant" />

      <Heading as="h3" size="sm" mb={4} fontFamily="heading">
        Historial de Licencias
      </Heading>

      {licences.length === 0 ? (
        <EmptyState
          title="Sin licencias"
          description="No has registrado ninguna licencia todavía."
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
