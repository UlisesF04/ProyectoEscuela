import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Heading, Button, Text, VStack, HStack, Image, Icon, useToast,
  Progress, Input, FormControl, FormLabel,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiX, FiCheckCircle } from 'react-icons/fi';
import ChildSelector from '../../components/ChildSelector';
import { parentService } from '../../services/parentService';
import { licencesService } from '../../services/licencesService';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorAlert from '../../components/ErrorAlert';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.pdf';
const MAX_SIZE = 5 * 1024 * 1024;

function getFileIcon(type) {
  if (type === 'application/pdf') return FiFile;
  return FiUpload;
}

export default function JustificativosPage() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [licences, setLicences] = useState([]);
  const [loadingLicences, setLoadingLicences] = useState(true);
  const inputRef = useRef(null);
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

  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const validateFile = useCallback((f) => {
    if (!f) return 'No se seleccionó ningún archivo';
    if (!ACCEPTED_TYPES.includes(f.type)) return 'Formato no válido. Solo JPG, PNG y PDF';
    if (f.size > MAX_SIZE) return 'El archivo supera el tamaño máximo de 5MB';
    return null;
  }, []);

  const handleFileSelect = useCallback((f) => {
    const err = validateFile(f);
    if (err) {
      toast({ title: 'Archivo no válido', description: err, status: 'error', duration: 4000, isClosable: true, position: 'top-right' });
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) setFilePreview(URL.createObjectURL(f));
    else setFilePreview(null);
  }, [validateFile, toast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => e.preventDefault(), []);

  const clearFile = useCallback(() => {
    setFile(null);
    setFilePreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

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
      clearFile();
      setTitle('');
      const data = await licencesService.getMyLicences();
      setLicences(Array.isArray(data?.data || data) ? (data?.data || data) : []);
    } catch (err) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Error al enviar', status: 'error', duration: 4000, isClosable: true, position: 'top-right' });
    } finally {
      setUploading(false);
    }
  }, [selectedChild, title, file, toast, clearFile]);

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

              <Box>
                <Text fontWeight={600} mb={2} fontSize="sm" color="onSurfaceVariant">
                  Archivo
                </Text>
                <Box
                  border="2px dashed"
                  borderColor={file ? 'primary' : 'outlineVariant'}
                  borderRadius="card"
                  p={8}
                  textAlign="center"
                  cursor="pointer"
                  bg={file ? 'containerLow' : 'transparent'}
                  transition="all 200ms ease-out"
                  _hover={{ borderColor: 'primary', bg: 'containerLow' }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => inputRef.current?.click()}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
                  />
                  {file ? (
                    <VStack spacing={3}>
                      {filePreview ? (
                        <Image src={filePreview} alt="Preview" maxH="160px" borderRadius="md" objectFit="contain" />
                      ) : (
                        <Icon as={getFileIcon(file.type)} boxSize={10} color="primary" />
                      )}
                      <Text fontWeight={500} fontSize="sm">{file.name}</Text>
                      <Text fontSize="xs" color="onSurfaceVariant">{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                      <Button size="sm" variant="ghost" colorScheme="red" leftIcon={<FiX />} onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                        Quitar archivo
                      </Button>
                    </VStack>
                  ) : (
                    <VStack spacing={2}>
                      <Icon as={FiUpload} boxSize={8} color="onSurfaceVariant" opacity={0.5} />
                      <Text fontWeight={500} color="onSurfaceVariant">Arrastrá tu archivo aquí o hacé clic para seleccionar</Text>
                      <Text fontSize="xs" color="onSurfaceVariant">JPG, PNG o PDF - Máximo 5MB</Text>
                    </VStack>
                  )}
                </Box>
              </Box>

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
