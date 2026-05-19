import { useState } from 'react'
import { Box, Flex, Text, Button, IconButton } from '@chakra-ui/react'

/* ── mock data ── */

const AVATARS = {
  carlos: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQ7GgTsuILX1zS0Gx9Fd97xFndmbNrig2nQk75jrJDn8iRROvoUJ797z0J47MursWoWmhvZSFAiUPPljM_wGj1E3pKV7HiE5IjaCmyfDQC2eYVuWwJf1_fFs4r_91gox7eT9a8qSzANfwznrHze8pg0R7zEyk-goxSNUWZq-NIctCEluWyWiAqnIdlrHQdimGYMLtm_ej8FLgklVj9Tyrd3yxoc7qgUs-mL-hRpl7b_LCDq8HqNeDEVOG2WHzLYtnwDWFuycP7ASE',
  ana: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5PtB4lTE8UWU8EEMcpKeKrcuzGlv0lTo8xNlb4rDY298Z1C2ixUOfNBgQ_FwMZ0kOFbOUrrRntt1yjB4acUWa6YpcuGWPk3hgIp3k0ONYT4q9aWTzaq7e8FhzMzDbKS61S-3pXfq1JdOZ4lbjw-ORHAYlEIJskYScw14ryF1AC8w0HWH6ZUI9bTnNDa9V-q66ELdEHGSZ-6Eewp04vvCkq9-b22R505_yKa_lBC8dadijbEaCW49MN6gQL1bsDEYcc3hMb16MYgw',
  maria_numeral: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBT1dwHTNGlX1n0BtfdV6-Bza_IHxqwKhcuiVdfdRYNeBYRJAdP0cu_2LrY21YNZwaQgZ_eamVY_nEm-UDrn_jmsoYm5H0605ULKUZL3PE0RVvIMjGLFzPvJt4rkFJL4AfOn2yRufdwOCMPCrJhri7okvDNOCBqT2m_SKHMIslIl80A_jXxerT2VoTwlfG8zFSko7TFxONYV4CCzEzWWkwG7i_YT9ycV-q0xcFLy6m5BcK_1-GnPn7vM39F1UQPHXCzFI-6GaVp5uk',
}

const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    name: 'Carlos Gómez',
    role: 'Padre de Lucas Gómez (3º B)',
    avatar: AVATARS.carlos,
    unread: true,
    lastMessage: 'Hola, quería saber si es necesario...',
    subject: 'Consulta sobre excursión a...',
    timestamp: '10:42 AM',
    dateLabel: 'Hoy',
    badge: null,
    messages: [
      { id: 'm1', sender: 'carlos', text: 'Hola, buen día. Quería saber si es necesario que los chicos lleven almuerzo para la excursión del próximo viernes al museo de ciencias, o si está incluido en el costo que abonamos.\n\nMuchas gracias.', time: '10:42 AM', subject: 'Consulta sobre excursión al museo' },
    ],
  },
  {
    id: 'conv-2',
    name: 'Ana Martínez',
    role: 'Madre de Sofía Martínez (5º A)',
    avatar: AVATARS.ana,
    unread: false,
    lastMessage: 'Gracias por avisar, le enviaré el...',
    subject: 'Falta de asistencia - Sofía...',
    timestamp: 'Ayer',
    dateLabel: 'Ayer',
    badge: null,
    messages: [
      { id: 'm2', sender: 'ana', text: 'Hola, quería informar que Sofía no podrá asistir a clases mañana por una consulta médica. ¿Necesito presentar algún justificativo?', time: '4:15 PM' },
      { id: 'm3', sender: 'me', text: 'Hola Ana, gracias por avisar. Sí, por favor traiga el certificado médico cuando la llevé al control. Que se mejore Sofía.', time: '4:30 PM' },
      { id: 'm4', sender: 'ana', text: 'Gracias por avisar, le enviaré el certificado en cuanto tengamos el turno.', time: '4:32 PM' },
    ],
  },
  {
    id: 'conv-3',
    name: 'María Fernández',
    role: 'Madre de Valentina Fernández (2º C)',
    avatar: null,
    initial: 'M',
    unread: false,
    lastMessage: 'Confirmamos nuestra asistencia para el...',
    subject: 'Reunión de padres',
    timestamp: 'Lun, 12 Oct',
    dateLabel: '12 Oct',
    badge: 'respondido',
    messages: [
      { id: 'm5', sender: 'maria', text: 'Buenas tardes, quería confirmar nuestra asistencia a la reunión de padres del próximo jueves. Asistiremos los dos padres. ¿A qué hora exactamente comienza?', time: '3:00 PM' },
      { id: 'm6', sender: 'me', text: 'Hola María, confirmamos su asistencia. La reunión comienza a las 18:30 hs en el aula de Valentina. ¡Los esperamos!', time: '3:45 PM' },
      { id: 'm7', sender: 'maria', text: 'Confirmamos nuestra asistencia para el jueves. Muchas gracias por la confirmación.', time: '4:00 PM' },
    ],
  },
]

