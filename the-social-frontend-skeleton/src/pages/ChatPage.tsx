import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useRealtime } from '../realtime/RealtimeProvider'

import {
  createDirectConversation,
  getConversations,
  getMessages,
  joinConversation,
  leaveConversation,
  markAsRead,
  markAsDelivered,
  sendMessage,
  searchUsers,
  type ChatMessageDto,
  type ConversationDto,
  type MessageAckDto,
  type MessageDeliveredDto,
  type MessageReadDto,
} from '../api/chat.api'

type NotificationType = 1 | 2 | 3 | 4 | 5

type NotificationDto = {
  id: string
  type: NotificationType
  payload: ChatMessageDto
  createdAt: string
}

function playSystemBeep() {
  try {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    gain.gain.value = 0.05

    oscillator.connect(gain)
    gain.connect(audioContext.destination)

    oscillator.start()

    setTimeout(() => {
      oscillator.stop()
      void audioContext.close()
    }, 120)
  } catch (err) {
    console.error('Failed to play sound', err)
  }
}

function publishUnreadCount(nextConversations: ConversationDto[]) {
  const unreadCount = nextConversations.reduce(
    (sum, item) => sum + (item.unreadCount ?? 0),
    0
  )

  window.dispatchEvent(new CustomEvent('chat-unread-changed', { detail: unreadCount }))
}

