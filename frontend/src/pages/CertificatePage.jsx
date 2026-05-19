import { useState } from 'react'
import { Box, Flex, Text, Button } from '@chakra-ui/react'

/* ── mock data ── */

const MOCK_CHILDREN = [
  { value: 'sofia', label: 'Sofía Martínez (3° A)' },
  { value: 'mateo', label: 'Mateo Martínez (1° B)' },
]

const MOCK_CERTIFICATES = [
  {
    id: 'cert-1',
    title: 'Certificado Médico - Sofía M.',
    date: '24 Oct 2023',
    reason: 'Ausencia por enfermedad',
    fileName: 'certificado_octubre.pdf',
    icon: 'medical_information',
    iconBg: 'secondary-container',
    iconColor: 'on-secondary-container',
    status: 'pending',
    error: null,
  },
  {
    id: 'cert-2',
    title: 'Justificativo Familiar - Mateo M.',
    date: '15 Sep 2023',
    reason: 'Trámite personal',
    fileName: 'nota_padres_sep.jpg',
    icon: 'assignment',
    iconBg: 'surface-container-high',
    iconColor: 'on-surface-variant',
    status: 'approved',
    error: null,
  },
  {
    id: 'cert-3',
    title: 'Certificado Deportivo - Sofía M.',
    date: '02 Sep 2023',
    reason: 'Torneo intercolegial',
    fileName: 'certificado_deportivo.pdf',
    icon: 'description',
    iconBg: 'surface-container-high',
    iconColor: 'on-surface-variant',
    status: 'rejected',
    error: 'Faltan firmas de la institución deportiva.',
  },
]

/* ── helpers ── */

const STATUS_STYLES = {
  pending: {
    label: 'Pendiente',
    bg: 'secondary-fixed-dim',
    color: 'secondary',
    borderColor: 'secondary-fixed-dim',
    textColor: 'on-secondary-container',
  },
  approved: {
    label: 'Aprobado',
    bg: 'success-container',
    color: 'on-success-container',
    borderColor: 'success',
    textColor: 'on-success-container',
  },
  rejected: {
    label: 'Rechazado',
    bg: 'error-container',
    color: 'on-error-container',
    borderColor: 'error',
    textColor: 'on-error-container',
  },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status]
  return (
    <Box
      as="span"
      fontSize="10px"
      fontWeight="bold"
      textTransform="uppercase"
      letterSpacing="wider"
      bg={s.bg}
      color={s.color}
      px={2}
      py={1}
      borderRadius="sm"
      border="1px solid"
      borderColor={s.borderColor}
      whiteSpace="nowrap"
    >
      {s.label}
    </Box>
  )
}

/* ── main page ── */