const MOCK_ME = {
  name: 'Tú',
  avatar: null,
  initial: 'T',
}

/* ── helper components ── */

function AvatarImg({ src, name, size = 12 }) {
  if (src) {
    return (
      <Box
        as="img"
        src={src}
        alt={name}
        w={size}
        h={size}
        borderRadius="full"
        objectFit="cover"
        flexShrink={0}
      />
    )
  }
  return null
}

function AvatarPlaceholder({ initial, color = 'tertiary-container', textColor = 'on-tertiary-container', size = 12 }) {
  return (
    <Flex
      w={size}
      h={size}
      borderRadius="full"
      bg={color}
      color={textColor}
      align="center"
      justify="center"
      fontWeight="bold"
      fontSize={typeof size === 'number' && size >= 10 ? 'lg' : 'sm'}
      flexShrink={0}
    >
      {initial}
    </Flex>
  )
}

function formatTime(dateStr) {
  // just return as-is for mock data
  return dateStr
}

/* ── main page ── */

export default function InboxPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [replyText, setReplyText] = useState('')

  const filtered = MOCK_CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const activeConv = MOCK_CONVERSATIONS.find((c) => c.id === selectedId)

  const handleSelect = (id) => {
    setSelectedId(id)
  }

  const handleBack = () => {
    setSelectedId(null)
  }

  /* ── inbox sidebar ── */
  const inboxPanel = (
    <Flex direction="column" h="full" overflow="hidden">
      {/* header */}
      <Box px={5} pt={5} pb={4} borderBottom="1px solid" borderColor="outline-variant" bg="surface-container-low">
        <Text textStyle="heading-md" color="on-surface" mb={4}>
          Mensajes
        </Text>
        <Box position="relative">
          <Box
            as="span"
            className="material-symbols-outlined"
            position="absolute"
            left={4}
            top="50%"
            transform="translateY(-50%)"
            color="on-surface-variant"
            fontSize="20px"
            pointerEvents="none"
          >
            search
          </Box>
          <Box
            as="input"
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            w="full"
            pl={12}
            pr={4}
            py={3}
            bg="surface-variant"
            border="none"
            borderRadius="full"
            fontFamily="body"
            fontSize="md"
            outline="none"
            transition="all 0.2s ease-out"
            _focus={{
              bg: 'surface-container-lowest',
              boxShadow: '0 0 0 2px #ab3500',
            }}
            sx={{
              '&::placeholder': { color: '#594139', opacity: 0.6 },
            }}
          />
        </Box>
      </Box>

      {/* conversation list */}
      <Box flex={1} overflowY="auto">
        {filtered.map((conv) => {
          const isActive = selectedId === conv.id
          return (
            <Flex
              key={conv.id}
              px={5}
              py={3.5}
              borderBottom="1px solid"
              borderColor="outline-variant"
              bg={isActive ? 'secondary-container' : conv.unread ? 'surface-container-lowest' : 'transparent'}
              cursor="pointer"
              transition="background 0.15s ease"
              _hover={{ bg: isActive ? 'secondary-container' : 'surface-variant' }}
              onClick={() => handleSelect(conv.id)}
              gap={3}
              align="flex-start"
              position="relative"
            >
              {/* unread dot */}
              {conv.unread && (
                <Box
                  position="absolute"
                  left={3}
                  top={6}
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg="primary"
                  flexShrink={0}
                />
              )}

              {/* avatar */}
              {conv.avatar ? (
                <AvatarImg src={conv.avatar} name={conv.name} size={12} />
              ) : (
                <AvatarPlaceholder initial={conv.initial} size={12} />
              )}

              {/* content */}
              <Box flex={1} minW={0} ml={conv.unread ? 0 : 0}>
                <Flex justify="space-between" align="baseline" mb={0.5}>
                  <Text
                    textStyle="label-md"
                    fontWeight={conv.unread ? 'bold' : 'normal'}
                    color="on-surface"
                    truncate
                  >
                    {conv.name}
                  </Text>
                  <Text
                    fontSize="xs"
                    fontWeight={conv.unread ? 'semibold' : 'normal'}
                    color={conv.unread ? 'primary' : 'on-surface-variant'}
                    whiteSpace="nowrap"
                    ml={2}
                  >
                    {conv.timestamp}
                  </Text>
                </Flex>

                {conv.badge ? (
                  <Flex align="center" gap={2} mb={0.5}>
                    <Box
                      as="span"
                      fontSize="10px"
                      fontWeight="bold"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      bg="#e8f5e9"
                      color="#2e7d32"
                      px={2}
                      py={0.5}
                      borderRadius="sm"
                    >
                      {conv.badge}
                    </Box>
                    <Text fontSize="sm" color="on-surface-variant" truncate>
                      {conv.subject}
                    </Text>
                  </Flex>
                ) : (
                  <Text
                    fontSize="sm"
                    fontWeight={conv.unread ? 'semibold' : 'normal'}
                    color={conv.unread ? 'on-surface' : 'on-surface-variant'}
                    truncate
                    mb={0.5}
                  >
                    {conv.subject}
                  </Text>
                )}

                <Text fontSize="sm" color="on-surface-variant" truncate>
                  {conv.lastMessage}
                </Text>
              </Box>
            </Flex>
          )
        })}

        {filtered.length === 0 && (
          <Flex align="center" justify="center" py={12} color="on-surface-variant">
            <Text fontSize="sm">No se encontraron conversaciones</Text>
          </Flex>
        )}
      </Box>
    </Flex>
  )

  /* ── chat view ── */
  const chatView = activeConv ? (
    <Flex direction="column" h="full" bg="surface" position="relative">
      {/* chat header */}
      <Flex
        h="20"
        px={6}
        borderBottom="1px solid"
        borderColor="outline-variant"
        bg="surface-container-lowest"
        align="center"
        justify="space-between"
        flexShrink={0}
      >
        <Flex align="center" gap={4}>
          {/* back button mobile */}
          <IconButton
            aria-label="Volver"
            variant="ghost"
            display={{ md: 'none' }}
            borderRadius="full"
            onClick={handleBack}
          >
            <Box as="span" className="material-symbols-outlined" fontSize="20px">
              arrow_back
            </Box>
          </IconButton>

          {activeConv.avatar ? (
            <AvatarImg src={activeConv.avatar} name={activeConv.name} size={12} />
          ) : (
            <AvatarPlaceholder initial={activeConv.initial} size={12} />
          )}
          <Box>
            <Text textStyle="body-lg" fontWeight="bold" color="on-surface">
              {activeConv.name}
            </Text>
            <Text fontSize="sm" color="on-surface-variant">
              {activeConv.role}
            </Text>
          </Box>
        </Flex>
        <IconButton aria-label="Más opciones" variant="ghost" borderRadius="full">
          <Box as="span" className="material-symbols-outlined" fontSize="20px">
            more_vert
          </Box>
        </IconButton>
      </Flex>

      {/* messages */}
      <Flex flex={1} direction="column" overflowY="auto" px={6} py={4} gap={5}>
        {/* date separator */}
        <Flex justify="center">
          <Box
            bg="surface-variant"
            color="on-surface-variant"
            fontSize="xs"
            fontWeight="semibold"
            fontFamily="body"
            px={3}
            py={1}
            borderRadius="full"
          >
            {activeConv.dateLabel}
          </Box>
        </Flex>

        {activeConv.messages.map((msg) => {
          const isMe = msg.sender === 'me'
          const senderData = isMe
            ? MOCK_ME
            : activeConv
          return (
            <Flex
              key={msg.id}
              gap={3}
              maxW={{ base: 'full', md: '75%', lg: '60%' }}
              alignSelf={isMe ? 'flex-end' : 'flex-start'}
              direction={isMe ? 'row-reverse' : 'row'}
            >
              {senderData.avatar ? (
                <AvatarImg src={senderData.avatar} name={senderData.name} size={8} />
              ) : (
                <AvatarPlaceholder
                  initial={senderData.initial}
                  color={isMe ? 'primary-container' : 'tertiary-container'}
                  textColor={isMe ? 'on-primary-container' : 'on-tertiary-container'}
                  size={8}
                />
              )}
              <Box
                bg={isMe ? 'primary-container' : 'surface-container-lowest'}
                p={4}
                borderRadius="2xl"
                borderTopLeftRadius={isMe ? '2xl' : 'sm'}
                borderTopRightRadius={isMe ? 'sm' : '2xl'}
                boxShadow="warm-ambient"
              >
                {msg.subject && (
                  <Text fontSize="sm" fontWeight="bold" color="on-surface" mb={1}>
                    {msg.subject}
                  </Text>
                )}
                <Text fontSize="md" color="on-surface" whiteSpace="pre-line">
                  {msg.text}
                </Text>
                <Text
                  fontSize="xs"
                  color="on-surface-variant"
                  textAlign={isMe ? 'left' : 'right'}
                  mt={2}
                >
                  {msg.time}
                </Text>
              </Box>
            </Flex>
          )
        })}
      </Flex>

      {/* reply area */}
      <Box
        px={6}
        py={4}
        bg="surface-container-lowest"
        borderTop="1px solid"
        borderColor="outline-variant"
        flexShrink={0}
      >
        <Flex
          maxW="4xl"
          mx="auto"
          gap={3}
          align="flex-end"
          bg="surface-variant"
          borderRadius="2xl"
          p={2}
          border="1px solid"
          borderColor="outline-variant"
          transition="all 0.2s ease-out"
          sx={{
            '&:focus-within': {
              borderColor: 'primary',
              boxShadow: '0 0 0 1px #ab3500',
            },
          }}
        >
          <IconButton
            aria-label="Adjuntar archivo"
            variant="ghost"
            borderRadius="full"
            color="on-surface-variant"
            _hover={{ color: 'primary' }}
          >
            <Box as="span" className="material-symbols-outlined" fontSize="20px">
              attach_file
            </Box>
          </IconButton>
          <Box
            as="textarea"
            placeholder="Escribe tu respuesta aquí..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            w="full"
            bg="transparent"
            border="none"
            p={2}
            resize="none"
            fontFamily="body"
            fontSize="md"
            color="on-surface"
            outline="none"
            sx={{
              '&::placeholder': { color: '#594139', opacity: 0.6 },
            }}
          />
          <Button
            borderRadius="xl"
            bg="linear-gradient(135deg, #ff6b35, #f7b32b)"
            color="white"
            fontWeight="bold"
            fontSize="sm"
            px={5}
            py={3}
            h="auto"
            _hover={{ opacity: 0.9 }}
            transition="all 0.2s ease-out"
            rightIcon={
              <Box as="span" className="material-symbols-outlined" fontSize="16px">
                send
              </Box>
            }
            onClick={() => {
              if (replyText.trim()) {
                // TODO: send message via API
                setReplyText('')
              }
            }}
          >
            Responder
          </Button>
        </Flex>
      </Box>
    </Flex>
  ) : (
    <Flex align="center" justify="center" h="full" bg="surface" display={{ base: 'none', md: 'flex' }}>
      <Box textAlign="center" color="on-surface-variant">
        <Box as="span" className="material-symbols-outlined" fontSize="48px" display="block" mb={3}>
          chat
        </Box>
        <Text fontSize="lg" fontWeight="medium">
          Selecciona una conversación
        </Text>
        <Text fontSize="sm" mt={1}>
          Elige un chat del panel izquierdo para empezar
        </Text>
      </Box>
    </Flex>
  )

  /* ── main layout ── */
  return (
    <Flex
      h={{ base: 'calc(100vh - 64px)', md: 'calc(100vh - 64px)' }}
      overflow="hidden"
      borderRadius="xl"
      bg="surface"
      border="1px solid"
      borderColor="outline-variant"
      boxShadow="warm-ambient"
    >
      {/* inbox sidebar — hidden on mobile when a chat is selected */}
      <Box
        w={{ base: 'full', md: '360px', lg: '400px' }}
        borderRight="1px solid"
        borderColor="outline-variant"
        flexShrink={0}
        display={{ base: selectedId ? 'none' : 'flex', md: 'flex' }}
        flexDir="column"
        bg="surface-container-lowest"
      >
        {inboxPanel}
      </Box>

      {/* chat area — full width on mobile when selected */}
      <Box
        flex={1}
        display={{ base: selectedId ? 'flex' : 'none', md: 'flex' }}
        flexDir="column"
        minW={0}
      >
        {chatView}
      </Box>
    </Flex>
  )
}
