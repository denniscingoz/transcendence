import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useRealtime } from '../realtime/RealtimeProvider'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '../components/BottomNav'

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

  const { t } = useTranslation()

  return (
      //  <div className="h-[calc(100dvh-250px)] overflow-hidden bg-white">
      // {/* <main className="mx-auto h-full max-w-2xl px-4 py-6"> */}
      //   {/* <div className="panel flex h-[85%] flex-col overflow-hidden"> */}

    <div className="flex h-[calc(100dvh-250px)] items-center justify-center bg-white p-4">
  <div className="mx-auto h-full w-full max-w-8xl py-6">
    <div className="panel flex h-[85%] w-full gap-4">
        {/* Sidebar Panel */}
        <aside className="w-l bg-gray-300 rounded-2xl flex flex-col">
          <h2 className="text-base font-bold text-text mb-2">{t('chat.chats')}</h2>
          
          {/* Search Input */}
          <div className="relative mb-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('chat.searchUsers')}
              className="input w-full text-xs"
            />

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-32 overflow-y-auto">
                {searchResults.map(user => (
                  <button
                    key={user.id}
                    onClick={() => void handleCreateDirectConversationFromSearch(user.id)}
                    className="block w-full text-left px-2 py-1 border-b border-gray-100 hover:bg-gray-100 transition-colors text-xs"
                  >
                    <div className="font-medium text-gray-900">{user.username}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

          {/* Conversations List */}
          <div className="space-y-0.5 flex-1 min-h-0 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-gray-600 text-center py-2 text-xs">{t('chat.selectConversation')}</p>
            ) : (
              conversations.map(conversation => {
                const isOnline = onlineUserIds.includes(conversation.targetUserId)

                return (
                  <button
                    key={conversation.id}
                    onClick={() => void openConversation(conversation.id)}
                    className={`w-full text-left p-1.5 rounded-lg transition-all ${
                      conversation.id === activeConversationId
                        ? 'bg-gray-400 border border-gray-500'
                        : 'bg-gray-200 hover:bg-gray-250'
                    }`}
                  >
                    {/* User with avatar */}
                    <div className="flex items-center gap-1.5">
                      <img
                        src={
                          conversation?.targetUserAvatarUrl ? `${import.meta.env.VITE_API_BASE_URL}${conversation.targetUserAvatarUrl}` : 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'
                        }
                        onError={(event) => {
                          event.currentTarget.src = 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'
                        }}
                        alt={conversation.targetUserName}
                        className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate text-xs">{conversation.targetUserName}</div>
                        <div className="text-xs text-gray-600 truncate">{conversation.lastMessage || t('chat.noMessagesYet')}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ring-1 ring-gray-300 ${
                            isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Main Chat Area Panel */}
        <main className="flex-1 flex flex-col bg-gray-300 rounded-2xl p-3 min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0 bg-white rounded-lg mb-1.5">
            {loadingChats && (
              <div className="text-center py-2 text-gray-500 text-xs">{t('common.loading')}</div>
            )}

            {!activeConversationId && !loadingChats && (
              <div className="text-center py-2 text-gray-500 text-xs">{t('chat.selectConversation')}</div>
            )}

            {loadingMessages && (
              <div className="text-center py-2 text-gray-500 text-xs">{t('chat.loadingMessages')}</div>
            )}

            {!loadingMessages &&
              messages.map(message => {
                const isMine = message.senderId === currentUserId

                return (
                  <div
                    key={message.messageId}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-1.5 py-0.5 rounded-lg text-xs ${
                        isMine
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <div>{message.content}</div>

                      <div className={`text-xs mt-0.5 ${isMine ? 'text-blue-100' : 'text-gray-600'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      {isMine && (
                        <div className={`text-xs mt-0.5 ${isMine ? 'text-blue-100' : 'text-gray-600'}`}>
                          {message.isReadByOthers
                            ? t('chat.read')
                            : deliveredMessageIds.includes(message.messageId)
                              ? t('chat.delivered')
                              : t('chat.sent')}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-lg p-1.5 flex-shrink-0">
            <div className="flex gap-1">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSend()
                  }
                }}
                placeholder={t('chat.typeMessage')}
                className="input flex-1 text-xs"
              />
              <button
                onClick={() => void handleSend()}
                disabled={sending || !text.trim() || !currentUserId}
                className="btn-primary px-2 py-1 text-xs disabled:opacity-50"
              >
                {sending ? t('common.loading') : t('chat.send')}
              </button>
            </div>
          </div>
        </main>
      </div>

      <BottomNav active="messages" />
    </div>
    </div>
  )
}