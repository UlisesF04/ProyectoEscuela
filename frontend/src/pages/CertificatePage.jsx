import { useState, useEffect } from 'react'
import { Box, Flex, Text, Button, Card, VStack, NativeSelect, Input, Select } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import FeedbackBanner from '../components/molecules/FeedbackBanner'
import StatusBadge from '../components/atoms/StatusBadge'
import LoadingSpinner from '../components/molecules/LoadingSpinner'
import EmptyState from '../components/molecules/EmptyState'
import { useChildren, useCertificates } from '../hooks'
import StaggerContainer from '../components/StaggerContainer'

/* ── Main page ── */
export default function CertificatePage() {
  const { user } = useAuth()
  const role = user?.rol

  // ── Children (for tutors) ──
  const { hijos } = useChildren()
  const [hijoId, setHijoId] = useState('')

  // ── Student input (for admin/preceptor) ──
  const [studentInput, setStudentInput] = useState('')

  // ── Active estudiante_id for filtering ──
  const [activeEstudianteId, setActiveEstudianteId] = useState(null)

  // ── Upload form ──
  const [inasistenciaId, setInasistenciaId] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  // ── Certificate list ──
  const [statusFilter, setStatusFilter] = useState('')
  const [feedback, setFeedback] = useState('')
  const { certificates: allCerts, loading: loadingCerts, error: certError, upload: uploadCert, approve: approveCert, reject: rejectCert, refetch: refetchCerts } = useCertificates()

  // ── Approve/reject state ──
  const [processingId, setProcessingId] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [rejectingId, setRejectingId] = useState(null)

  // Auto-select first child when children load
  useEffect(() => {
    if (role === 'tutor' && hijos.length > 0 && !hijoId) {
      setHijoId(hijos[0].id)
      setActiveEstudianteId(hijos[0].id)
    }
  }, [role, hijos])

  // Load certificates when filters change
  useEffect(() => {
    if (role === 'preceptor') return
    const params = {}
    if (activeEstudianteId) params.estudiante_id = activeEstudianteId
    if (statusFilter) params.estado = statusFilter
    refetchCerts(params)
  }, [activeEstudianteId, statusFilter, role])

  // Handle student search (admin/preceptor)
  const handleStudentSearch = () => {
    const id = parseInt(studentInput)
    if (!id || isNaN(id)) {
      setFeedback('⚠️ Ingres\u00e1 un ID de estudiante v\u00e1lido')
      return
    }
    setActiveEstudianteId(id)
  }

  // Handle child change (tutor)
  const handleChildChange = (id) => {
    setHijoId(id)
    setActiveEstudianteId(id)
  }

  // Upload certificate
  const handleUpload = async () => {
    const estudianteId = role === 'tutor' ? parseInt(hijoId) : activeEstudianteId
    if (!estudianteId || !uploadedFile) {
      setFeedback('⚠️ Seleccion\u00e1 un estudiante y un archivo')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('estudiante_id', estudianteId)
      formData.append('archivo', uploadedFile)
      if (inasistenciaId) formData.append('inasistencia_id', parseInt(inasistenciaId))

      await uploadCert(formData)
      setFeedback('✅ Certificado subido correctamente')
      setUploadedFile(null)
      setInasistenciaId('')
    } catch (err) {
      setFeedback(`❌ ${err.response?.data?.message || 'Error al subir certificado'}`)
    } finally {
      setUploading(false)
    }
  }

  // Approve
  const handleApprove = async (id) => {
    setProcessingId(id)
    try {
      await approveCert(id)
      setFeedback('✅ Certificado aprobado')
    } catch (err) {
      setFeedback(`❌ ${err.response?.data?.message || 'Error al aprobar'}`)
    } finally {
      setProcessingId(null)
    }
  }

  // Reject
  const handleReject = async (id) => {
    if (!rejectComment.trim()) {
      setFeedback('⚠️ Escrib\u00ed un comentario de rechazo')
      return
    }
    setProcessingId(id)
    try {
      await rejectCert(id, rejectComment)
      setFeedback('✅ Certificado rechazado')
      setRejectComment('')
      setRejectingId(null)
    } catch (err) {
      setFeedback(`❌ ${err.response?.data?.message || 'Error al rechazar'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const canUpload = role === 'admin' || role === 'tutor' || role === 'docente'
  const canApprove = role === 'admin'
  const canList = role !== 'preceptor'

  return (
    <Box maxW="container-max" mx="auto">
      <Text textStyle="heading-xl" color="fg" mb={1}>Gestión de Certificados</Text>
      <Text textStyle="body-md" color="fg.muted" mb={6}>
        Subí y administrá certificados médicos y justificativos
      </Text>

      <FeedbackBanner feedback={feedback} />
      {certError && (
        <Box mb={4} p={3} borderRadius="md" bg="error-container" color="on-error-container">
          <Text fontSize="sm">{certError}</Text>
        </Box>
      )}

      <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
        {/* ── LEFT: Upload form ── */}
        {canUpload && (
          <Box flex={{ lg: '0 0 auto' }} w={{ lg: '42%' }}>
            <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={6}>
              <Text textStyle="heading-md" color="fg" mb={6}>Nuevo Certificado</Text>

              <VStack gap={5} align="stretch">
                {/* Student selector */}
                {role === 'tutor' && hijos.length > 0 && (
                  <Box>
                    <Text textStyle="label-md" color="fg.muted" mb={2}>Seleccionar Alumno</Text>
                    <NativeSelect.Root>
                      <NativeSelect.Field value={hijoId} onChange={(e) => handleChildChange(parseInt(e.target.value))}>
                        {hijos.map(h => (
                          <option key={h.id} value={h.id}>{h.nombre} {h.apellido} — {h.curso}</option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Box>
                )}

                {role === 'admin' && (
                  <Box>
                    <Text textStyle="label-md" color="fg.muted" mb={2}>ID del Estudiante</Text>
                    <Flex gap={2}>
                      <Input
                        placeholder="Ej: 1, 2, 3..."
                        value={studentInput}
                        onChange={(e) => setStudentInput(e.target.value)}
                        borderRadius="full" borderColor="border.default" bg="bg"
                      />
                      <Button borderRadius="full" bg="primary" color="white" onClick={handleStudentSearch}>Cargar</Button>
                    </Flex>
                  </Box>
                )}

                {/* Inasistencia ID (optional) */}
                <Box>
                  <Text textStyle="label-md" color="fg.muted" mb={2}>ID de Inasistencia (opcional)</Text>
                  <Input
                    placeholder="Vinculá este certificado a una inasistencia"
                    value={inasistenciaId}
                    onChange={(e) => setInasistenciaId(e.target.value)}
                    borderRadius="full" borderColor="border.default" bg="bg"
                  />
                </Box>

                {/* Dropzone */}
                <Box
                  border="2px dashed"
                  borderColor={dragOver ? 'primary' : 'border.default'}
                  bg={dragOver ? 'surface-variant' : 'surface-container-low'}
                  borderRadius="xl" p={8} textAlign="center" cursor="pointer"
                  transition="all 0.2s"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); setUploadedFile(e.dataTransfer?.files?.[0] || uploadedFile) }}
                  onClick={() => document.getElementById('cert-file-input')?.click()}
                  _hover={{ bg: 'surface-variant' }}
                >
                  <Box w={12} h={12} borderRadius="full" bg="bg" display="flex" alignItems="center" justifyContent="center" mx="auto" mb={3}>
                    <Box as="span" className="material-symbols-outlined" color="primary" fontSize="28px">upload_file</Box>
                  </Box>
                  {uploadedFile ? (
                    <Box>
                      <Text textStyle="label-md" color="fg" mb={1}>{uploadedFile.name}</Text>
                      <Text fontSize="sm" color="fg.muted">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</Text>
                    </Box>
                  ) : (
                    <Box>
                      <Text textStyle="label-md" color="fg" mb={1}>
                        Arrastrá el archivo aquí o{' '}
                        <Box as="span" color="primary" cursor="pointer" textDecor="underline">explorar</Box>
                      </Text>
                      <Text fontSize="sm" color="fg.muted">Formatos: PDF, JPG, PNG (Max. 5MB)</Text>
                    </Box>
                  )}
                  <Box as="input" id="cert-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                    display="none" onChange={(e) => setUploadedFile(e.target?.files?.[0] || uploadedFile)}
                  />
                </Box>

                {/* Submit */}
                <Button
                  w="full" borderRadius="full" bg="success" color="white" fontWeight="bold"
                  _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                  onClick={handleUpload}
                  loading={uploading}
                  disabled={!uploadedFile}
                >
                  Subir Certificado
                </Button>
              </VStack>
            </Card.Root>
          </Box>
        )}

        {/* ── RIGHT: Certificate history ── */}
        <Box flex={1} minW={0}>
          {/* Filters */}
          <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
            <Text textStyle="heading-md" color="fg">
              {role === 'tutor' ? 'Historial de Certificados' : 'Todos los Certificados'}
            </Text>
            {canList && (
              <NativeSelect.Root size="sm" w="160px">
                <NativeSelect.Field value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobado">Aprobados</option>
                  <option value="rechazado">Rechazados</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            )}
          </Flex>

          {/* Student search for non-tutor */}
          {role !== 'tutor' && canList && (
            <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={4} mb={4}>
              <Flex gap={3} align="flex-end">
                <Box flex={1}>
                  <Text textStyle="label-md" color="fg.muted" mb={1}>Filtrar por estudiante</Text>
                  <Input
                    placeholder="ID del estudiante (dejá vacío para ver todos)"
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    borderRadius="full" borderColor="border.default" bg="bg"
                  />
                </Box>
                <Button borderRadius="full" bg="primary" color="white"
                  _hover={{ bg: 'primary-container' }}
                  _active={{ transform: 'scale(0.97)' }}
                  onClick={handleStudentSearch}
                >
                  Aplicar
                </Button>
                <Button variant="ghost" borderRadius="full" onClick={() => {
                  setStudentInput('')
                  setActiveEstudianteId(null)
                }}>
                  Limpiar
                </Button>
              </Flex>
            </Card.Root>
          )}

          {/* Certificate list */}
          {canList ? (
            loadingCerts ? (
              <LoadingSpinner py={10} />
            ) : allCerts.length > 0 ? (
              <StaggerContainer
                as="div"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {allCerts.map((cert) => {
                  const isRejected = cert.estado === 'rechazado'
                  return (
                    <StaggerContainer.Item key={cert.id}>
                      <Card.Root bg="bg.card" borderRadius="xl" shadow="card" p={5}
                      opacity={isRejected ? 0.8 : 1}
                    >
                      <Flex gap={4} align="flex-start">
                        <Flex w={10} h={10} borderRadius="full"
                          bg={cert.estado === 'aprobado' ? 'success-container' : cert.estado === 'rechazado' ? 'error-container' : 'secondary-container'}
                          align="center" justify="center" flexShrink={0} mt={0.5}
                        >
                          <Box as="span" className="material-symbols-outlined" fontSize="20px" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {cert.estado === 'aprobado' ? 'check_circle' : cert.estado === 'rechazado' ? 'cancel' : 'pending'}
                          </Box>
                        </Flex>

                        <Box flex={1} minW={0}>
                          <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
                            <Box>
                              <Text textStyle="label-md" color="fg">
                                {cert.Estudiante?.nombre || `Estudiante #${cert.estudiante_id}`} {cert.Estudiante?.apellido || ''}
                              </Text>
                              <Text fontSize="sm" color="fg.muted" mt={1}>
                                {new Date(cert.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                {cert.inasistencia_id && ` · Inasistencia #${cert.inasistencia_id}`}
                              </Text>
                            </Box>
                            <StatusBadge estado={cert.estado} />
                          </Flex>

                          <Flex align="center" gap={2} mt={2}>
                            <Box as="span" className="material-symbols-outlined" fontSize="16px" color="fg.muted">description</Box>
                            <Text fontSize="sm" color="fg.muted">{cert.filename}</Text>
                            {cert.file_size && (
                              <Text fontSize="sm" color="fg.muted">
                                ({(cert.file_size / 1024 / 1024).toFixed(2)} MB)
                              </Text>
                            )}
                          </Flex>

                          {/* Rejection comment */}
                          {cert.comentario_rechazo && (
                            <Flex align="center" gap={1} mt={2}>
                              <Box as="span" className="material-symbols-outlined" fontSize="16px" color="error">info</Box>
                              <Text fontSize="sm" color="error">{cert.comentario_rechazo}</Text>
                            </Flex>
                          )}

                          {/* Uploader info */}
                          <Text fontSize="xs" color="fg.muted" mt={1}>
                            Subido por: {cert.subidoPor?.email || '?'} ({cert.subidoPor?.rol || '?'})
                          </Text>

                          {/* Approve/reject for admin */}
                          {canApprove && cert.estado === 'pendiente' && (
                            <Flex gap={2} mt={3}>
                              <Button size="sm" borderRadius="full" colorPalette="green"
                                onClick={() => handleApprove(cert.id)}
                                loading={processingId === cert.id}
                              >
                                Aprobar
                              </Button>
                              {rejectingId === cert.id ? (
                                <Flex gap={2} align="center" flex={1}>
                                  <Input
                                    size="sm" placeholder="Motivo de rechazo..."
                                    value={rejectComment}
                                    onChange={(e) => setRejectComment(e.target.value)}
                                    borderRadius="full" borderColor="border.default" bg="bg"
                                  />
                                  <Button size="sm" borderRadius="full" colorPalette="red"
                                    onClick={() => handleReject(cert.id)}
                                    loading={processingId === cert.id}
                                  >
                                    Confirmar
                                  </Button>
                                  <Button size="sm" variant="ghost" borderRadius="full"
                                    onClick={() => { setRejectingId(null); setRejectComment('') }}>
                                    Cancelar
                                  </Button>
                                </Flex>
                              ) : (
                                <Button size="sm" borderRadius="full" colorPalette="red" variant="outline"
                                  onClick={() => setRejectingId(cert.id)}
                                >
                                  Rechazar
                                </Button>
                              )}
                            </Flex>
                          )}
                        </Box>
                      </Flex>
                    </Card.Root>
                      </StaggerContainer.Item>
                    )
                  })}
                </StaggerContainer>
            ) : (
              <EmptyState
                heading="Sin certificados"
                message={role === 'tutor' && activeEstudianteId
                  ? 'No hay certificados para este alumno. Us\u00e1 el formulario para subir uno.'
                  : 'No se encontraron certificados con los filtros actuales.'}
              />
            )
          ) : (
            <EmptyState
              heading="Acceso limitado"
              message="Como preceptor, no pod\u00e9s listar certificados. Contact\u00e1 a un administrador."
            />
          )}
        </Box>
      </Flex>
    </Box>
  )
}
