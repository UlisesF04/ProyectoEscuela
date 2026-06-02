import { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, Text, Button, VStack, HStack, Input, Avatar, Heading,
  Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, useToast, Spinner, Center, Icon,
} from '@chakra-ui/react';
import {
  FiMessageSquare, FiSend, FiPlus, FiChevronRight, FiTrash2,
} from 'react-icons/fi';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { loadChats(); }, []);

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
    } catch (err) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'No se pudo crear el chat',
        status: 'error', duration: 3000, isClosable: true, position: 'top-right',
      });
    }
  };

  const handleDeleteChat = async (chat) => {
    const confirmed = window.confirm(
      `¿Eliminar conversación con ${chat.participant.name}? Solo se eliminará para vos, el otro usuario seguirá viéndola.`
    );
    if (!confirmed) return;

    try {
      await chatService.deleteChat(chat.id);
      setChats((prev) => prev.filter((c) => c.id !== chat.id));
      if (selectedChat?.id === chat.id) {
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
    }
  };

  return (
    <Box h="calc(100vh - 48px)" display="flex" flexDirection="column">
      <Heading as="h1" size="lg" mb={4} fontFamily="heading">
        Chat Interno
      </Heading>

      <Flex flex={1} gap={4} minH={0}>
        {/* Sidebar de conversaciones */}
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

        {/* Área del chat */}
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
      </Flex>

      {/* Modal Nuevo Chat */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent borderRadius="card">
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
    </Box>
  );
}
