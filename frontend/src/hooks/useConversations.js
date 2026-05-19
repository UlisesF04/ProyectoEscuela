import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

/**
 * Fetch conversations for the current user on mount.
 * Also provides helpers for fetching messages and sending new ones.
 *
 * Returns {
 *   conversations, conversationsLoading,
 *   messages, messagesLoading,
 *   partner, error,
 *   fetchMessages, sendMessage, markAsRead,
 *   refetchConversations
 * }
 */
export function useConversations() {
  const [conversations, setConversations] = useState([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [partner, setPartner] = useState(null)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    loadConversations()
    return () => { mountedRef.current = false }
  }, [])

  const loadConversations = async () => {
    setConversationsLoading(true)
    try {
      const { data } = await api.get('/communication/conversations')
      if (mountedRef.current) setConversations(data.conversaciones || [])
    } catch (err) {
      if (mountedRef.current) setError(err.response?.data?.message || 'Error al cargar conversaciones')
    } finally {
      if (mountedRef.current) setConversationsLoading(false)
    }
  }

  const fetchMessages = async (userId) => {
    if (!userId) return
    setMessagesLoading(true)
    try {
      const { data } = await api.get(`/communication/conversations/${userId}/messages`)
      const freshMessages = data.messages || []
      if (mountedRef.current) {
        setMessages(freshMessages)
        setPartner(data.partner || null)
      }
      return freshMessages
    } catch (err) {
      if (mountedRef.current) setError(err.response?.data?.message || 'Error al cargar mensajes')
    } finally {
      if (mountedRef.current) setMessagesLoading(false)
    }
  }

  const sendMessage = async ({ receptor_id, asunto, cuerpo }) => {
    const { data } = await api.post('/communication/messages', { receptor_id, asunto, cuerpo })
    return data
  }

  const markAsRead = async (messageId) => {
    await api.put(`/communication/messages/${messageId}/read`)
  }

  return {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    partner,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
    refetchConversations: loadConversations,
  }
}
