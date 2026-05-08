import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useRealtime } from '../realtime/RealtimeProvider'
import { BellIcon } from './icons/BellIcon'
import { TheSocialLogo } from './icons/TheSocialLogo'

import {
  type ChatMessageDto,
  type RealtimeNotificationDto,
  NotificationType,
} from '../api/chat.api'
import {
  acceptFriendshipRequest,
  declineFriendshipRequest,
} from '../api/friends.api'
import {
  getNotifications,
  markNotificationAsRead,
  markSeenNotificationsAsRead,  
  type NotificationListItemDto,
} from '../api/notifications.api'
import { NotificationsModal } from './modals/NotificationsModal'

interface HeaderProps {
  showNotification?: boolean
}

export type UiNotificationKind =
  | 'unread_message'
  | 'friend_request'
  | 'friend_request_accepted'
  | 'friend_request_declined'

export type UiNotification = {
  id: string
  kind: UiNotificationKind
  text: string
  avatarUrl?: string | null
  createdAt?: string
  isUnread?: boolean
  relatedUserId?: string
  relatedConversationId?: string
  relatedRequestId?: string
  actionUserId?: string
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

function mapNotificationTypeToKind(type: number): UiNotificationKind {
  if (type === NotificationType.FriendRequest) return 'friend_request'
  if (type === NotificationType.FriendRequestAccepted) return 'friend_request_accepted'
  if (type === NotificationType.FriendRequestDeclined) return 'friend_request_declined'
  return 'unread_message'
}

function toUiNotification(item: NotificationListItemDto): UiNotification {
  return {
    id: item.id,
    kind: mapNotificationTypeToKind(item.type),
    text: item.text,
    avatarUrl: item.avatarUrl ?? null,
    createdAt: item.createdAt,
    isUnread: !item.isRead,
    relatedUserId: item.actorUserId ?? undefined,
    relatedConversationId: item.relatedConversationId ?? undefined,
    relatedRequestId: item.relatedRequestId ?? undefined,
    actionUserId:
      item.type === NotificationType.FriendRequest
        ? item.actorUserId ?? undefined
        : undefined,
  }
}

export function Header({ showNotification = true }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<UiNotification[]>([])

  const activeChatConversationIdRef = useRef<string | null>(null)

  const { user } = useAuth()
  const { connection, isConnected } = useRealtime()

  const currentUserId = user?.id ?? null

  async function loadHeaderSummary() {
    if (!currentUserId) return

    try {
      const list = await getNotifications()
      const activeConversationId = activeChatConversationIdRef.current

      const visibleUnreadCount = list.filter(item => {
        const isActiveChatNotification =
          item.type === NotificationType.NewMessage &&
          item.relatedConversationId === activeConversationId

        return !item.isRead && !isActiveChatNotification
      }).length

      setUnreadCount(visibleUnreadCount)
    } catch (err) {
      console.error('Failed to load header summary', err)
    }
  }

  async function loadNotifications() {
    if (!currentUserId) return

    try {
      const list = await getNotifications()
      const activeConversationId = activeChatConversationIdRef.current

      const visibleNotifications = list.filter(item => {
        const isActiveChatNotification =
          item.type === NotificationType.NewMessage &&
          item.relatedConversationId === activeConversationId

        return !item.isRead && !isActiveChatNotification
      })

      setNotifications(visibleNotifications.map(toUiNotification))
    } catch (err) {
      console.error('Failed to load notifications', err)
    }
  }

  async function refreshNotificationsUi() {
    await loadHeaderSummary()

    if (isNotificationsOpen) {
      await loadNotifications()
    }
  }

  async function handleBellClick() {
    setIsNotificationsOpen(true)
    await loadNotifications()
    await loadHeaderSummary()
  }

async function handleCloseNotifications() {
  try {
    await markSeenNotificationsAsRead()

    setNotifications(prev =>
      prev.filter(item => item.kind === 'friend_request')
    )

    await loadHeaderSummary()
  } catch (err) {
    console.error('Failed to mark chat notifications as read', err)
  } finally {
    setIsNotificationsOpen(false)
  }
}

    async function handleAcceptFriendRequest(
      notificationId: string,
      requesterId: string
    ) {
      try {
        await acceptFriendshipRequest(requesterId)
        await markNotificationAsRead(notificationId)

        setNotifications(prev =>
          prev.filter(item => item.id !== notificationId)
        )

        await loadHeaderSummary()
      } catch (err) {
        console.error('Failed to accept friend request', err)
      }
    }

  async function handleDeclineFriendRequest(
    notificationId: string,
    requesterId: string
  ) {
    try {
      await declineFriendshipRequest(requesterId)
      await markNotificationAsRead(notificationId)


      setNotifications(prev =>
        prev.filter(item => item.id !== notificationId)
      )
      
      await loadHeaderSummary()


    } catch (err) {
      console.error('Failed to decline friend request', err)
    }
  }

  useEffect(() => {
    function handleActiveChatChanged(event: Event) {
      const customEvent = event as CustomEvent<{ conversationId: string | null }>
      activeChatConversationIdRef.current = customEvent.detail?.conversationId ?? null

      void refreshNotificationsUi()
    }

    window.addEventListener('active-chat-changed', handleActiveChatChanged)

    return () => {
      window.removeEventListener('active-chat-changed', handleActiveChatChanged)
    }
  }, [currentUserId, isNotificationsOpen])

  useEffect(() => {
    function handleNotificationsVisualRefresh() {
      void refreshNotificationsUi()
    }

    window.addEventListener('notifications-visual-refresh', handleNotificationsVisualRefresh)

    return () => {
      window.removeEventListener('notifications-visual-refresh', handleNotificationsVisualRefresh)
    }
  }, [currentUserId, isNotificationsOpen])

  useEffect(() => {
    if (!currentUserId) return
    void refreshNotificationsUi()
  }, [currentUserId])

  useEffect(() => {
    if (!connection || !currentUserId || !isConnected) return

    const handleNotificationReceived = (notification: RealtimeNotificationDto) => {
      if (notification.type === NotificationType.NewMessage) {
        const payload = notification.payload as ChatMessageDto

        if (payload.senderId === currentUserId) return

        const isActiveChatMessage =
          payload.conversationId === activeChatConversationIdRef.current

        if (isActiveChatMessage) {
          void refreshNotificationsUi()
          return
        }
      }

      playSystemBeep()
      void refreshNotificationsUi()
    }

    const handleNotificationsChanged = () => {
      void refreshNotificationsUi()
    }

    const handleConversationsChanged = () => {
      void refreshNotificationsUi()
    }

    connection.on('NotificationReceived', handleNotificationReceived)
    connection.on('NotificationsChanged', handleNotificationsChanged)
    connection.on('ConversationsChanged', handleConversationsChanged)

    return () => {
      connection.off('NotificationReceived', handleNotificationReceived)
      connection.off('NotificationsChanged', handleNotificationsChanged)
      connection.off('ConversationsChanged', handleConversationsChanged)
    }
  }, [connection, currentUserId, isConnected, isNotificationsOpen])

  const hasNotifications = unreadCount > 0

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <NavLink to="/feed">
            <TheSocialLogo className="h-4 w-auto text-gray-900" />
          </NavLink>

          <div className="flex items-center gap-3">
            {showNotification && (
              <button
                type="button"
                onClick={() => void handleBellClick()}
                className="relative rounded-full p-2 transition-colors hover:bg-gray-100"
              >
                <BellIcon className="h-6 w-6 text-gray-700" />

                {hasNotifications && (
                  <>
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {isNotificationsOpen && (
        <NotificationsModal
          onClose={() => void handleCloseNotifications()}
          notifications={notifications}
          onAcceptFriendRequest={handleAcceptFriendRequest}
          onDeclineFriendRequest={handleDeclineFriendRequest}
        />
      )}
    </>
  )
}


