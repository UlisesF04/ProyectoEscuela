import { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, Text, Button, VStack, HStack, Input, Avatar, Heading,
  Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton,   useDisclosure, useToast, Spinner, Center, Icon, useBreakpointValue,
} from '@chakra-ui/react';
import {
  FiMessageSquare, FiSend, FiPlus, FiChevronRight, FiTrash2, FiArrowLeft, FiSearch,
} from 'react-icons/fi';
import ConfirmDialog from '../../components/ConfirmDialog';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

const roleColors = {
  admin: 'purple.400',
  preceptor: 'teal.400',
  docente: 'orange.400',
};

const roleLabels = {
  admin: 'Admin',
  preceptor: 'Preceptor',
  docente: 'Docente',
};

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const messagesEndRef = useRef(null);
  const { user: currentUser } = useAuth();
  const [mobileView, setMobileView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deletingChat, setDeletingChat] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => {
    loadChats();
    chatService.getAvailableUsers()
      .then(users => setAvailableUsers(users || []))
      .catch(() => setAvailableUsers([]));
  }, []);

  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const data = await chatService.getMyChats();
      setChats(data || []);
    } catch { setChats([]); }
    finally { setLoadingChats(false); }
  };

  const selectChat = async (chat) => {
    setSelectedChat(chat);
    if (isMobile) setMobileView('chat');
    setLoadingMessages(true);
    try {
      const data = await chatService.getChatMessages(chat.id);
      setMessages(data || []);
    } catch { setMessages([]); }
    finally { setLoadingMessages(false); }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    setSending(true);
    try {
      const msg = await chatService.sendMessage(selectedChat.id, newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      setChats((prev) =>
        prev.map((c) =>
          c.id === selectedChat.id
            ? { ...c, last_message: msg.content.substring(0, 100), last_message_at: msg.created_at }
            : c
        )
      );
    } catch (err) {
      toast({
        title: 'Error al enviar',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 3000, isClosable: true, position: 'top-right',
      });
    } finally { setSending(false); }
  };

  const handleNewChat = async () => {
    onOpen();
    try {
      const users = await chatService.getAvailableUsers();
      setAvailableUsers(users || []);
    } catch { setAvailableUsers([]); }
  };

  const existingChatWith = (userId) =>
    chats.find((c) => c.participant.id === userId);

  const handleUserClick = async (user) => {
    const existing = existingChatWith(user.id);
    if (existing) {
      onClose();
      selectChat(existing);
      if (isMobile) setMobileView('chat');
      return;
    }
    try {
      const { chat } = await chatService.createChat(user.id);
      onClose();
      await loadChats();
      const newChat = {
        id: chat.id,
        participant: { id: user.id, name: user.name, role: user.role },
        last_message: null,
        last_message_at: null,
      };
      setSelectedChat(newChat);
      setMessages([]);
      if (isMobile) setMobileView('chat');
    } catch (err) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'No se pudo crear el chat',
        status: 'error', duration: 3000, isClosable: true, position: 'top-right',
      });
    }
  };

  const handleDeleteChat = (chat) => {
    setDeletingChat(chat);
    setDeleteAlertOpen(true);
  };

  const confirmDeleteChat = async () => {
    if (!deletingChat) return;
    try {
      await chatService.deleteChat(deletingChat.id);
      setChats((prev) => prev.filter((c) => c.id !== deletingChat.id));
      if (selectedChat?.id === deletingChat.id) {
        setSelectedChat(null);
        setMessages([]);
      }
      toast({
        title: 'Chat eliminado',
        status: 'success', duration: 2000, isClosable: true, position: 'top-right',
      });
    } catch (err) {
      toast({
        title: 'Error al eliminar',
        description: err?.response?.data?.message || 'Ocurrió un error',
        status: 'error', duration: 3000, isClosable: true, position: 'top-right',
      });
    } finally {
      setDeleteAlertOpen(false);
      setDeletingChat(null);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matchingUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !chats.some(c => c.participant.id === user.id)
  );

  return (
    <Box h={isMobile ? "calc(100vh - 100px)" : "calc(100vh - 48px)"} display="flex" flexDirection="column">
      {!isMobile && (
        <Heading as="h1" size="lg" mb={4} fontFamily="heading">
          Chat Interno
        </Heading>
      )}

      <Flex flex={1} gap={4} minH={0}>
        {!isMobile ? (
          <>
            {/* Sidebar de conversaciones - desktop */}
            <Box
              w="280px"
              flexShrink={0}
              bg="white"
              borderRadius="card"
              boxShadow="warmSm"
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <Flex p={3} borderBottom="1px solid" borderColor="gray.100" justify="space-between" align="center">
                <Text fontSize="sm" fontWeight={600} color="onSurfaceVariant">
                  Conversaciones
                </Text>
                <Button
                  size="sm"
                  leftIcon={<FiPlus />}
                  colorScheme="brand"
                  variant="ghost"
                  onClick={handleNewChat}
                  borderRadius="pill"
                >
                  Nuevo Chat
                </Button>
              </Flex>

              <Box flex={1} overflowY="auto">
                {loadingChats ? (
                  <Center py={8}><Spinner size="sm" /></Center>
                ) : chats.length === 0 ? (
                  <Center py={8} px={4} textAlign="center">
                    <Box>
                      <Text fontSize="sm" color="gray.400" mb={2}>Sin conversaciones</Text>
                      <Button size="xs" leftIcon={<FiPlus />} colorScheme="brand" variant="outline" onClick={handleNewChat} borderRadius="pill">
                        Iniciar chat
                      </Button>
                    </Box>
                  </Center>
                ) : (
                  <VStack spacing={0} align="stretch">
                    {chats.map((chat) => (
                      <Flex
                        key={chat.id}
                        p={3}
                        cursor="pointer"
                        bg={selectedChat?.id === chat.id ? 'brand.50' : 'transparent'}
                        _hover={{ bg: 'gray.50' }}
                        onClick={() => selectChat(chat)}
                        align="center"
                        gap={3}
                        borderBottom="1px solid"
                        borderColor="gray.50"
                      >
                        <Avatar
                          size="sm"
                          name={chat.participant.name}
                          bg={roleColors[chat.participant.role] || 'gray.400'}
                        />
                        <Box flex={1} minW={0}>
                          <Text fontSize="sm" fontWeight={500} isTruncated>
                            {chat.participant.name}
                          </Text>
                          {chat.last_message && (
                            <Text fontSize="xs" color="gray.400" isTruncated>
                              {chat.last_message}
                            </Text>
                          )}
                        </Box>
                        <Icon as={FiChevronRight} boxSize={4} color="gray.300" />
                      </Flex>
                    ))}
                  </VStack>
                )}
              </Box>
            </Box>

            {/* Área del chat - desktop */}
            <Box
              flex={1}
              bg="white"
              borderRadius="card"
              boxShadow="warmSm"
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              {!selectedChat ? (
                <Center flex={1}>
                  <Box textAlign="center" color="gray.400">
                    <Icon as={FiMessageSquare} boxSize={10} mb={3} />
                    <Text fontSize="sm">Seleccioná una conversación</Text>
                  </Box>
                </Center>
              ) : (
                <>
                  {/* Header */}
                  <Flex
                    p={4}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    align="center"
                    gap={3}
                  >
                    <Avatar
                      size="sm"
                      name={selectedChat.participant.name}
                      bg={roleColors[selectedChat.participant.role] || 'gray.400'}
                    />
                    <Box>
                      <Text fontSize="sm" fontWeight={600}>{selectedChat.participant.name}</Text>
                      <Text fontSize="xs" color="gray.400">
                        {roleLabels[selectedChat.participant.role] || selectedChat.participant.role}
                      </Text>
                    </Box>
                    <Box ml="auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteChat(selectedChat)}
                        borderRadius="pill"
                        title="Eliminar conversación"
                      >
                        <Icon as={FiTrash2} boxSize={4} />
                      </Button>
                    </Box>
                  </Flex>

                  {/* Messages */}
                  <Box flex={1} overflowY="auto" p={4}>
                    {loadingMessages ? (
                      <Center py={8}><Spinner size="sm" /></Center>
                    ) : messages.length === 0 ? (
                      <Center py={8} color="gray.400">
                        <Text fontSize="sm">No hay mensajes. Iniciá la conversación.</Text>
                      </Center>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {messages.map((msg) => {
                          const isMine = currentUser.id === msg.sender.id;
                          return (
                            <Flex key={msg.id} justify={isMine ? 'flex-end' : 'flex-start'}>
                              <Box
                                maxW="70%"
                                bg={isMine ? '#ffbb3c' : 'gray.100'}
                                color={isMine ? '#1A1A1A' : 'onSurface'}
                                px={4}
                                py={2}
                                borderRadius="lg"
                                borderBottomRightRadius={isMine ? 0 : 'lg'}
                                borderBottomLeftRadius={isMine ? 'lg' : 0}
                              >
                                <Text fontSize="sm">{msg.content}</Text>
                                <Text
                                  fontSize="xs"
                                  mt={1}
                                  opacity={0.7}
                                  color={isMine ? '#1A1A1A' : 'gray.400'}
                                >
                                  {formatTime(msg.created_at)}
                                </Text>
                              </Box>
                            </Flex>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </VStack>
                    )}
                  </Box>

                  {/* Input */}
                  <Flex p={4} borderTop="1px solid" borderColor="gray.100" gap={2}>
                    <Input
                      placeholder="Escribí un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      borderRadius="input"
                      size="md"
                    />
                    <Button
                      onClick={handleSend}
                      isLoading={sending}
                      isDisabled={!newMessage.trim()}
                      colorScheme="brand"
                      borderRadius="pill"
                      px={4}
                    >
                      <Icon as={FiSend} boxSize={4} />
                    </Button>
                  </Flex>
                </>
              )}
            </Box>
          </>
        ) : mobileView === 'list' ? (
          /* --- MOBILE: CONVERSATION LIST VIEW --- */
          <Box flex={1} display="flex" flexDirection="column" bg="white" borderRadius="card" boxShadow="warmSm" overflow="hidden">
            {/* Header */}
            <Flex p={3} borderBottom="1px solid" borderColor="gray.100" justify="space-between" align="center">
              <Text fontSize="md" fontWeight={600}>Chat Interno</Text>
              <Button size="sm" leftIcon={<FiPlus />} colorScheme="brand" variant="ghost" onClick={handleNewChat} borderRadius="pill">
                Nuevo
              </Button>
            </Flex>

            {/* Search bar */}
            <Box px={3} py={2}>
              <Input
                placeholder="Buscar conversaciones o usuarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="sm"
                borderRadius="input"
              />
            </Box>

            {/* Conversation list */}
            <Box flex={1} overflowY="auto">
              {loadingChats ? (
                <Center py={8}><Spinner size="sm" /></Center>
              ) : filteredChats.length > 0 ? (
                <VStack spacing={0} align="stretch">
                  {filteredChats.map((chat) => (
                    <Flex
                      key={chat.id}
                      p={3}
                      cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => {
                        selectChat(chat);
                        setMobileView('chat');
                      }}
                      align="center"
                      gap={3}
                      borderBottom="1px solid" borderColor="gray.50"
                    >
                      <Avatar size="sm" name={chat.participant.name} bg={roleColors[chat.participant.role] || 'gray.400'} />
                      <Box flex={1} minW={0}>
                        <Text fontSize="sm" fontWeight={500} isTruncated>{chat.participant.name}</Text>
                        {chat.last_message && (
                          <Text fontSize="xs" color="gray.400" isTruncated>{chat.last_message}</Text>
                        )}
                      </Box>
                      <Icon as={FiChevronRight} boxSize={4} color="gray.300" />
                    </Flex>
                  ))}
                </VStack>
              ) : (
                <>
                  {chats.length === 0 && matchingUsers.length === 0 ? (
                    <Center py={8} px={4} textAlign="center">
                      <Box>
                        <Text fontSize="sm" color="gray.400" mb={2}>Sin conversaciones</Text>
                        <Button size="xs" leftIcon={<FiPlus />} colorScheme="brand" variant="outline" onClick={handleNewChat} borderRadius="pill">
                          Iniciar chat
                        </Button>
                      </Box>
                    </Center>
                  ) : null}

                  {searchQuery && matchingUsers.length > 0 && (
                    <Box>
                      <Text px={3} py={2} fontSize="xs" fontWeight={600} color="gray.400" textTransform="uppercase">
                        Contactos
                      </Text>
                      <VStack spacing={0} align="stretch">
                        {matchingUsers.map((user) => (
                          <Flex
                            key={user.id}
                            p={3}
                            cursor="pointer"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => handleUserClick(user)}
                            align="center"
                            gap={3}
                            borderBottom="1px solid" borderColor="gray.50"
                          >
                            <Avatar size="sm" name={user.name} bg={roleColors[user.role] || 'gray.400'} />
                            <Box flex={1}>
                              <Text fontSize="sm" fontWeight={500}>{user.name}</Text>
                              <Text fontSize="xs" color="gray.400">{roleLabels[user.role] || user.role}</Text>
                            </Box>
                            <Text fontSize="xs" color="brand.500" fontWeight={500}>Chatear</Text>
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {searchQuery && matchingUsers.length === 0 && filteredChats.length === 0 && (
                    <Center py={8}>
                      <Text fontSize="sm" color="gray.400">Sin resultados</Text>
                    </Center>
                  )}
                </>
              )}
            </Box>
          </Box>
        ) : (
          /* --- MOBILE: CHAT VIEW (one conversation) --- */
          <>
            {selectedChat ? (
              <Box flex={1} display="flex" flexDirection="column" bg="white" borderRadius="card" boxShadow="warmSm" overflow="hidden">
                {/* Header with back button */}
                <Flex p={3} borderBottom="1px solid" borderColor="gray.100" align="center" gap={3}>
                  <Button
                    variant="ghost"
                    onClick={() => setMobileView('list')}
                    minW="auto"
                    p={1}
                  >
                    <Icon as={FiArrowLeft} boxSize={5} />
                  </Button>
                  <Avatar size="sm" name={selectedChat.participant.name} bg={roleColors[selectedChat.participant.role] || 'gray.400'} />
                  <Box>
                    <Text fontSize="sm" fontWeight={600}>{selectedChat.participant.name}</Text>
                    <Text fontSize="xs" color="gray.400">{roleLabels[selectedChat.participant.role] || selectedChat.participant.role}</Text>
                  </Box>
                  <Box ml="auto">
                    <Button size="sm" variant="ghost" colorScheme="red" onClick={() => handleDeleteChat(selectedChat)} borderRadius="pill" title="Eliminar conversación">
                      <Icon as={FiTrash2} boxSize={4} />
                    </Button>
                  </Box>
                </Flex>

                {/* Messages */}
                <Box flex={1} overflowY="auto" p={4}>
                  {loadingMessages ? (
                    <Center py={8}><Spinner size="sm" /></Center>
                  ) : messages.length === 0 ? (
                    <Center py={8} color="gray.400">
                      <Text fontSize="sm">No hay mensajes. Iniciá la conversación.</Text>
                    </Center>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {messages.map((msg) => {
                        const isMine = currentUser.id === msg.sender.id;
                        return (
                          <Flex key={msg.id} justify={isMine ? 'flex-end' : 'flex-start'}>
                            <Box maxW="70%" bg={isMine ? '#ffbb3c' : 'gray.100'} color={isMine ? '#1A1A1A' : 'onSurface'} px={4} py={2} borderRadius="lg"
                              borderBottomRightRadius={isMine ? 0 : 'lg'} borderBottomLeftRadius={isMine ? 'lg' : 0}>
                              <Text fontSize="sm">{msg.content}</Text>
                              <Text fontSize="xs" mt={1} opacity={0.7} color={isMine ? '#1A1A1A' : 'gray.400'}>{formatTime(msg.created_at)}</Text>
                            </Box>
                          </Flex>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </VStack>
                  )}
                </Box>

                {/* Input */}
                <Flex p={3} borderTop="1px solid" borderColor="gray.100" gap={2}>
                  <Input placeholder="Escribí un mensaje..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    borderRadius="input" size="md" />
                  <Button onClick={handleSend} isLoading={sending} isDisabled={!newMessage.trim()} colorScheme="brand" borderRadius="pill" px={4}>
                    <Icon as={FiSend} boxSize={4} />
                  </Button>
                </Flex>
              </Box>
            ) : (
              /* No chat selected on mobile */
              <Box flex={1} display="flex" alignItems="center" justifyContent="center" bg="white" borderRadius="card" boxShadow="warmSm">
                <Box textAlign="center" color="gray.400">
                  <Icon as={FiMessageSquare} boxSize={10} mb={3} />
                  <Text fontSize="sm">Seleccioná una conversación</Text>
                </Box>
              </Box>
            )}
          </>
        )}
      </Flex>

      {/* Nuevo Chat Modal - same for both mobile and desktop */}
      <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "md"}>
        <ModalOverlay />
        <ModalContent borderRadius={isMobile ? 0 : "card"}>
          <ModalHeader fontFamily="heading">Nuevo Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            {availableUsers.length === 0 ? (
              <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                No hay usuarios disponibles para chatear
              </Text>
            ) : (
              <VStack spacing={2} align="stretch">
                {availableUsers.map((user) => (
                  <Flex
                    key={user.id}
                    p={3}
                    borderRadius="input"
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => handleUserClick(user)}
                    align="center"
                    gap={3}
                  >
                    <Avatar
                      size="sm"
                      name={user.name}
                      bg={roleColors[user.role] || 'gray.400'}
                    />
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight={500}>{user.name}</Text>
                      <Text fontSize="xs" color="gray.400">
                        {roleLabels[user.role] || user.role}
                      </Text>
                    </Box>
                    {existingChatWith(user.id) && (
                      <Text fontSize="xs" color="brand.500" fontWeight={500}>
                        Chat existente
                      </Text>
                    )}
                  </Flex>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        isOpen={deleteAlertOpen}
        onClose={() => { setDeleteAlertOpen(false); setDeletingChat(null); }}
        onConfirm={confirmDeleteChat}
        title="Eliminar conversación"
        message={
          deletingChat
            ? `¿Eliminar conversación con ${deletingChat.participant.name}? Solo se eliminará para vos, el otro usuario seguirá viéndola.`
            : '¿Está seguro?'
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColorScheme="red"
      />
    </Box>
  );
}
