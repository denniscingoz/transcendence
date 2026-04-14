import { useEffect, useRef, useState } from 'react'
import type { HubConnection } from '@microsoft/signalr'
import { useAuth } from '../auth/AuthContext'

import {
  createChatConnection,
  createDirectConversation,
  getConversations,
  getMessages,
  joinConversation,
  leaveConversation,
  markAsRead,
  markAsDelivered,
  sendMessage,
  startConnection,
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
  const currentUserId = user?.id ?? null
  const messagesRef = useRef<ChatMessageDto[]>([])

  console.log('CHAT user', user)
  console.log('CHAT currentUserId', currentUserId)

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

  const connectionRef = useRef<HubConnection | null>(null)
  const activeConversationIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

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
    if (!connectionRef.current) {
      throw new Error('Chat connection is not initialized')
    }

    if (
      activeConversationIdRef.current &&
      activeConversationIdRef.current !== conversationId
    ) {
      await leaveConversation(connectionRef.current, activeConversationIdRef.current)
    }

    await joinConversation(connectionRef.current, conversationId)

    activeConversationIdRef.current = conversationId
    setActiveConversationId(conversationId)

    await loadConversationMessages(conversationId)

    if (!document.hidden) {
      await markAsRead(connectionRef.current, conversationId)
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

    await openConversation(result.conversationId)

    setTargetUserIdInput('')
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create direct conversation')
  } finally {
    setCreatingDirect(false)
  }
}

  async function setupSignalR() {
    console.log('setupSignalR called')
    if (!currentUserId) return



      if (connectionRef.current) {
        if (
          connectionRef.current.state === 'Connected' ||
          connectionRef.current.state === 'Connecting'
        ) {
          console.log('SignalR already exists, skip creating')
          return
        }
      }

        const connection = createChatConnection(currentUserId)
    connectionRef.current = connection
    console.log('creating new SignalR connection')

connection.on('MessageReceived', (message: ChatMessageDto) => {
  console.log('MessageReceived', message)

  const isActive = message.conversationId === activeConversationIdRef.current
  const isMine = message.senderId === currentUserId

  if (isMine) {
    return
  }

  if (connectionRef.current) {
    void markAsDelivered(
      connectionRef.current,
      message.messageId,
      message.conversationId,
      message.senderId
    ).catch(err => console.error('Failed to mark as delivered', err))
  }

  if (isActive) {
    setMessages(prev => {
      const exists = prev.some(item => item.messageId === message.messageId)
      if (exists) return prev
      return [...prev, message]
    })
  }

  if (isActive && !document.hidden && connectionRef.current) {
    void markAsRead(connectionRef.current, message.conversationId)
      .then(() => loadConversations())
      .catch(err => console.error('Failed to mark as read after receiving message', err))
  } else {
    void loadConversations()
  }
})


connection.on('MessageAck', (ack: MessageAckDto) => {
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
})
connection.on('MessageDelivered', (payload: MessageDeliveredDto) => {
  console.log('MessageDelivered', payload)

  const isMyMessage = messagesRef.current.some(
    item => item.messageId === payload.messageId && item.senderId === currentUserId
  )

  if (!isMyMessage) return

  setDeliveredMessageIds(prev => {
    if (prev.includes(payload.messageId)) return prev
    return [...prev, payload.messageId]
  })
})
  connection.on('ConversationsChanged', () => {
    void loadConversations()
  })

  connection.on('NotificationReceived', (notification: NotificationDto) => {
    console.log('NotificationReceived', notification)

    const message = notification.payload
    const isMyOwnMessage = message.senderId === currentUserId
    const isActiveConversation = message.conversationId === activeConversationIdRef.current

    if (isMyOwnMessage) return

    if (!isActiveConversation || document.hidden) {
      playSystemBeep()
    }

    void loadConversations()
  })

connection.on('MessageRead', (payload: MessageReadDto) => {
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
})
    connection.on('OnlineUsersSnapshot', (users: string[]) => {
      console.log('OnlineUsersSnapshot', users)
      setOnlineUserIds(users)
    })

    connection.on('UserOnLine', payload => {
      console.log('UserOnLine', payload)

      const userId = payload.userId as string

      setOnlineUserIds(prev => {
        if (prev.includes(userId)) return prev
        return [...prev, userId]
      })
    })

    connection.on('UserOffLine', payload => {
      console.log('UserOffLine', payload)

      const userId = payload.userId as string

      setOnlineUserIds(prev => prev.filter(id => id !== userId))
    })

 
    connection.onreconnected(async () => {
      try {
        if (activeConversationIdRef.current) {
          await joinConversation(connection, activeConversationIdRef.current)
        }

        
      } catch (err) {
        console.error('Failed after reconnect', err)
      }
    })
    connection.onclose(() => {
    console.log('Chat connection closed')
    setOnlineUserIds([])
  })
    await startConnection(connection)
    console.log('SignalR started')
  }

async function handleSend() {
  if (!connectionRef.current) return
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
    await sendMessage(connectionRef.current, {
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
    if (!connectionRef.current) return
    if (!activeConversationIdRef.current) return
    if (document.hidden) return

    try {
      await markAsRead(connectionRef.current, activeConversationIdRef.current)

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
  }, [])

  useEffect(() => {
    if (!currentUserId) return

    let isMounted = true

    async function init() {
      try {
        await setupSignalR()
        if (!isMounted) return

      const list = await loadConversations()
      if (!isMounted) return

      if (list.length > 0) {
        setActiveConversationId(list[0].id)
        activeConversationIdRef.current = list[0].id
      }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize chat')
      }
    }

    void init()

    return () => {
      isMounted = false

      const conn = connectionRef.current
      connectionRef.current = null

      if (conn) {
        console.log('cleanup ChatPage, stopping connection')
        void conn.stop()
      }
    }
  }, [currentUserId])

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
        <p>User: {currentUserId ?? 'Not loaded'}</p>

        <button onClick={() => void loadConversations()} disabled={loadingChats || !currentUserId}>
          {loadingChats ? 'Refreshing...' : 'Refresh chats'}
        </button>

        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <input
            value={targetUserIdInput}
            onChange={e => setTargetUserIdInput(e.target.value)}
            placeholder="Target user id"
            style={{ padding: '10px' }}
          />
          <button
            onClick={() => void handleCreateDirectConversation()}
            disabled={creatingDirect || !targetUserIdInput.trim() || !currentUserId}
          >
            {creatingDirect ? 'Creating...' : 'Create direct chat'}
          </button>
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