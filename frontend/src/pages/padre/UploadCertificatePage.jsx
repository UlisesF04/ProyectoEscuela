import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Heading,
  Select,
  Button,
  Text,
  VStack,
  HStack,
  Image,
  Icon,
  useToast,
  Progress,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiX, FiCheckCircle } from 'react-icons/fi';
import ChildSelector from '../../components/ChildSelector';
import { parentService } from '../../services/parentService';
import { attendanceService } from '../../services/attendanceService';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import ErrorAlert from '../../components/ErrorAlert';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.pdf';
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function getFileIcon(type) {
  if (type === 'application/pdf') return FiFile;
  return FiUpload;
}

export default function UploadCertificatePage() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [selectedAbsence, setSelectedAbsence] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    parentService.getMyChildren()
      .then(setChildren)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setLoading(true);
    setError(null);
    api.get(`/students/${selectedChild.id}/attendances?status=ausente&justified=false`)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setAbsences(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [selectedChild]);

  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const validateFile = useCallback((f) => {
    if (!f) return 'No se seleccionó ningún archivo';
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return 'Formato no válido. Solo se aceptan JPG, PNG y PDF';
    }
    if (f.size > MAX_SIZE) {
      return 'El archivo supera el tamaño máximo de 5MB';
    }
    return null;
  }, []);

  const handleFileSelect = useCallback((f) => {
    const validationError = validateFile(f);
    if (validationError) {
      toast({
        title: 'Archivo no válido',
        description: validationError,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  }, [validateFile, toast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setFilePreview(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedAbsence || !file) return;
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('certificate', file);
      formData.append('attendance_id', selectedAbsence);
      await attendanceService.uploadCertificate(formData);
      setProgress(100);
      toast({
        title: 'Certificado subido',
        description: 'El certificado se subió correctamente',
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
      clearFile();
      setSelectedAbsence('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al subir el certificado';
      toast({
        title: 'Error',
        description: msg,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setUploading(false);
    }
  }, [selectedAbsence, file, toast, clearFile]);

  if (!selectedChild && children.length > 0 && !selectedChild) {
    setSelectedChild(children[0]);
  }

  return (
    <Box>
      <Heading as="h1" size="lg" mb={6} fontFamily="heading">
        Subir Certificado
      </Heading>

      <ErrorAlert error={error} />

      <ChildSelector
        children={children}
        selectedChild={selectedChild}
        onChange={setSelectedChild}
      />

      {selectedChild && (
        <VStack align="stretch" spacing={6}>
          <Box>
            <Text fontWeight={600} mb={2} fontSize="sm" color="onSurfaceVariant">
              Inasistencia a justificar
            </Text>
            {loading ? (
              <LoadingSkeleton variant="text" rows={1} />
            ) : absences.length === 0 ? (
              <EmptyState title="No hay inasistencias no justificadas" />
            ) : (
              <Select
                value={selectedAbsence}
                onChange={(e) => setSelectedAbsence(e.target.value)}
                placeholder="Seleccionar inasistencia..."
              >
                {absences.map((a) => {
                  const dateStr = a.fecha || a.date || a.created_at
                    ? new Date(a.fecha || a.date || a.created_at).toLocaleDateString('es-AR')
                    : '—';
                  const courseName = a.curso || a.course_name || a.materia || '';
                  return (
                    <option key={a.id} value={a.id}>
                      {dateStr}{courseName ? ` - ${courseName}` : ''}
                    </option>
                  );
                })}
              </Select>
            )}
          </Box>

          {absences.length > 0 && (
            <Box>
              <Text fontWeight={600} mb={2} fontSize="sm" color="onSurfaceVariant">
                Archivo del certificado
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
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                />

                {file ? (
                  <VStack spacing={3}>
                    {filePreview ? (
                      <Image
                        src={filePreview}
                        alt="Preview"
                        maxH="160px"
                        borderRadius="md"
                        objectFit="contain"
                      />
                    ) : (
                      <Icon as={FiFile} boxSize={10} color="primary" />
                    )}
                    <Text fontWeight={500} fontSize="sm">
                      {file.name}
                    </Text>
                    <Text fontSize="xs" color="onSurfaceVariant">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      leftIcon={<FiX />}
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                    >
                      Quitar archivo
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={2}>
                    <Icon as={FiUpload} boxSize={8} color="onSurfaceVariant" opacity={0.5} />
                    <Text fontWeight={500} color="onSurfaceVariant">
                      Arrastrá tu archivo aquí o hacé clic para seleccionar
                    </Text>
                    <Text fontSize="xs" color="onSurfaceVariant">
                      JPG, PNG o PDF - Máximo 5MB
                    </Text>
                  </VStack>
                )}
              </Box>
            </Box>
          )}

          {uploading && (
            <Progress
              value={progress}
              size="sm"
              colorScheme="brand"
              borderRadius="pill"
              isAnimated
              hasStripe
            />
          )}

          <Button
            leftIcon={uploading ? undefined : <FiUpload />}
            isLoading={uploading}
            loadingText="Subiendo..."
            isDisabled={!selectedAbsence || !file || uploading}
            onClick={handleUpload}
            colorScheme="brand"
            alignSelf="flex-start"
          >
            Subir certificado
          </Button>
        </VStack>
      )}
    </Box>
  );
}
