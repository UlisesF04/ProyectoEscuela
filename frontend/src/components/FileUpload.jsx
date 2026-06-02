import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box, Text, Icon, Image, Button, VStack,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

export default function FileUpload({
  value,
  onChange,
  accept = '.jpg,.jpeg,.png,.pdf',
  mimeTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSize = 5 * 1024 * 1024,
  placeholder = 'Arrastrá tu archivo aquí o hacé clic para seleccionar...',
  hint = 'JPG, PNG o PDF - Máximo 5MB',
  ...rest
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const inputRef = useRef(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (value && value.type?.startsWith('image/')) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [value]);

  const validate = useCallback((file) => {
    if (!file) return 'No se seleccionó ningún archivo';
    if (!mimeTypes.includes(file.type)) return 'Formato no válido. Solo archivos ' + mimeTypes.map(t => t.split('/')[1].toUpperCase()).join(', ');
    if (file.size > maxSize) return `El archivo supera el tamaño máximo de ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
    return null;
  }, [mimeTypes, maxSize]);

  const handleSelect = useCallback((file) => {
    setError(null);
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    if (onChange) onChange(file);
  }, [validate, onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const file = e.dataTransfer?.files?.[0];
    if (file) handleSelect(file);
  }, [handleSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleSelect(file);
    e.target.value = '';
  }, [handleSelect]);

  const clearFile = useCallback((e) => {
    e.stopPropagation();
    setError(null);
    if (onChange) onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [onChange]);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <Box {...rest}>
      <Box
        border="2px dashed"
        borderColor={error ? 'error' : isDragging ? 'primary' : value ? 'primary' : 'outlineVariant'}
        borderRadius="card"
        p={8}
        textAlign="center"
        cursor="pointer"
        bg={isDragging ? 'brand.50' : value ? 'containerLow' : 'transparent'}
        transition="all 200ms ease-out"
        _hover={{ borderColor: 'primary', bg: isDragging ? 'brand.50' : 'containerLow' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {value ? (
          <VStack spacing={3}>
            {previewUrl ? (
              <Image src={previewUrl} alt="Preview" maxH="160px" borderRadius="md" objectFit="contain" />
            ) : (
              <Icon as={value.type === 'application/pdf' ? FiFile : FiUpload} boxSize={10} color="primary" />
            )}
            <Text fontWeight={500} fontSize="sm" color="onSurface">{value.name}</Text>
            <Text fontSize="xs" color="onSurfaceVariant">{formatSize(value.size)}</Text>
            <Button size="sm" variant="ghost" colorScheme="red" leftIcon={<FiX />} onClick={clearFile}>
              Quitar archivo
            </Button>
          </VStack>
        ) : (
          <VStack spacing={2}>
            <Icon
              as={FiUpload}
              boxSize={8}
              color={isDragging ? 'primary' : 'onSurfaceVariant'}
              opacity={isDragging ? 1 : 0.5}
            />
            <Text fontWeight={500} color={isDragging ? 'primary' : 'onSurfaceVariant'}>
              {isDragging ? 'Soltá el archivo aquí' : placeholder}
            </Text>
            <Text fontSize="xs" color="onSurfaceVariant">{hint}</Text>
          </VStack>
        )}
      </Box>
      {error && (
        <Text fontSize="xs" color="error" mt={1.5} textAlign="left">
          {error}
        </Text>
      )}
    </Box>
  );
}