export function ChatPage() {
  const { user } = useAuth()
  const { connection, isConnected } = useRealtime()
  const currentUserId = user?.id ?? null

  const messagesRef = useRef<ChatMessageDto[]>([])
  const activeConversationIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const [conversations, setConversations] = useState<ConversationDto[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [creatingDirect, setCreatingDirect] = useState(false)
  const [targetUserIdInput, setTargetUserIdInput] = useState('')
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([])
  const [deliveredMessageIds, setDeliveredMessageIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
const [searchResults, setSearchResults] = useState<{ id: string; username: string }[]>([])   

async function handleCreateDirectConversationFromSearch(targetUserId: string) {
  if (!currentUserId) return

  try {
    const result = await createDirectConversation(currentUserId, targetUserId)

    setSearch('')
    setSearchResults([])

    await loadConversations()
    await openConversation(result.conversationId)
  } catch (err) {
    console.error('Failed to create chat', err)
  }
}
  async function loadConversations() {
    if (!currentUserId) return []

    setLoadingChats(true)
    setError(null)

    try {
      const data = await getConversations(currentUserId)
      setConversations(data)
      publishUnreadCount(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
      return []
    } finally {
      setLoadingChats(false)
    }
  }

  async function loadConversationMessages(conversationId: string) {
    if (!currentUserId) return

    setLoadingMessages(true)
    setError(null)

    try {
      const data = await getMessages(currentUserId, conversationId)
      setMessages(data)
      setDeliveredMessageIds([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }

  async function openConversation(conversationId: string) {
    try {
      if (!connection) {
        throw new Error('Chat connection is not initialized')
      }

      if (
        activeConversationIdRef.current &&
        activeConversationIdRef.current !== conversationId
      ) {
        await leaveConversation(connection, activeConversationIdRef.current)
      }

      await joinConversation(connection, conversationId)

      activeConversationIdRef.current = conversationId
      setActiveConversationId(conversationId)

      await loadConversationMessages(conversationId)

      if (!document.hidden) {
        await markAsRead(connection, conversationId)
        await loadConversations()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open conversation')
    }
  }
  

async function handleCreateDirectConversation() {
  if (!currentUserId) return

  const targetUserId = targetUserIdInput.trim()
  if (!targetUserId) return

  setCreatingDirect(true)
  setError(null)

  try {
    const result = await createDirectConversation(currentUserId, targetUserId)

    const updatedConversations = await loadConversations()

    const createdConversationExists = updatedConversations.some(
      item => item.id === result.conversationId
    )

    if (!createdConversationExists) {
      setConversations(prev => {
        const exists = prev.some(item => item.id === result.conversationId)
        if (exists) return prev

        return [
          {
            id: result.conversationId,
            targetUserId,
            targetUserName: targetUserId,
            lastMessage: '',
            lastMessageAt: null,
            unreadCount: 0,
          },
          ...prev,
        ]
      })
    }

    await openConversation(result.conversationId)
    setTargetUserIdInput('')
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create direct conversation')
  } finally {
    setCreatingDirect(false)
  }
}

  async function handleSend() {
    if (!connection) return
    if (!activeConversationId) return
    if (!text.trim()) return
    if (!currentUserId) return

    setSending(true)
    setError(null)

    const trimmedText = text.trim()
    const clientMessageId = crypto.randomUUID()

    const optimisticMessage: ChatMessageDto = {
      messageId: clientMessageId,
      clientMessageId,
      conversationId: activeConversationId,
      senderId: currentUserId,
      content: trimmedText,
      createdAt: new Date().toISOString(),
      isReadByUser: false,
      isReadByOthers: false,
    }

    setMessages(prev => [...prev, optimisticMessage])
    setText('')

    try {
      await sendMessage(connection, {
        conversationId: activeConversationId,
        clientMessageId,
        content: trimmedText,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')

      setMessages(prev =>
        prev.filter(message => message.clientMessageId !== clientMessageId)
      )
    } finally {
      setSending(false)
    }
  }

  async function syncActiveConversationReadState() {
    if (!connection) return
    if (!activeConversationIdRef.current) return
    if (document.hidden) return

    try {
      await markAsRead(connection, activeConversationIdRef.current)

      setConversations(prev =>
        prev.map(item =>
          item.id === activeConversationIdRef.current
            ? { ...item, unreadCount: 0 }
            : item
        )
      )

      await loadConversations()
    } catch (err) {
      console.error('Failed to sync read state', err)
    }
  }

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    function handleVisibilityChange() {
      if (!document.hidden) {
        void syncActiveConversationReadState()
      }
    }

    function handleWindowFocus() {
      void syncActiveConversationReadState()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [connection])

 useEffect(() => {
  if (!connection || !currentUserId) return

  async function reloadConversations() {
    try {
      const data = await getConversations(currentUserId!)
      setConversations(data)
      publishUnreadCount(data)
    } catch (err) {
      console.error('Failed to reload conversations', err)
    }
  }

  const handleMessageReceived = (message: ChatMessageDto) => {
    console.log('MessageReceived', message)

    const isActive = message.conversationId === activeConversationIdRef.current
    const isMine = message.senderId === currentUserId

    if (isMine) {
      return
    }

    void markAsDelivered(
      connection,
      message.messageId,
      message.conversationId,
      message.senderId
    ).catch(err => console.error('Failed to mark as delivered', err))

    if (isActive) {
      setMessages(prev => {
        const exists = prev.some(item => item.messageId === message.messageId)
        if (exists) return prev
        return [...prev, message]
      })
    }

    if (isActive && !document.hidden) {
      void markAsRead(connection, message.conversationId)
        .then(() => reloadConversations())
        .catch(err => console.error('Failed to mark as read after receiving message', err))
    } else {
      void reloadConversations()
    }
  }

  const handleMessageAck = (ack: MessageAckDto) => {
    console.log('MessageAck', ack)

    setMessages(prev =>
      prev.map(message =>
        message.clientMessageId === ack.clientMessageId
          ? {
              ...message,
              messageId: ack.messageId,
              createdAt: ack.createdAt,
            }
          : message
      )
    )
  }

  const handleMessageDelivered = (payload: MessageDeliveredDto) => {
    console.log('MessageDelivered', payload)

    const isMyMessage = messagesRef.current.some(
      item => item.messageId === payload.messageId && item.senderId === currentUserId
    )

    if (!isMyMessage) return

    setDeliveredMessageIds(prev => {
      if (prev.includes(payload.messageId)) return prev
      return [...prev, payload.messageId]
    })
  }

  const handleConversationsChanged = () => {
    void reloadConversations()
  }

  const handleNotificationReceived = (notification: NotificationDto) => {
    console.log('NotificationReceived', notification)

    const message = notification.payload
    const isMyOwnMessage = message.senderId === currentUserId
    const isActiveConversation = message.conversationId === activeConversationIdRef.current

    if (isMyOwnMessage) return

    if (!isActiveConversation || document.hidden) {
      playSystemBeep()
    }

    void reloadConversations()
  }

  const handleMessageRead = (payload: MessageReadDto) => {
    console.log('MessageRead', payload)

    if (payload.conversationId === activeConversationIdRef.current) {
      setMessages(prev =>
        prev.map(item =>
          item.messageId === payload.messageId && item.senderId === currentUserId
            ? { ...item, isReadByOthers: true }
            : item
        )
      )
    }
  }

  const handleOnlineUsersSnapshot = (users: string[]) => {
    console.log('OnlineUsersSnapshot', users)
    setOnlineUserIds(users)
  }

  const handleUserOnline = (payload: { userId: string }) => {
    console.log('UserOnLine', payload)

    const userId = payload.userId

    setOnlineUserIds(prev => {
      if (prev.includes(userId)) return prev
      return [...prev, userId]
    })
  }

  const handleUserOffline = (payload: { userId: string }) => {
    console.log('UserOffLine', payload)

    const userId = payload.userId

    setOnlineUserIds(prev => prev.filter(id => id !== userId))
  }

  const handleReconnected = async () => {
    try {
      if (activeConversationIdRef.current) {
        await joinConversation(connection, activeConversationIdRef.current)
      }
      await reloadConversations()
    } catch (err) {
      console.error('Failed after reconnect', err)
    }
  }

  const handleClose = () => {
    console.log('Chat connection closed')
    setOnlineUserIds([])
  }

  connection.on('MessageReceived', handleMessageReceived)
  connection.on('MessageAck', handleMessageAck)
  connection.on('MessageDelivered', handleMessageDelivered)
  connection.on('ConversationsChanged', handleConversationsChanged)
  connection.on('NotificationReceived', handleNotificationReceived)
  connection.on('MessageRead', handleMessageRead)
  connection.on('OnlineUsersSnapshot', handleOnlineUsersSnapshot)
  connection.on('UserOnLine', handleUserOnline)
  connection.on('UserOffLine', handleUserOffline)
  connection.onreconnected(handleReconnected)
  connection.onclose(handleClose)

  return () => {
    connection.off('MessageReceived', handleMessageReceived)
    connection.off('MessageAck', handleMessageAck)
    connection.off('MessageDelivered', handleMessageDelivered)
    connection.off('ConversationsChanged', handleConversationsChanged)
    connection.off('NotificationReceived', handleNotificationReceived)
    connection.off('MessageRead', handleMessageRead)
    connection.off('OnlineUsersSnapshot', handleOnlineUsersSnapshot)
    connection.off('UserOnLine', handleUserOnline)
    connection.off('UserOffLine', handleUserOffline)
  }
}, [connection, currentUserId])


useEffect(() => {
  if (!currentUserId || !connection || !isConnected) return

  let isMounted = true

  async function init() {
    try {
      setLoadingChats(true)
      setError(null)

      const list = await getConversations(currentUserId!)
      if (!isMounted) return

      setConversations(list)
      publishUnreadCount(list)

      if (list.length > 0) {
        await openConversation(list[0].id)
      } else {
        setActiveConversationId(null)
        activeConversationIdRef.current = null
        setMessages([])
      }
    } catch (err) {
      if (!isMounted) return
      setError(err instanceof Error ? err.message : 'Failed to initialize chat')
    } finally {
      if (isMounted) {
        setLoadingChats(false)
      }
    }
  }

  void init()

  return () => {
    isMounted = false
  }
}, [currentUserId, connection, isConnected])
 
useEffect(() => {
  // Проверяем, есть ли запрос
  if (!search.trim()) {
    setSearchResults([])
    return
  }

  const timeout = setTimeout(async () => {
    try {
      // ПЕРЕДАЕМ ОБЪЕКТ
      const results = await searchUsers({
        query: search,
        take: 20,
        cursor: null
      })
      
      setSearchResults(results)
    } catch (err) {
      console.error('Search failed', err)
      setSearchResults([]) // Очищаем результаты при ошибке
    }
  }, 300)

  return () => clearTimeout(timeout)
}, [search]) // currentUserId здесь больше не нужен, если api.get сам шлет токены

  useEffect(() => {     
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside
        style={{
          width: '320px',
          borderRight: '1px solid #ddd',
          padding: '16px',
          overflowY: 'auto',
        }}
      >
        <h2>Chats</h2>
        
 
<div style={{ marginBottom: '12px', position: 'relative' }}> 
  <input
    value={search}
    onChange={e => setSearch(e.target.value)}
    placeholder="Search users..."
    style={{
      width: '100%',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '8px',
    }}
  />

        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => void handleCreateDirectConversationFromSearch(user.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px',
                  border: 'none',
                  borderBottom: '1px solid #eee',
                  background: 'white',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                {user.username}
              </button>
            ))}
          </div>
        )}
      </div>

          
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
  

        </div>

        {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}

        <div style={{ marginTop: '16px' }}>
          {conversations.map(conversation => {
            const isOnline = onlineUserIds.includes(conversation.targetUserId)

            return (
              <button
                key={conversation.id}
                onClick={() => void openConversation(conversation.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: '8px',
                  padding: '12px',
                  border:
                    conversation.id === activeConversationId
                      ? '2px solid black'
                      : '1px solid #ccc',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    marginBottom: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: isOnline ? '#22c55e' : '#9ca3af',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span>{conversation.targetUserName}</span>
                </div>

                <div style={{ fontSize: '13px', color: '#555' }}>
                  {conversation.lastMessage || 'No messages yet'}
                </div>

                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  unread: {conversation.unreadCount}
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            background: '#fafafa',
          }}
        >
          {!activeConversationId && <p>Select a conversation</p>}
          {loadingMessages && <p>Loading messages...</p>}

          {!loadingMessages &&
            messages.map(message => {
              const isMine = message.senderId === currentUserId

              return (
                <div
                  key={message.messageId}
                  style={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid #ddd',
                      background: 'white',
                    }}
                  >
                    <div>{message.content}</div>

                    <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                      {new Date(message.createdAt).toLocaleString()}
                    </div>

                    {isMine && (
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                        {message.isReadByOthers
                          ? 'Read'
                          : deliveredMessageIds.includes(message.messageId)
                            ? 'Delivered'
                            : 'Sent'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #ddd',
            display: 'flex',
            gap: '8px',
          }}
        >
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '10px' }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={sending || !text.trim() || !currentUserId}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </main>
    </div>
  )
}