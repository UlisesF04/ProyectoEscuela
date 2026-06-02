import { useState, useEffect, useCallback } from 'react';
import {
  Box, Heading, Button, Text, VStack, HStack, Icon, useToast,
  Progress, Input, FormControl, FormLabel,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiCheckCircle } from 'react-icons/fi';
import FileUpload from '../../components/FileUpload';
import ChildSelector from '../../components/ChildSelector';
import { parentService } from '../../services/parentService';
import { licencesService } from '../../services/licencesService';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';

const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.pdf';

export default function JustificativosPage() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [licences, setLicences] = useState([]);
  const [loadingLicences, setLoadingLicences] = useState(true);
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    parentService.getMyChildren()
      .then((data) => {
        setChildren(data || []);
        if (data && data.length > 0) setSelectedChild(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoadingLicences(true);
    licencesService.getMyLicences()
      .then((data) => {
        const all = data?.data || data || [];
        setLicences(Array.isArray(all) ? all : []);
      })
      .catch(() => setLicences([]))
      .finally(() => setLoadingLicences(false));
  }, [selectedChild]);

  const handleUpload = useCallback(async () => {
    if (!title.trim() || !file) return;
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('title', `${selectedChild?.first_name || ''} ${selectedChild?.last_name || ''} - ${title.trim()}`);
      formData.append('file', file);
      await licencesService.create(formData);
      setProgress(100);
      toast({ title: 'Justificativo enviado', description: 'Se envió correctamente', status: 'success', duration: 4000, isClosable: true, position: 'top-right' });
      setFile(null);
      setTitle('');
      const data = await licencesService.getMyLicences();
      setLicences(Array.isArray(data?.data || data) ? (data?.data || data) : []);
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Error al enviar', status: 'error', duration: 4000, isClosable: true, position: 'top-right' });
    } finally {
      setUploading(false);
    }
  }, [selectedChild, title, file, toast]);

  if (loading) return <LoadingSkeleton variant="text" rows={3} />;

  return (
    <Box>
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">Justificativos</Heading>
      <ErrorAlert error={error} />

      <ChildSelector children={children} selectedChild={selectedChild} onChange={setSelectedChild} />

      {selectedChild && (
        <VStack align="stretch" spacing={6} mt={6}>
          <Box borderRadius="card" border="1px solid" borderColor="outlineVariant" bg="white" boxShadow="warmSm" p={6}>
            <Heading as="h2" size="sm" mb={4} fontFamily="heading">Nuevo justificativo</Heading>
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Motivo</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Consulta médica"
                  borderRadius="input"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" color="onSurfaceVariant">Archivo</FormLabel>
                <FileUpload value={file} onChange={setFile} accept={ACCEPTED_EXTENSIONS} hint="JPG, PNG o PDF - Máximo 5MB" />
              </FormControl>

              {uploading && <Progress value={progress} size="sm" colorScheme="brand" borderRadius="pill" isAnimated hasStripe />}

              <Button
                leftIcon={uploading ? undefined : <FiUpload />}
                isLoading={uploading}
                loadingText="Enviando..."
                isDisabled={!title.trim() || !file || uploading}
                onClick={handleUpload}
                colorScheme="brand"
                alignSelf="flex-start"
              >
                Enviar justificativo
              </Button>
            </VStack>
          </Box>

          <Box>
            <Heading as="h2" size="sm" mb={4} fontFamily="heading">Mis justificativos</Heading>
            {loadingLicences ? (
              <LoadingSkeleton variant="text" rows={2} />
            ) : licences.length === 0 ? (
              <Box textAlign="center" py={8} px={6} borderRadius="card" bg="containerLow">
                <Text color="onSurfaceVariant">No tenés justificativos cargados.</Text>
              </Box>
            ) : (
              <VStack spacing={3} align="stretch">
                {licences.map((l) => (
                  <HStack key={l.id} p={4} borderRadius="card" border="1px solid" borderColor="outlineVariant" bg="white" boxShadow="warmSm" justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight={600} fontSize="sm">{l.title}</Text>
                      <Text fontSize="xs" color="onSurfaceVariant">{new Date(l.createdAt).toLocaleDateString('es-AR')}</Text>
                    </VStack>
                    {l.has_file && (
                      <Button as="a" href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/licences/${l.id}/download`} target="_blank" size="sm" variant="ghost" leftIcon={<FiFile />} borderRadius="pill">
                        Ver
                      </Button>
                    )}
                  </HStack>
                ))}
              </VStack>
            )}
          </Box>
        </VStack>
      )}
    </Box>
  );
}
