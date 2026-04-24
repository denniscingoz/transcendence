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

function publishUnreadCount(nextConversations: ConversationDto[]) {
  const unreadCount = nextConversations.reduce(
    (sum, item) => sum + (item.unreadCount ?? 0),
    0
  )

  window.dispatchEvent(new CustomEvent('chat-unread-changed', { detail: unreadCount }))
}

export function ChatPage() {
  const { user } = useAuth()
  const { connection, isConnected, onlineUserIds } = useRealtime()
  const currentUserId = user?.id ?? null

  const messagesRef = useRef<ChatMessageDto[]>([])
  const activeConversationIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesRequestIdRef = useRef(0)
  const shouldScrollToBottomRef = useRef(false)

  const [conversations, setConversations] = useState<ConversationDto[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [deliveredMessageIds, setDeliveredMessageIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; username: string }[]>([])

  const [messagesOffset, setMessagesOffset] = useState(0)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false)

  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  
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

    setError(null)

    try {
      const data = await getConversations(currentUserId)
      setConversations(data)
      publishUnreadCount(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
      return []
    }
  }

async function loadConversationMessages(conversationId: string) {
  if (!currentUserId) return

  const requestId = ++messagesRequestIdRef.current
  setLoadingMessages(true)
  setError(null)

  try {
    const limit = 20
    const data = await getMessages(currentUserId, conversationId, 0, limit)

    if (requestId !== messagesRequestIdRef.current) {
      return
    }

    if (activeConversationIdRef.current !== conversationId) {
      return
    }
    shouldScrollToBottomRef.current = true
    setMessages(data)
    setMessagesOffset(data.length)
    setHasMoreMessages(data.length === limit)
    setDeliveredMessageIds([])
  } catch (err) {
    if (requestId !== messagesRequestIdRef.current) {
      return
    }

    setError(err instanceof Error ? err.message : 'Failed to load messages')
  } finally {
    if (requestId === messagesRequestIdRef.current) {
      setLoadingMessages(false)
    }
  }
}

async function loadOlderMessages() {
  if (!currentUserId) return
  if (!activeConversationIdRef.current) return
  if (loadingOlderMessages) return
  if (!hasMoreMessages) return

  const container = messagesContainerRef.current
  if (!container) return

  const conversationId = activeConversationIdRef.current
  const previousScrollHeight = container.scrollHeight
  const previousScrollTop = container.scrollTop

  setLoadingOlderMessages(true)

  try {
    const limit = 20
    const olderMessages = await getMessages(
      currentUserId,
      conversationId,
      messagesOffset,
      limit
    )

    if (activeConversationIdRef.current !== conversationId) {
      return
    }

    if (olderMessages.length === 0) {
      setHasMoreMessages(false)
      return
    }

    setMessages(prev => [...olderMessages, ...prev])
    setMessagesOffset(prev => prev + olderMessages.length)
    setHasMoreMessages(olderMessages.length === limit)

    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight
      const delta = newScrollHeight - previousScrollHeight
      container.scrollTop = previousScrollTop + delta
    })
  } catch (err) {
    console.error('Failed to load older messages', err)
  } finally {
    setLoadingOlderMessages(false)
  }
}

