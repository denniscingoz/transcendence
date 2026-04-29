import api from './axios'
import type { ApiResponse } from '../types/api'

export enum NotificationType {
  NewMessage = 1,
  FriendRequest = 2,
  FriendRequestAccepted = 3,
  FriendRequestDeclined = 4,
}

export type NotificationListItemDto = {
  id: string
  type: number
  text: string
  avatarUrl?: string | null
  isRead: boolean
  createdAt: string
  actorUserId?: string | null
  relatedConversationId?: string | null
  relatedRequestId?: string | null
}

export async function getNotifications(): Promise<NotificationListItemDto[]> {
  const response = await api.get<ApiResponse<NotificationListItemDto[]>>('/notifications')

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors?.[0] ?? 'Failed to load notifications.')
  }

  return response.data.data
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await api.get<ApiResponse<number>>('/notifications/unread-count')

  if (!response.data.isSuccess || response.data.data === undefined || response.data.data === null) {
    throw new Error(response.data.errors?.[0] ?? 'Failed to load unread notification count.')
  }

  return response.data.data
}

export async function markConversationNotificationsAsRead(conversationId: string): Promise<void> {
  await api.post(`/notifications/conversations/${conversationId}/read`)
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.post('/notifications/read-all')
}