export default function CertificatePage() {
  const [selectedChild, setSelectedChild] = useState('')
  const [absenceDate, setAbsenceDate] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleSubmit = () => {
    if (!selectedChild || !absenceDate || !uploadedFile) return
    // TODO: connect to backend /api/certificates
    alert('Certificado subido (simulado)')
    setUploadedFile(null)
    setAbsenceDate('')
  }

  return (
    <Flex direction="column" gap={6}>
      {/* header */}
      <Box>
        <Text textStyle="heading-xl" color="on-surface" mb={1}>
          Gestión de Certificados
        </Text>
        <Text textStyle="body-lg" color="on-surface-variant">
          Sube y administra los certificados médicos y justificativos.
        </Text>
      </Box>

      {/* grid: upload form + history */}
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        gap={6}
      >
        {/* ── left: upload form ── */}
        <Box flex={{ lg: '0 0 auto' }} w={{ lg: '42%' }}>
          <Box
            bg="surface-container-lowest"
            borderRadius="xl"
            p={6}
            boxShadow="warm-ambient"
            borderWidth="1px"
            borderColor="outline-variant"
          >
            <Text textStyle="heading-md" color="on-surface" mb={6}>
              Nuevo Certificado
            </Text>

            <Flex direction="column" gap={5}>
              {/* child selector */}
              <Box>
                <Text textStyle="label-md" color="on-surface" mb={2}>
                  Seleccionar Alumno
                </Text>
                <Box position="relative">
                  <Box
                    as="select"
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    w="full"
                    bg="surface-container-low"
                    border="1px solid"
                    borderColor="outline"
                    color="on-surface"
                    fontFamily="body"
                    fontSize="md"
                    py={3}
                    pl={12}
                    pr={10}
                    borderRadius="full"
                    appearance="none"
                    outline="none"
                    cursor="pointer"
                    transition="all 0.2s ease-out"
                    sx={{
                      '&:focus': {
                        boxShadow: '0 0 0 2px #ab3500',
                        borderColor: '#ab3500',
                      },
                    }}
                  >
                    <option value="" disabled>
                      Seleccionar alumno...
                    </option>
                    {MOCK_CHILDREN.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Box>
                  <Box
                    as="span"
                    className="material-symbols-outlined"
                    position="absolute"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    color="on-surface-variant"
                    fontSize="18px"
                    pointerEvents="none"
                  >
                    school
                  </Box>
                  <Box
                    as="span"
                    className="material-symbols-outlined"
                    position="absolute"
                    right={4}
                    top="50%"
                    transform="translateY(-50%)"
                    color="on-surface-variant"
                    fontSize="20px"
                    pointerEvents="none"
                  >
                    expand_more
                  </Box>
                </Box>
              </Box>

              {/* date picker */}
              <Box>
                <Text textStyle="label-md" color="on-surface" mb={2}>
                  Fecha de Ausencia
                </Text>
                <Box position="relative">
                  <Box
                    as="input"
                    type="date"
                    value={absenceDate}
                    onChange={(e) => setAbsenceDate(e.target.value)}
                    w="full"
                    bg="surface-container-low"
                    border="1px solid"
                    borderColor="outline"
                    color="on-surface"
                    fontFamily="body"
                    fontSize="md"
                    py={3}
                    pl={12}
                    pr={4}
                    borderRadius="full"
                    outline="none"
                    cursor="pointer"
                    transition="all 0.2s ease-out"
                    sx={{
                      '&:focus': {
                        boxShadow: '0 0 0 2px #ab3500',
                        borderColor: '#ab3500',
                      },
                      '&::-webkit-calendar-picker-indicator': {
                        opacity: 0,
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                      },
                    }}
                  />
                  <Box
                    as="span"
                    className="material-symbols-outlined"
                    position="absolute"
                    left={4}
                    top="50%"
                    transform="translateY(-50%)"
                    color="on-surface-variant"
                    fontSize="18px"
                    pointerEvents="none"
                  >
                    calendar_today
                  </Box>
                </Box>
              </Box>

              {/* dropzone */}
              <Box
                border="2px dashed"
                borderColor={dragOver ? 'primary' : 'primary-container'}
                bg={dragOver ? 'surface-variant' : 'surface-container-low'}
                borderRadius="xl"
                p={8}
                textAlign="center"
                cursor="pointer"
                transition="all 0.2s ease-out"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('cert-file-input')?.click()}
                _hover={{ bg: 'surface-variant' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    document.getElementById('cert-file-input')?.click()
                  }
                }}
              >
                <Box
                  w={12}
                  h={12}
                  borderRadius="full"
                  bg="surface"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                  mb={3}
                  transition="transform 0.2s ease-out"
                  _groupHover={{ transform: 'scale(1.1)' }}
                >
                  <Box
                    as="span"
                    className="material-symbols-outlined"
                    color="primary"
                    fontSize="28px"
                  >
                    upload_file
                  </Box>
                </Box>
                {uploadedFile ? (
                  <Box>
                    <Text textStyle="label-md" color="on-surface" mb={1}>
                      {uploadedFile.name}
                    </Text>
                    <Text fontSize="sm" color="on-surface-variant">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </Box>
                ) : (
                  <Box>
                    <Text textStyle="label-md" color="on-surface" mb={1}>
                      Arrastra el archivo aquí o{' '}
                      <Box as="span" color="primary" cursor="pointer" textDecor="underline">
                        explorar
                      </Box>
                    </Text>
                    <Text fontSize="sm" color="on-surface-variant">
                      Formatos soportados: PDF, JPG, PNG (Max. 5MB)
                    </Text>
                  </Box>
                )}
                <Box
                  as="input"
                  id="cert-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  display="none"
                  onChange={handleFileDrop}
                />
              </Box>

              {/* submit */}
              <Button
                w="full"
                borderRadius="full"
                bg="success"
                color="on-primary"
                fontWeight="bold"
                fontSize="sm"
                py={3}
                h="auto"
                _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                transition="all 0.2s ease-out"
                leftIcon={
                  <Box as="span" className="material-symbols-outlined" fontSize="18px" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </Box>
                }
                onClick={handleSubmit}
                isDisabled={!selectedChild || !absenceDate || !uploadedFile}
              >
                Subir Certificado
              </Button>
            </Flex>
          </Box>
        </Box>

        {/* ── right: history ── */}
        <Box flex={1} minW={0}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text textStyle="heading-md" color="on-surface">
              Historial Reciente
            </Text>
            <Button
              variant="ghost"
              color="primary"
              fontSize="sm"
              fontWeight="semibold"
              fontFamily="body"
              _hover={{ color: 'on-primary-container' }}
              transition="color 0.15s ease"
            >
              Ver todos
            </Button>
          </Flex>

          <Flex direction="column" gap={4}>
            {MOCK_CERTIFICATES.map((cert) => {
              const isRejected = cert.status === 'rejected'
              return (
                <Box
                  key={cert.id}
                  bg="surface-container-lowest"
                  borderRadius="xl"
                  p={5}
                  boxShadow="warm-ambient"
                  borderWidth="1px"
                  borderColor="outline-variant"
                  opacity={isRejected ? 0.8 : 1}
                  cursor="pointer"
                  transition="all 0.2s ease-out"
                  _hover={{ boxShadow: 'warm-hover' }}
                >
                  <Flex gap={4} align="flex-start">
                    {/* icon */}
                    <Flex
                      w={10}
                      h={10}
                      borderRadius="full"
                      bg={cert.iconBg}
                      color={cert.iconColor}
                      align="center"
                      justify="center"
                      flexShrink={0}
                      mt={0.5}
                    >
                      <Box
                        as="span"
                        className="material-symbols-outlined"
                        fontSize="20px"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {cert.icon}
                      </Box>
                    </Flex>

                    {/* content */}
                    <Box flex={1} minW={0}>
                      <Flex justify="space-between" align="flex-start" gap={3}>
                        <Text textStyle="label-md" color="on-surface" truncate>
                          {cert.title}
                        </Text>
                        <StatusBadge status={cert.status} />
                      </Flex>
                      <Text fontSize="sm" color="on-surface-variant" mt={1}>
                        {cert.date} • {cert.reason}
                      </Text>

                      {/* filename */}
                      <Flex align="center" gap={2} mt={2}>
                        <Box
                          as="span"
                          className="material-symbols-outlined"
                          fontSize="16px"
                          color="outline"
                        >
                          description
                        </Box>
                        <Text fontSize="sm" color="outline">
                          {cert.fileName}
                        </Text>
                      </Flex>

                      {/* error message (rejected only) */}
                      {cert.error && (
                        <Flex align="center" gap={1} mt={2}>
                          <Box
                            as="span"
                            className="material-symbols-outlined"
                            fontSize="16px"
                            color="error"
                          >
                            info
                          </Box>
                          <Text fontSize="sm" color="error">
                            {cert.error}
                          </Text>
                        </Flex>
                      )}
                    </Box>
                  </Flex>
                </Box>
              )
            })}
          </Flex>
        </Box>
      </Flex>
    </Flex>
  )
}