async function openConversation(conversationId: string) {
  try {
    if (!connection) {
      throw new Error('Chat connection is not initialized')
    }

    activeConversationIdRef.current = conversationId
    setActiveConversationId(conversationId)
    setMessages([])
    setDeliveredMessageIds([])

    window.dispatchEvent(
      new CustomEvent('active-chat-changed', {
        detail: { conversationId },
      })
    )

    await joinConversation(connection, conversationId)
    await loadConversationMessages(conversationId)

    if (!document.hidden) {
      await markAsRead(connection, conversationId)
      await loadConversations()
      window.dispatchEvent(new CustomEvent('notifications-visual-refresh'))
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to open conversation')
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

    
    shouldScrollToBottomRef.current = true
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

  const activeConversationId = activeConversationIdRef.current

  if (!activeConversationId) return
  if (document.hidden) return

  try {
    await markAsRead(connection, activeConversationId)

    setConversations(prev =>
      prev.map(item =>
        item.id === activeConversationId
          ? { ...item, unreadCount: 0 }
          : item
      )
    )

    await loadConversations()
    window.dispatchEvent(new CustomEvent('notifications-visual-refresh'))
  } catch (err) {
    console.error('Failed to sync read state', err)
  }
}
useEffect(() => {
  const container = messagesContainerRef.current
  if (!container) return

  function handleScroll() {
    if (!container) return
    if (container.scrollTop <= 80) {
      void loadOlderMessages()
    }
  }

  container.addEventListener('scroll', handleScroll)

  return () => {
    container.removeEventListener('scroll', handleScroll)
  }
}, [loadingOlderMessages, hasMoreMessages, messagesOffset, currentUserId])


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

   if (!currentUserId) return
        try {
        const data = await getConversations(currentUserId)
        setConversations(data)
        publishUnreadCount(data)
      } catch (err) {
        console.error('Failed to reload conversations', err)
      }
    }

    const handleMessageReceived = (message: ChatMessageDto) => {
      const isActive = message.conversationId === activeConversationIdRef.current
      const isMine = message.senderId === currentUserId

      if (isMine) return

      void markAsDelivered(
        connection,
        message.messageId,
        message.conversationId,
        message.senderId
      ).catch(err => console.error('Failed to mark as delivered', err))

      if (isActive) {
        shouldScrollToBottomRef.current = true

        setMessages(prev => {
          const exists = prev.some(item => item.messageId === message.messageId)
          if (exists) return prev
          return [...prev, message]
        })
      }

      if (isActive && !document.hidden) {
        void markAsRead(connection, message.conversationId)
          .then(async () => {
            await reloadConversations()
            window.dispatchEvent(new CustomEvent('notifications-visual-refresh'))
          })
          .catch(err => console.error('Failed to mark as read after receiving message', err))
      } else {
        void reloadConversations()
      }
    }

    const handleMessageAck = (ack: MessageAckDto) => {
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

  setDeliveredMessageIds(prev => {
    if (prev.includes(payload.messageId)) return prev
    return [...prev, payload.messageId]
  })
}

    const handleConversationsChanged = () => {
      void reloadConversations()
    }

    const handleMessageRead = (payload: MessageReadDto) => {
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

    const handleReconnected = async () => {
      try {
        const activeConversationId = activeConversationIdRef.current

        if (activeConversationId) {
          await joinConversation(connection, activeConversationId)
          await loadConversationMessages(activeConversationId)
        }

        await reloadConversations()
      } catch (err) {
        console.error('Failed after reconnect', err)
      }
    }

    connection.on('MessageReceived', handleMessageReceived)
    connection.on('MessageAck', handleMessageAck)
    connection.on('MessageDelivered', handleMessageDelivered)
    connection.on('ConversationsChanged', handleConversationsChanged)
    connection.on('MessageRead', handleMessageRead)
    connection.onreconnected(handleReconnected)

    return () => {
      connection.off('MessageReceived', handleMessageReceived)
      connection.off('MessageAck', handleMessageAck)
      connection.off('MessageDelivered', handleMessageDelivered)
      connection.off('ConversationsChanged', handleConversationsChanged)
      connection.off('MessageRead', handleMessageRead)
    }
  }, [connection, currentUserId])

  useEffect(() => {
    if (!currentUserId || !connection || !isConnected) return

    let isMounted = true

    async function init() {
        if (!currentUserId) return
      try {
        setError(null)

        const list = await getConversations(currentUserId)
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
      }
    }

    void init()

    return () => {
      isMounted = false
    }
  }, [currentUserId, connection, isConnected])

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const results = await searchUsers({
          query: search,
          take: 20,
          cursor: null,
        })

        setSearchResults(results)
      } catch (err) {
        console.error('Search failed', err)
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [search])

useEffect(() => {
  if (!shouldScrollToBottomRef.current) return

  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  shouldScrollToBottomRef.current = false
}, [messages])

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent('active-chat-changed', {
          detail: { conversationId: null },
        })
      )
    }
  }, [])

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
            <div
              style={{
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
                overflowY: 'auto',
              }}
            >
              {searchResults.map(userItem => (
                <button
                  key={userItem.id}
                  onClick={() => void handleCreateDirectConversationFromSearch(userItem.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px',
                    border: 'none',
                    borderBottom: '1px solid #eee',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  {userItem.username}
                </button>
              ))}
            </div>
          )}
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
          ref={messagesContainerRef}
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            background: '#fafafa',
          }}
        >
          {!activeConversationId && <p>Select a conversation</p>}
          {loadingMessages && <p>Loading messages...</p>}

        {loadingOlderMessages && (
          <p style={{ textAlign: 'center', color: '#888', marginBottom: '12px' }}>
            Loading older messages...
          </p>
        )}
        
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
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void handleSend()
            }
          }}
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