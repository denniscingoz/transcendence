import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useRealtime } from '../realtime/RealtimeProvider'

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
  markAllNotificationsAsRead,
  type NotificationListItemDto,
} from '../api/notifications.api'
import { NotificationsModal } from './modals/NotificationsModal'

interface HeaderProps {
  showNotification?: boolean
}

export type UiNotificationKind =
  | 'unread_chat'
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
  return 'unread_chat'
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
  const [activeChatConversationId, setActiveChatConversationId] = useState<string | null>(null)
  const activeChatConversationIdRef = useRef<string | null>(null)
  const readConversationIdsRef = useRef<Set<string>>(new Set())
  const { user } = useAuth()
  const { connection, isConnected } = useRealtime()

  const currentUserId = user?.id ?? null

async function loadHeaderSummary() {
  if (!currentUserId) return

  try {
    const list = await getNotifications()
  const visibleUnreadCount = list.filter(item => {
    const isRead = item.isRead

    const isAlreadyOpenedChatNotification =
      item.type === NotificationType.NewMessage &&
      item.relatedConversationId &&
      readConversationIdsRef.current.has(item.relatedConversationId)

    return !isRead && !isAlreadyOpenedChatNotification
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
const filtered = list.filter(item => {
  const isRead = item.isRead

  const isAlreadyOpenedChatNotification =
    item.type === NotificationType.NewMessage &&
    item.relatedConversationId &&
    readConversationIdsRef.current.has(item.relatedConversationId)

  return !isRead && !isAlreadyOpenedChatNotification
}) 
 

    setNotifications(filtered.map(toUiNotification))
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
      await markAllNotificationsAsRead()
      setNotifications([])
      setUnreadCount(0)
      setIsNotificationsOpen(false)
    } catch (err) {
      console.error('Failed to mark notifications as read', err)
    }
  }

  async function handleAcceptFriendRequest(requesterId: string) {
    try {
      await acceptFriendshipRequest(requesterId)
      await markAllNotificationsAsRead()
      setNotifications([])
      setUnreadCount(0)
      setIsNotificationsOpen(false)
      await refreshNotificationsUi()
    } catch (err) {
      console.error('Failed to accept friend request', err)
    }
  }

  async function handleDeclineFriendRequest(requesterId: string) {
    try {
      await declineFriendshipRequest(requesterId)
      await markAllNotificationsAsRead()
      setNotifications([])
      setUnreadCount(0)
      setIsNotificationsOpen(false)
      await refreshNotificationsUi()
    } catch (err) {
      console.error('Failed to decline friend request', err)
    }
  }
 
useEffect(() => {
  function handleActiveChatChanged(event: Event) {
    const customEvent = event as CustomEvent<{ conversationId: string | null }>
    const conversationId = customEvent.detail?.conversationId ?? null

  activeChatConversationIdRef.current = conversationId
  setActiveChatConversationId(conversationId)

  if (conversationId) {
    readConversationIdsRef.current.add(conversationId)
  }

void refreshNotificationsUi()
  }

  window.addEventListener('active-chat-changed', handleActiveChatChanged)

  return () => {
    window.removeEventListener('active-chat-changed', handleActiveChatChanged)
  }
}, []) 

  useEffect(() => {
    function handleNotificationsVisualRefresh() {
      void refreshNotificationsUi()
    }

    window.addEventListener('notifications-visual-refresh', handleNotificationsVisualRefresh)

    return () => {
      window.removeEventListener('notifications-visual-refresh', handleNotificationsVisualRefresh)
    }
  }, [isNotificationsOpen, activeChatConversationId, currentUserId])

  useEffect(() => {
    if (!currentUserId) return
    void refreshNotificationsUi()
  }, [currentUserId])

  useEffect(() => {
    if (!currentUserId) return
    void refreshNotificationsUi()
  }, [activeChatConversationId])

  useEffect(() => {
    if (!connection || !currentUserId || !isConnected) return

    const handleNotificationReceived = (notification: RealtimeNotificationDto) => {
      if (notification.type === NotificationType.NewMessage) {
        const payload = notification.payload as ChatMessageDto
        const isMyOwnMessage = payload.senderId === currentUserId
        const isActiveChatMessage = payload.conversationId === activeChatConversationIdRef.current
        if (isMyOwnMessage) return

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
  }, [connection, currentUserId, isConnected, isNotificationsOpen, activeChatConversationId])

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

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="28"
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9342 21.6022C19.3543 21.6022 22.7869 20.6503 23.1184 16.8296C23.1184 13.0116 20.7252 13.2571 20.7252 8.57251C20.7252 4.91334 17.2569 0.75 11.9342 0.75C6.61154 0.75 3.14322 4.91334 3.14322 8.57251C3.14322 13.2571 0.75 13.0116 0.75 16.8296C1.08283 20.6647 4.51549 21.6022 11.9342 21.6022Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.0774 25.5621C13.2825 27.5552 10.4825 27.5788 8.67041 25.5621"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TheSocialLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="116"
      height="15"
      viewBox="0 0 116 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.88258e-05 1.76137V0.198869H10.9092V1.76137H6.33532V14.7443H4.57395V1.76137H8.88258e-05ZM13.6276 14.7443V0.198869H15.3889V6.67614H23.1446V0.198869H24.906V14.7443H23.1446V8.23864H15.3889V14.7443H13.6276ZM28.4323 14.7443V0.198869H37.2107V1.76137H30.1936V6.67614H36.7561V8.23864H30.1936V13.1818H37.3243V14.7443H28.4323ZM53.9649 3.83523C53.8797 3.11554 53.5341 2.55682 52.928 2.1591C52.3219 1.76137 51.5786 1.56251 50.6979 1.56251C50.0539 1.56251 49.4905 1.66667 49.0075 1.87501C48.5293 2.08334 48.1553 2.3698 47.8854 2.73438C47.6202 3.09896 47.4877 3.51326 47.4877 3.97728C47.4877 4.36554 47.58 4.69934 47.7646 4.9787C47.954 5.25332 48.1955 5.48296 48.4891 5.66762C48.7826 5.84754 49.0904 5.99669 49.4124 6.11506C49.7343 6.2287 50.0303 6.32103 50.3002 6.39205L51.7774 6.78978C52.1562 6.88921 52.5776 7.02652 53.0416 7.20171C53.5104 7.3769 53.9578 7.61601 54.384 7.91904C54.8148 8.21733 55.17 8.60086 55.4493 9.06961C55.7287 9.53836 55.8683 10.1136 55.8683 10.7955C55.8683 11.5814 55.6624 12.2917 55.2504 12.9261C54.8432 13.5606 54.2467 14.0649 53.4607 14.4389C52.6794 14.813 51.7301 15 50.6127 15C49.571 15 48.669 14.8319 47.9067 14.4957C47.1491 14.1596 46.5525 13.6908 46.1169 13.0895C45.686 12.4882 45.4422 11.7898 45.3854 10.9943H47.2036C47.2509 11.5436 47.4356 11.9981 47.7575 12.358C48.0843 12.7131 48.4962 12.9782 48.9933 13.1534C49.4952 13.3239 50.035 13.4091 50.6127 13.4091C51.285 13.4091 51.8887 13.3002 52.4237 13.0824C52.9588 12.8599 53.3825 12.5521 53.695 12.1591C54.0075 11.7614 54.1638 11.2974 54.1638 10.7671C54.1638 10.2841 54.0289 9.8911 53.759 9.58807C53.4891 9.28504 53.134 9.03883 52.6936 8.84944C52.2533 8.66004 51.7774 8.49432 51.2661 8.35228L49.4763 7.84091C48.3399 7.51421 47.4403 7.04783 46.7774 6.44177C46.1146 5.83571 45.7831 5.04262 45.7831 4.06251C45.7831 3.24811 46.0033 2.53788 46.4436 1.93182C46.8887 1.32103 47.4853 0.847543 48.2334 0.511369C48.9862 0.17046 49.8267 5.00679e-06 50.7547 5.00679e-06C51.6922 5.00679e-06 52.5255 0.168092 53.2547 0.504266C53.9839 0.835705 54.5615 1.29025 54.9877 1.8679C55.4185 2.44555 55.6458 3.10133 55.6695 3.83523H53.9649ZM71.037 7.4716C71.037 9.00569 70.76 10.3314 70.2061 11.4489C69.6521 12.5663 68.8921 13.428 67.9262 14.0341C66.9603 14.6402 65.8571 14.9432 64.6166 14.9432C63.376 14.9432 62.2728 14.6402 61.3069 14.0341C60.341 13.428 59.5811 12.5663 59.0271 11.4489C58.4731 10.3314 58.1961 9.00569 58.1961 7.4716C58.1961 5.93751 58.4731 4.61175 59.0271 3.49432C59.5811 2.3769 60.341 1.51516 61.3069 0.909096C62.2728 0.303035 63.376 5.00679e-06 64.6166 5.00679e-06C65.8571 5.00679e-06 66.9603 0.303035 67.9262 0.909096C68.8921 1.51516 69.6521 2.3769 70.2061 3.49432C70.76 4.61175 71.037 5.93751 71.037 7.4716ZM69.3325 7.4716C69.3325 6.21213 69.1218 5.14915 68.7004 4.28268C68.2837 3.4162 67.7179 2.76042 67.0029 2.31535C66.2927 1.87027 65.4972 1.64773 64.6166 1.64773C63.7359 1.64773 62.9381 1.87027 62.2231 2.31535C61.5129 2.76042 60.9471 3.4162 60.5257 4.28268C60.109 5.14915 59.9007 6.21213 59.9007 7.4716C59.9007 8.73107 60.109 9.79404 60.5257 10.6605C60.9471 11.527 61.5129 12.1828 62.2231 12.6278C62.9381 13.0729 63.7359 13.2955 64.6166 13.2955C65.4972 13.2955 66.2927 13.0729 67.0029 12.6278C67.7179 12.1828 68.2837 11.527 68.7004 10.6605C69.1218 9.79404 69.3325 8.73107 69.3325 7.4716ZM85.7032 4.74432H83.9419C83.8377 4.23769 83.6554 3.79262 83.395 3.4091C83.1393 3.02557 82.8268 2.7036 82.4575 2.44319C82.0929 2.17804 81.6881 1.97917 81.243 1.8466C80.7979 1.71402 80.3339 1.64773 79.8509 1.64773C78.9703 1.64773 78.1724 1.87027 77.4575 2.31535C76.7472 2.76042 76.1814 3.4162 75.76 4.28268C75.3434 5.14915 75.135 6.21213 75.135 7.4716C75.135 8.73107 75.3434 9.79404 75.76 10.6605C76.1814 11.527 76.7472 12.1828 77.4575 12.6278C78.1724 13.0729 78.9703 13.2955 79.8509 13.2955C80.3339 13.2955 80.7979 13.2292 81.243 13.0966C81.6881 12.964 82.0929 12.7675 82.4575 12.5071C82.8268 12.242 83.1393 11.9176 83.395 11.5341C83.6554 11.1458 83.8377 10.7008 83.9419 10.1989H85.7032C85.5706 10.9422 85.3292 11.6075 84.9788 12.1946C84.6284 12.7817 84.1928 13.2813 83.672 13.6932C83.1511 14.1004 82.5664 14.4105 81.9177 14.6236C81.2738 14.8367 80.5848 14.9432 79.8509 14.9432C78.6104 14.9432 77.5072 14.6402 76.5413 14.0341C75.5754 13.428 74.8154 12.5663 74.2615 11.4489C73.7075 10.3314 73.4305 9.00569 73.4305 7.4716C73.4305 5.93751 73.7075 4.61175 74.2615 3.49432C74.8154 2.3769 75.5754 1.51516 76.5413 0.909096C77.5072 0.303035 78.6104 5.00679e-06 79.8509 5.00679e-06C80.5848 5.00679e-06 81.2738 0.106539 81.9177 0.319607C82.5664 0.532676 83.1511 0.845176 83.672 1.25711C84.1928 1.6643 84.6284 2.16146 84.9788 2.74858C85.3292 3.33097 85.5706 3.99622 85.7032 4.74432ZM90.3108 0.198869V14.7443H88.5494V0.198869H90.3108ZM94.439 14.7443H92.5924L97.9333 0.198869H99.7515L105.092 14.7443H103.246L98.8992 2.50001H98.7856L94.439 14.7443ZM95.1208 9.06251H102.564V10.625H95.1208V9.06251ZM107.358 14.7443V0.198869H109.119V13.1818H115.881V14.7443H107.358Z"
        fill="currentColor"
      />
    </svg>
  )
}