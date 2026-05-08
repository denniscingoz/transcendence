import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useRealtime } from '../realtime/RealtimeProvider'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '../components/BottomNav'
import { Modal } from '../components/Modal'
import { markConversationNotificationsAsRead } from '../api/notifications.api'
import { UnknownProfileAvatar } from '../components/icons/UnknownProfileAvatar'

import {
  createDirectConversation,
  getConversations,
  getMessages,
  joinConversation,
  markAsRead,
  markAsDelivered,
  sendMessage,
  searchUsers,
  deleteMessage,
  deleteConversation,
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
  const { t } = useTranslation()
  const currentUserId = user?.id ?? null

  const messagesRef = useRef<ChatMessageDto[]>([])
  const activeConversationIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const messagesRequestIdRef = useRef(0)
  const shouldScrollToBottomRef = useRef(false)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  const conversationsContainerRef = useRef<HTMLDivElement | null>(null)
  const conversationsOffsetRef = useRef(0)

  const [conversations, setConversations] = useState<ConversationDto[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [deletingMessageIds, setDeletingMessageIds] = useState<string[]>([])
  const [deletingConversationIds, setDeletingConversationIds] = useState<string[]>([])
  const [deliveredMessageIds, setDeliveredMessageIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; username: string }[]>([])

  const [messagesOffset, setMessagesOffset] = useState(0)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false)

  const [conversationsOffset, setConversationsOffset] = useState(0)
  const [hasMoreConversations, setHasMoreConversations] = useState(true)
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false)

  const [draftTargetUserId, setDraftTargetUserId] = useState<string | null>(null)
  const [draftTargetUserName, setDraftTargetUserName] = useState<string | null>(null)
  const [pendingDeleteMessageId, setPendingDeleteMessageId] = useState<string | null>(null)
  const [pendingDeleteConversationId, setPendingDeleteConversationId] = useState<string | null>(null)

  const [failedAvatarIds, setFailedAvatarIds] = useState<Set<string>>(new Set())

  const shouldShowDraft =
    draftTargetUserId &&
    !activeConversationId &&
    !conversations.some(c => c.targetUserId === draftTargetUserId)

  const isDraftTargetOnline =
    draftTargetUserId !== null && onlineUserIds.includes(draftTargetUserId)

  async function loadConversations(reset = true, customLimit?: number) {
    if (!currentUserId) return []

    const pageSize = 20
    const offset = reset ? 0 : conversationsOffsetRef.current
    const limit = customLimit ?? pageSize

    setError(null)

    try {
      const data = await getConversations(currentUserId, offset, limit)

      if (reset) {
        setConversations(data)
        setConversationsOffset(data.length)
        conversationsOffsetRef.current = data.length
        setHasMoreConversations(data.length === limit)
        publishUnreadCount(data)

        return data
      }

      let nextConversations: ConversationDto[] = []

      setConversations(prev => {
        const existingIds = new Set(prev.map(item => item.id))
        const uniqueNewItems = data.filter(item => !existingIds.has(item.id))

        nextConversations = [...prev, ...uniqueNewItems]

        publishUnreadCount(nextConversations)

        return nextConversations
      })

      setConversationsOffset(prev => {
        const nextOffset = prev + data.length
        conversationsOffsetRef.current = nextOffset
        return nextOffset
      })

      setHasMoreConversations(data.length === limit)

      return nextConversations
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
      return []
    }
  }

  async function refreshLoadedConversations() {
    if (!currentUserId) return []

    const pageSize = 20
    const loadedCount = conversationsOffsetRef.current
    const limit = Math.max(loadedCount, pageSize)

    return loadConversations(true, limit)
  }

  async function loadMoreConversations() {
    if (!currentUserId) return
    if (loadingMoreConversations) return
    if (!hasMoreConversations) return

    setLoadingMoreConversations(true)

    try {
      await loadConversations(false)
    } finally {
      setLoadingMoreConversations(false)
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

      if (requestId !== messagesRequestIdRef.current) return
      if (activeConversationIdRef.current !== conversationId) return

      shouldScrollToBottomRef.current = true
      setMessages(data)
      setMessagesOffset(data.length)
      setHasMoreMessages(data.length === limit)
      setDeliveredMessageIds([])
    } catch (err) {
      if (requestId !== messagesRequestIdRef.current) return
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

      if (activeConversationIdRef.current !== conversationId) return

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

      setDraftTargetUserId(null)
      setDraftTargetUserName(null)

      activeConversationIdRef.current = conversationId
      setActiveConversationId(conversationId)
      setMessages([])
      setDeliveredMessageIds([])
      setMessagesOffset(0)
      setHasMoreMessages(true)

      window.dispatchEvent(
        new CustomEvent('active-chat-changed', {
          detail: { conversationId },
        })
      )

      await joinConversation(connection, conversationId)
      await loadConversationMessages(conversationId)

      if (!document.hidden) {
        await markAsRead(connection, conversationId)
        await markConversationNotificationsAsRead(conversationId)
        window.dispatchEvent(new CustomEvent('notifications-visual-refresh'))
        await refreshLoadedConversations()
        window.dispatchEvent(new CustomEvent('notifications-visual-refresh'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open conversation')
    }
  }

  async function handleSend() {
    if (!connection) return
    if (!text.trim()) return
    if (!currentUserId) return

    let conversationId = activeConversationId

    try {
      setSending(true)
      setError(null)

      if (!conversationId) {
        if (!draftTargetUserId) return

        const result = await createDirectConversation(currentUserId, draftTargetUserId)
        conversationId = result.conversationId
        activeConversationIdRef.current = conversationId
        setActiveConversationId(conversationId)
        setDraftTargetUserId(null)
        setDraftTargetUserName(null)

        await joinConversation(connection, conversationId)
      }

      const trimmedText = text.trim()
      const clientMessageId = crypto.randomUUID()

      const optimisticMessage: ChatMessageDto = {
        messageId: clientMessageId,
        clientMessageId,
        conversationId,
        senderId: currentUserId,
        content: trimmedText,
        createdAt: new Date().toISOString(),
        isReadByUser: false,
        isReadByOthers: false,
        isDeleted: false,
      }

      shouldScrollToBottomRef.current = true
      setMessages(prev => [...prev, optimisticMessage])
      setText('')

      await sendMessage(connection, {
        conversationId,
        clientMessageId,
        content: trimmedText,
      })

      await refreshLoadedConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  async function syncActiveConversationReadState() {
    if (!connection) return

    const currentActiveConversationId = activeConversationIdRef.current

    if (!currentActiveConversationId) return
    if (document.hidden) return

    try {
      await markAsRead(connection, currentActiveConversationId)

      setConversations(prev => {
        const next = prev.map(item =>
          item.id === currentActiveConversationId
            ? { ...item, unreadCount: 0 }
            : item
        )
        publishUnreadCount(next)
        return next
      })

      await refreshLoadedConversations()
      window.dispatchEvent(new CustomEvent('notifications-visual-refresh'))
    } catch (err) {
      console.error('Failed to sync read state', err)
    }
  }

  async function handleDeleteMessage(messageId: string) {
    setPendingDeleteMessageId(messageId)
  }

  async function confirmDeleteMessage() {
    const messageId = pendingDeleteMessageId
    if (!messageId) return
    if (!currentUserId) return
    if (!activeConversationIdRef.current) return
    if (deletingMessageIds.includes(messageId)) return

    setPendingDeleteMessageId(null)
    setDeletingMessageIds(prev => [...prev, messageId])
    setError(null)

    try {
      setMessages(prev =>
        prev.map(message =>
          message.messageId === messageId
            ? { ...message, isDeleted: true, content: '🚫 This message was deleted' }
            : message
        )
      )

      await deleteMessage(currentUserId, messageId)
      await refreshLoadedConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message')
      await loadConversationMessages(activeConversationIdRef.current)
    } finally {
      setDeletingMessageIds(prev => prev.filter(id => id !== messageId))
    }
  }

  function cancelDeleteMessage() {
    setPendingDeleteMessageId(null)
  }

  async function handleDeleteConversation(conversationId: string) {
    setPendingDeleteConversationId(conversationId)
  }

  async function confirmDeleteConversation() {
    const conversationId = pendingDeleteConversationId
    if (!conversationId) return
    if (!currentUserId) return
    if (deletingConversationIds.includes(conversationId)) return

    setPendingDeleteConversationId(null)
    const wasActive = activeConversationIdRef.current === conversationId

    setDeletingConversationIds(prev => [...prev, conversationId])
    setError(null)

    try {
      setConversations(prev => {
        const next = prev.filter(item => item.id !== conversationId)
        publishUnreadCount(next)
        return next
      })

      setConversationsOffset(prev => {
        const nextOffset = Math.max(prev - 1, 0)
        conversationsOffsetRef.current = nextOffset
        return nextOffset
      })

      if (wasActive) {
        activeConversationIdRef.current = null
        setActiveConversationId(null)
        setMessages([])
        setDeliveredMessageIds([])
        setMessagesOffset(0)
        setHasMoreMessages(true)

        window.dispatchEvent(
          new CustomEvent('active-chat-changed', {
            detail: { conversationId: null },
          })
        )
      }

      await deleteConversation(currentUserId, conversationId)

      const freshConversations = await refreshLoadedConversations()

      if (wasActive && freshConversations.length > 0) {
        await openConversation(freshConversations[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation')
      await refreshLoadedConversations()
    } finally {
      setDeletingConversationIds(prev => prev.filter(id => id !== conversationId))
    }
  }

  function cancelDeleteConversation() {
    setPendingDeleteConversationId(null)
  }

  function openDraftConversation(targetUserId: string, username: string) {
    activeConversationIdRef.current = null
    setActiveConversationId(null)

    setDraftTargetUserId(targetUserId)
    setDraftTargetUserName(username)

    setMessages([])
    setDeliveredMessageIds([])
    setMessagesOffset(0)
    setHasMoreMessages(false)

    setSearch('')
    setSearchResults([])
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
    const container = conversationsContainerRef.current
    if (!container) return

    function handleScroll() {
      if (!container) return

      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight

      if (distanceToBottom <= 80) {
        void loadMoreConversations()
      }
    }

    container.addEventListener('scroll', handleScroll)

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [
    conversationsOffset,
    hasMoreConversations,
    loadingMoreConversations,
    currentUserId,
  ])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    conversationsOffsetRef.current = conversationsOffset
  }, [conversationsOffset])

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
        await refreshLoadedConversations()
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
            await markConversationNotificationsAsRead(message.conversationId)
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
      setDeliveredMessageIds(prev => {
        if (prev.includes(payload.messageId)) return prev
        return [...prev, payload.messageId]
      })
    }

    const handleMessageDeleted = (payload: { messageId: string }) => {
      setMessages(prev =>
        prev.map(item =>
          item.messageId === payload.messageId
            ? { ...item, isDeleted: true, content: '🚫 This message was deleted' }
            : item
        )
      )

      void reloadConversations()
    }

    const handleConversationDeleted = (payload: { conversationId: string }) => {
      setConversations(prev => {
        const next = prev.filter(item => item.id !== payload.conversationId)
        publishUnreadCount(next)
        return next
      })

      setConversationsOffset(prev => {
        const nextOffset = Math.max(prev - 1, 0)
        conversationsOffsetRef.current = nextOffset
        return nextOffset
      })

      if (activeConversationIdRef.current === payload.conversationId) {
        activeConversationIdRef.current = null
        setActiveConversationId(null)
        setMessages([])
        setDeliveredMessageIds([])
        setMessagesOffset(0)
        setHasMoreMessages(true)

        window.dispatchEvent(
          new CustomEvent('active-chat-changed', {
            detail: { conversationId: null },
          })
        )
      }

      void reloadConversations()
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
        const currentActiveConversationId = activeConversationIdRef.current

        if (currentActiveConversationId) {
          await joinConversation(connection, currentActiveConversationId)
          await loadConversationMessages(currentActiveConversationId)
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
    connection.on('MessageDeleted', handleMessageDeleted)
    connection.on('ConversationDeleted', handleConversationDeleted)
    connection.onreconnected(handleReconnected)

    return () => {
      connection.off('MessageReceived', handleMessageReceived)
      connection.off('MessageAck', handleMessageAck)
      connection.off('MessageDelivered', handleMessageDelivered)
      connection.off('ConversationsChanged', handleConversationsChanged)
      connection.off('MessageRead', handleMessageRead)
      connection.off('MessageDeleted', handleMessageDeleted)
      connection.off('ConversationDeleted', handleConversationDeleted)
    }
  }, [connection, currentUserId])

  useEffect(() => {
    if (!currentUserId || !connection || !isConnected) return

    let isMounted = true

    async function init() {
      if (!currentUserId) return

      try {
        setError(null)

        const list = await loadConversations(true)
        if (!isMounted) return

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

  useEffect(() => {
    if (!activeConversationId || loadingMessages) return

    requestAnimationFrame(() => {
      const container = messagesContainerRef.current

      if (container) {
        container.scrollTop = container.scrollHeight
      }
    })
  }, [activeConversationId, loadingMessages])

  return (
    <div className="flex h-[calc(100dvh-250px)] items-center justify-center bg-white p-4">
      <div className="mx-auto h-full w-full max-w-8xl py-6">
        <div className="panel flex h-[85%] w-full gap-4">
          <aside className="w-l bg-gray-300 rounded-2xl flex flex-col p-3">
            <h2 className="text-base font-bold text-text mb-2">
              {t('chat.chats')}
            </h2>

            <div className="relative mb-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('chat.searchUsers')}
                className="input w-full text-xs"
              />

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-32 overflow-y-auto">
                  {searchResults.map(userItem => (
                    <button
                      key={userItem.id}
                      type="button"
                      onMouseDown={e => {
                        e.preventDefault()

                        const existingConversation = conversations.find(
                          conversation => conversation.targetUserId === userItem.id
                        )

                        if (existingConversation) {
                          setSearch('')
                          void openConversation(existingConversation.id)
                          return
                        }

                        openDraftConversation(userItem.id, userItem.username)
                        setSearch('')
                      }}
                      className="block w-full text-left px-2 py-1 border-b border-gray-100 hover:bg-gray-100 transition-colors text-xs"
                    >
                      <div className="font-medium text-gray-900">
                        {userItem.username}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-xs mb-2">
                {error}
              </p>
            )}

            <div
              ref={conversationsContainerRef}
              className="w-[250px] flex-shrink-0 overflow-y-auto space-y-1"
            >
              {shouldShowDraft && (
                <button
                  type="button"
                  className="w-full text-left p-1.5 rounded-lg transition-all bg-gray-400 border border-gray-500"
                >
                  <div className="flex items-center gap-1.5">
                    {/* Instead of URL, we are using now a component for Unkown Avatar */}
                    <UnknownProfileAvatar
                      className="w-5 h-5 rounded-full flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-xs">
                        {draftTargetUserName}
                      </div>

                      <div className="text-xs text-gray-600 truncate">
                        New chat
                      </div>
                    </div>

                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ring-1 ring-gray-300 ${
                        isDraftTargetOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                </button>
              )}

              {conversations.length === 0 && !draftTargetUserId ? (
                <p className="text-gray-600 text-center py-2 text-xs">
                  {t('chat.selectConversation')}
                </p>
              ) : (
                <>
                  {conversations.map(conversation => {
                    const isOnline = onlineUserIds.includes(conversation.targetUserId)
                    const isDeletingConversation = deletingConversationIds.includes(conversation.id)

                    const avatarSrc = conversation.targetUserAvatarUrl
                      ? `${import.meta.env.VITE_API_BASE_URL}${conversation.targetUserAvatarUrl}`
                      : null
                    const avatarFailed = failedAvatarIds.has(conversation.id)
                    return (
                      <div
                        key={conversation.id}
                        className={`group flex w-full items-center rounded-lg transition-all ${
                          conversation.id === activeConversationId
                            ? 'bg-gray-400 border border-gray-500'
                            : 'bg-gray-200 hover:bg-gray-100'
                        } ${isDeletingConversation ? 'opacity-50' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => void openConversation(conversation.id)}
                          className="flex-1 text-left p-1.5 min-w-0"
                        >
                          <div className="flex items-center gap-1.5">
                            {avatarSrc && !avatarFailed ? (
                              <img
                              src={avatarSrc}
                              onError={() => {
                                  setFailedAvatarIds((prev) => new Set(prev).add(conversation.id))

                              }}
                              alt={conversation.targetUserName}
                              className="w-5 h-5 rounded-full object-cover flex-shrink-0"/>
                              ) : ( <UnknownProfileAvatar className="w-5 h-5 rounded-full object-cover flex-shrink-0" />

                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate text-xs">
                                {conversation.targetUserName}
                              </div>

                              <div className="text-xs text-gray-600 truncate">
                                {conversation.lastMessage
                                  ? conversation.lastMessage.length > 10
                                    ? `${conversation.lastMessage.slice(0, 10)}...`
                                    : conversation.lastMessage
                                  : t('chat.noMessagesYet')}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {conversation.unreadCount > 0 && (
                                <span className="min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}

                              <span
                                className={`inline-block w-2.5 h-2.5 rounded-full ring-1 ring-gray-300 ${
                                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                              />
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={event => {
                            event.stopPropagation()
                            void handleDeleteConversation(conversation.id)
                          }}
                          disabled={isDeletingConversation}
                          aria-label="Delete conversation"
                          title="Delete conversation"
                          className="mr-1 flex h-6 w-6 items-center justify-center rounded-full text-gray-500 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}

                  {loadingMoreConversations && (
                    <div className="text-center py-2 text-gray-500 text-xs">
                      {t('common.loading')}
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>

          <main className="flex-1 flex flex-col bg-gray-300 rounded-2xl p-3 min-h-0">
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0 bg-white rounded-lg mb-1.5"
            >
              {!activeConversationId && !shouldShowDraft && !loadingMessages && (
                <div className="text-center py-2 text-gray-500 text-xs">
                  {t('chat.selectConversation')}
                </div>
              )}

              {shouldShowDraft && (
                <div className="text-center py-2 text-gray-500 text-xs">
                  New chat with {draftTargetUserName}
                </div>
              )}

              {loadingMessages && (
                <div className="text-center py-2 text-gray-500 text-xs">
                  {t('chat.loadingMessages')}
                </div>
              )}

              {loadingOlderMessages && (
                <div className="text-center py-2 text-gray-500 text-xs">
                  {t('chat.loadingMessages')}
                </div>
              )}

              {!loadingMessages &&
                messages
                  .map(message => {
                    const isMine = message.senderId === currentUserId
                    const isDeleting = deletingMessageIds.includes(message.messageId)
                    const isDeleted = message.isDeleted
                    const messageBubbleClass = isMine
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                    const messageDeletedClass = isDeleted
                      ? 'opacity-70 italic'
                      : ''
                    const messageMetaClass = isMine ? 'text-blue-100' : 'text-gray-600'

                    return (
                      <div
                        key={message.messageId}
                        className={`group flex items-center gap-1 ${
                          isMine ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {isMine && !isDeleted && (
                          <button
                            type="button"
                            onClick={() => void handleDeleteMessage(message.messageId)}
                            disabled={isDeleting}
                            aria-label="Delete message"
                            title="Delete message"
                            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ×
                          </button>
                        )}

                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-xs ${messageBubbleClass} ${
                            isDeleting ? 'opacity-50' : ''
                          } ${messageDeletedClass}`}
                        >
                          <div
                            className="whitespace-pre-wrap text-sm"
                            style={{ overflowWrap: 'anywhere' }}
                          >
                            {message.content}
                          </div>

                          <div
                            className={`text-xs mt-0.5 ${messageMetaClass}`}
                          >
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>

                          {isMine && (
                            <div className="text-xs mt-0.5 text-blue-100">
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

            <div className="flex flex-col gap-4">
              <textarea
                value={text}
                maxLength={150}
                rows={2}
                onChange={e => setText(e.target.value)}
                className="w-full resize-none rounded-xl border border-panel px-4 py-5 text-xs outline-none focus:border-black"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    void handleSend()
                  }
                }}
              />

              <div className="flex flex-col md:flex-row md:gap-4">
                <p className="text-sm text-gray-500">
                  {text.length}/150
                </p>

                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={sending || !text.trim() || !currentUserId}
                  className="btn-ghost h-[40px] min-w-[140px] text-sm rounded-xl px-4 ml-auto"
                >
                  {sending ? t('common.loading') : t('chat.send')}
                </button>
              </div>
            </div>
          </main>
        </div>

        <BottomNav active="messages" />
      </div>

      {pendingDeleteMessageId && (
        <Modal
          title={t('chat.deleteMessage')}
          onClose={cancelDeleteMessage}
        >
          <p className="mb-6 text-gray-700">
            {t('chat.areYouSure')}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={cancelDeleteMessage}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors"
            >
              {t('chat.cancel')}
            </button>
            <button
              type="button"
              onClick={() => void confirmDeleteMessage()}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              {t('chat.delete')}
            </button>
          </div>
        </Modal>
      )}

      {pendingDeleteConversationId && (
        <Modal
          title={t('chat.deleteConversation')}
          onClose={cancelDeleteConversation}
        >
          <p className="mb-6 text-gray-700">
            {t('chat.areYouSure')}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={cancelDeleteConversation}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors"
            >
              {t('chat.cancel')}
            </button>
            <button
              type="button"
              onClick={() => void confirmDeleteConversation()}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              {t('chat.delete')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}