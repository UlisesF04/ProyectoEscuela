import { useState, useEffect, useRef } from 'react'
import { Box, Flex, Text, Button, IconButton, Input, VStack, Badge, Spinner, NativeSelect } from '@chakra-ui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MS_PER_DAY } from '../constants/business'
import FeedbackBanner from '../components/molecules/FeedbackBanner'
import Avatar from '../components/atoms/Avatar'
import { AnimatePresence, motion } from 'framer-motion'
import { useConversations } from '../hooks'
import StaggerContainer from '../components/StaggerContainer'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / MS_PER_DAY)

  if (days === 0) {
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }
  if (days === 1) return 'Ayer'
  if (days < 7) return d.toLocaleDateString('es-AR', { weekday: 'short' })
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  const days = Math.floor(diff / MS_PER_DAY)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* ── Main page ── */

export default function InboxPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { conversationId: urlPartnerId } = useParams()

  const myId = user?.id

  // State
  const [selectedUserId, setSelectedUserId] = useState(urlPartnerId ? parseInt(urlPartnerId) : null)
  const [searchQuery, setSearchQuery] = useState('')
  const [replySubject, setReplySubject] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [showNewMsg, setShowNewMsg] = useState(false)
  const [newRecipientId, setNewRecipientId] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')

  const { conversations, conversationsLoading, messages, messagesLoading, partner: partnerInfo, error, fetchMessages, sendMessage, markAsRead, refetchConversations } = useConversations()

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load messages when conversation selected + mark as read
  useEffect(() => {
    if (!selectedUserId) return
    fetchMessages(selectedUserId).then((freshMessages) => {
      // Mark unread messages from partner as read after fetching
      if (!freshMessages?.length) return
      const unread = freshMessages.filter(m => m.emisor?.id === selectedUserId && !m.leido)
      Promise.all(unread.map(m => markAsRead(m.id).catch(() => {})))
    })
  }, [selectedUserId])

  // Support /inbox/:conversationId URL param
  useEffect(() => {
    if (urlPartnerId) {
      setSelectedUserId(parseInt(urlPartnerId))
    }
  }, [urlPartnerId])

  // Filter conversations
  const filtered = conversations.filter(c =>
    (c.usuario?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConv = conversations.find(c => c.usuario?.id === selectedUserId)

  // Send reply
  const handleSend = async () => {
    if (!selectedUserId || !replyBody.trim()) return
    setSending(true)
    try {
      await sendMessage({ receptor_id: selectedUserId, asunto: replySubject || 'Sin asunto', cuerpo: replyBody })
      await fetchMessages(selectedUserId)
      setReplyBody('')
      setReplySubject('')
      setFeedback('✅ Mensaje enviado')
    } catch (err) {
      setFeedback(`❌ ${err.response?.data?.message || 'Error al enviar mensaje'}`)
    } finally {
      setSending(false)
    }
  }

  // Send new message
  const handleNewMessage = async () => {
    const id = parseInt(newRecipientId)
    if (!id || !newSubject.trim() || !newBody.trim()) {
      setFeedback('⚠️ Complet\u00e1 todos los campos')
      return
    }
    setSending(true)
    try {
      await sendMessage({ receptor_id: id, asunto: newSubject, cuerpo: newBody })
      setShowNewMsg(false)
      setNewRecipientId('')
      setNewSubject('')
      setNewBody('')
      setSelectedUserId(id)
      setFeedback('✅ Mensaje enviado')
      refetchConversations()
    } catch (err) {
      setFeedback(`❌ ${err.response?.data?.message || 'Error al enviar mensaje'}`)
    } finally {
      setSending(false)
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const label = formatDateLabel(msg.created_at)
    if (!groups[label]) groups[label] = []
    groups[label].push(msg)
    return groups
  }, {})

  /* ── Inbox sidebar ── */
  const inboxPanel = (
    <Flex direction="column" h="full" overflow="hidden">
      <Box px={5} pt={5} pb={4} borderBottom="1px solid" borderColor="border.default" bg="surface-container-low">
        <Flex justify="space-between" align="center" mb={4}>
          <Text textStyle="heading-xl" color="fg">Mensajes</Text>
          <Button
            variant="ghost" borderRadius="full" size="sm"
            onClick={() => { setShowNewMsg(true); setFeedback('') }}
          >
            + Nuevo
          </Button>
        </Flex>
        <Box position="relative">
          <Box as="span" className="material-symbols-outlined"
            position="absolute" left={4} top="50%" transform="translateY(-50%)"
            color="fg.muted" fontSize="20px" pointerEvents="none"
          >
            search
          </Box>
          <Input
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            pl={12} pr={4} py={3} borderRadius="full"
            bg="surface-variant" border="none"
            _focus={{ bg: 'bg', ring: 2, ringColor: 'primary-container' }}
          />
        </Box>
      </Box>

      <Box flex={1} overflowY="auto">
        {conversationsLoading ? (
          <Flex justify="center" py={10}><Spinner /></Flex>
        ) : filtered.length > 0 ? (
          <StaggerContainer>
            {filtered.map((conv) => {
              const isActive = selectedUserId === conv.usuario?.id
              const unread = conv.no_leidos > 0
              return (
                <StaggerContainer.Item key={conv.usuario?.id}>
                  <Flex
                px={5} py={3.5}
                borderBottom="1px solid" borderColor="border.default"
                bg={isActive ? 'secondary-container' : unread ? 'bg' : 'transparent'}
                cursor="pointer"
                _hover={{ bg: isActive ? 'secondary-container' : 'surface-variant' }}
                onClick={() => { setSelectedUserId(conv.usuario?.id); navigate(`/inbox/${conv.usuario?.id}`, { replace: true }) }}
                gap={3} align="flex-start" position="relative"
              >
                {unread && (
                  <Box position="absolute" left={3} top={6}
                    w={2} h={2} borderRadius="full" bg="primary" flexShrink={0}
                  />
                )}
                <Avatar label={conv.usuario?.email || '?'} size={12} />
                <Box flex={1} minW={0} ml={unread ? 0 : 0}>
                  <Flex justify="space-between" align="baseline" mb={0.5}>
                    <Text textStyle="label-md" fontWeight={unread ? 'bold' : 'normal'} color="fg" truncate>
                      {conv.usuario?.email || 'Usuario'}
                    </Text>
                    <Text fontSize="xs" fontWeight={unread ? 'semibold' : 'normal'}
                      color={unread ? 'primary' : 'fg.muted'} whiteSpace="nowrap" ml={2}
                    >
                      {conv.ultimo_mensaje ? formatTime(conv.ultimo_mensaje.created_at) : ''}
                    </Text>
                  </Flex>
                  {conv.ultimo_mensaje && (
                    <>
                      <Text fontSize="sm" fontWeight={unread ? 'semibold' : 'normal'}
                        color={unread ? 'fg' : 'fg.muted'} truncate mb={0.5}
                      >
                        {conv.ultimo_mensaje.asunto}
                      </Text>
                      <Text fontSize="sm" color="fg.muted" truncate>
                        {conv.ultimo_mensaje.cuerpo}
                      </Text>
                    </>
                  )}
                </Box>
              </Flex>
                </StaggerContainer.Item>
              )
            })}
          </StaggerContainer>
        ) : (
          <Flex align="center" justify="center" py={12} color="fg.muted">
            <Text fontSize="sm">No se encontraron conversaciones</Text>
          </Flex>
        )}
      </Box>
    </Flex>
  )

  /* ── Chat view ── */
  const chatView = selectedUserId && partnerInfo ? (
    <Flex direction="column" h="full" bg="bg" position="relative">
      {/* Header */}
      <Flex h="20" px={6} borderBottom="1px solid" borderColor="border.default"
        bg="surface-container-lowest" align="center" justify="space-between" flexShrink={0}
      >
        <Flex align="center" gap={4}>
          <IconButton aria-label="Volver" variant="ghost" display={{ md: 'none' }}
            borderRadius="full" onClick={() => { setSelectedUserId(null); navigate('/inbox', { replace: true }) }}
          >
            <Box as="span" className="material-symbols-outlined" fontSize="20px">arrow_back</Box>
          </IconButton>
          <Avatar label={partnerInfo?.email || '?'} size={12} color="tertiary-container" textColor="on-tertiary-container" />
          <Box>
            <Text textStyle="body-lg" fontWeight="bold" color="fg">
              {partnerInfo?.email || 'Usuario'}
            </Text>
            <Text fontSize="sm" color="fg.muted">{partnerInfo?.rol || ''}</Text>
          </Box>
        </Flex>
      </Flex>

      {/* Messages */}
      <Flex ref={messagesContainerRef} flex={1} direction="column" overflowY="auto" px={6} py={4} gap={5}>
        {messagesLoading ? (
          <Flex justify="center" py={10}><Spinner /></Flex>
        ) : messages.length > 0 ? (
          Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
            <Box key={dateLabel}>
              <Flex justify="center" mb={4}>
                <Box bg="surface-variant" color="fg.muted" fontSize="xs" fontWeight="semibold"
                  px={3} py={1} borderRadius="full"
                >
                  {dateLabel}
                </Box>
              </Flex>
              <StaggerContainer>
                {msgs.map((msg) => {
                  const isMe = msg.emisor?.id === myId
                  return (
                    <StaggerContainer.Item key={msg.id}>
                      <Flex gap={3}
                    maxW={{ base: 'full', md: '75%', lg: '60%' }}
                    alignSelf={isMe ? 'flex-end' : 'flex-start'}
                    direction={isMe ? 'row-reverse' : 'row'} mb={3}
                  >
                    <Avatar
                      label={isMe ? (user?.email || 'Tú') : (partnerInfo?.email || '?')}
                      size={8}
                      color={isMe ? 'primary-container' : 'tertiary-container'}
                      textColor={isMe ? 'on-primary-container' : 'on-tertiary-container'}
                    />
                    <Box
                      bg={isMe ? 'primary-container' : 'surface-container-low'}
                      p={4} borderRadius="2xl"
                      borderTopLeftRadius={isMe ? '2xl' : 'sm'}
                      borderTopRightRadius={isMe ? 'sm' : '2xl'}
                      shadow="card"
                    >
                      <Text fontSize="sm" fontWeight="bold" color="fg" mb={1}>{msg.asunto}</Text>
                      <Text fontSize="md" color="fg" whiteSpace="pre-line">{msg.cuerpo}</Text>
                      <Text fontSize="xs" color="fg.muted" textAlign={isMe ? 'left' : 'right'} mt={2}>
                        {formatTime(msg.created_at)}
                        {isMe && (
                          <Box as="span" ml={2}>{msg.leido ? '✓✓ Leído' : '✓ Enviado'}</Box>
                        )}
                      </Text>
                    </Box>
                  </Flex>
                    </StaggerContainer.Item>
                  )
                })}
              </StaggerContainer>
            </Box>
          ))
        ) : (
          <Flex align="center" justify="center" flex={1}>
            <Text color="fg.muted">Sin mensajes en esta conversación</Text>
          </Flex>
        )}
        <div ref={messagesEndRef} />
      </Flex>

      {/* Reply area */}
      <Box px={6} py={4} bg="surface-container-lowest"
        borderTop="1px solid" borderColor="border.default" flexShrink={0}
      >
        <Box maxW="4xl" mx="auto">
          <Input
            placeholder="Asunto (opcional)"
            value={replySubject}
            onChange={(e) => setReplySubject(e.target.value)}
            borderRadius="full" mb={2} borderColor="border.default" bg="bg"
          />
          <Flex gap={3} align="flex-end" bg="surface-variant" borderRadius="2xl" p={2}
            border="1px solid" borderColor="border.default"
            _focusWithin={{ borderColor: 'primary', ring: 1, ringColor: 'primary' }}
          >
            <Box
              as="textarea"
              placeholder="Escribe tu respuesta aquí..."
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              rows={2} w="full" bg="transparent" border="none" p={2}
              resize="none" fontFamily="body" fontSize="md" color="fg" outline="none"
              _placeholder={{ color: 'fg.muted', opacity: 0.6 }}
            />
            <Button
              borderRadius="xl" bg="primary" color="white" fontWeight="bold"
              _hover={{ bg: 'primary-container' }} _active={{ transform: 'scale(0.97)' }}
              fontSize="sm" px={5} py={3} h="auto"
              _hover={{ bg: 'primary-container' }}
              onClick={handleSend}
              loading={sending}
              disabled={!replyBody.trim()}
            >
              Responder
            </Button>
          </Flex>
        </Box>
      </Box>
    </Flex>
  ) : (
    <Flex align="center" justify="center" h="full" bg="bg" display={{ base: 'none', md: 'flex' }}>
      <Box textAlign="center" color="fg.muted">
        <Box as="span" className="material-symbols-outlined" fontSize="48px" display="block" mb={3}>chat</Box>
        <Text fontSize="lg" fontWeight="medium">Selecciona una conversación</Text>
        <Text fontSize="sm" mt={1}>Elige un chat del panel izquierdo para empezar</Text>
      </Box>
    </Flex>
  )

  /* ── New message dialog ── */
  const newMsgDialog = (
    <AnimatePresence>
      {showNewMsg && (
        <Box
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          position="fixed" inset={0}
          css={{ background: 'rgba(0, 0, 0, 0.4)' }}
          zIndex={200}
          display="flex" alignItems="center" justifyContent="center" p={4}
          onClick={() => setShowNewMsg(false)}
        >
          <Box
            as={motion.div}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            bg="bg" borderRadius="xl" p={6} maxW="480px" w="full" shadow="xl"
            onClick={(e) => e.stopPropagation()}
          >
        <Text textStyle="heading-md" color="fg" mb={4}>Nuevo Mensaje</Text>
        <VStack gap={3}>
          <Box w="full">
            <Text textStyle="label-md" color="fg.muted" mb={1}>Destinatario *</Text>
            <NativeSelect.Root size="lg">
              <NativeSelect.Field
                value={newRecipientId}
                placeholder="Seleccionar destinatario"
                onChange={(e) => setNewRecipientId(e.target.value)}
              >
                {conversations.map(c => (
                  <option key={c.usuario?.id} value={c.usuario?.id}>
                    {c.usuario?.email} ({c.usuario?.rol})
                  </option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>
          <Box w="full">
            <Text textStyle="label-md" color="fg.muted" mb={1}>Asunto *</Text>
            <Input placeholder="Ej: Consulta sobre tarea" value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)} borderRadius="full" borderColor="border.default" bg="bg"
            />
          </Box>
          <Box w="full">
            <Text textStyle="label-md" color="fg.muted" mb={1}>Mensaje *</Text>
            <Box
              as="textarea"
              placeholder="Escribí tu mensaje..."
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={4} w="full" borderRadius="xl" p={3} border="1px solid" borderColor="border.default" bg="bg"
              resize="none" fontFamily="body" fontSize="md" color="fg" outline="none"
              _focus={{ ring: 2, ringColor: 'primary-container' }}
              _placeholder={{ color: 'fg.muted' }}
            />
          </Box>
        </VStack>
        <Flex justify="flex-end" gap={3} mt={4}>
          <Button variant="ghost" borderRadius="full" onClick={() => setShowNewMsg(false)}>Cancelar</Button>
          <Button borderRadius="full" bg="primary" color="white"
            _hover={{ bg: 'primary-container' }}
            _active={{ transform: 'scale(0.97)' }}
            onClick={handleNewMessage} loading={sending}
          >
            Enviar
          </Button>
        </Flex>
      </Box>
    </Box>
    )}
    </AnimatePresence>
  )

  /* ── Main layout ── */
  return (
    <>
      <FeedbackBanner feedback={feedback} />
      {error && (
        <Box px={6} py={2} bg="error-container" color="on-error-container" borderRadius="md" mx={6} mt={2}>
          <Text fontSize="sm">{error}</Text>
        </Box>
      )}
      <Flex h={{ base: 'calc(100vh - 64px)', md: 'calc(100vh - 64px)' }}
        overflow="hidden" borderRadius="xl" bg="bg" border="1px solid" borderColor="border.default" shadow="card"
      >
        <Box w={{ base: 'full', md: '360px', lg: '400px' }}
          borderRight="1px solid" borderColor="border.default" flexShrink={0}
          display={{ base: selectedUserId ? 'none' : 'flex', md: 'flex' }}
          flexDir="column" bg="surface-container-lowest"
        >
          {inboxPanel}
        </Box>
        <Box flex={1} display={{ base: selectedUserId ? 'flex' : 'none', md: 'flex' }} flexDir="column" minW={0}>
          {chatView}
        </Box>
      </Flex>
      {newMsgDialog}
    </>
  )
}
