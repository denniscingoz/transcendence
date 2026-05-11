import * as signalR from '@microsoft/signalr'
import type {   CursorPageDto, OtherProfileDto  } from '../types/api'
import api from './axios'


export type ChatMessageDto = {
  messageId: string
  clientMessageId?: string
  conversationId: string
  senderId: string
  isReadByUser: boolean
  content: string
  isReadByOthers: boolean
  createdAt: string
  isDeleted: boolean
  isDelivered: boolean

}

export type ConversationDto = {
  id: string
  targetUserId: string
  targetUserName: string
  targetUserAvatarUrl?: string | null
  targetUserIsDeleted: boolean
  lastMessage: string
  lastMessageAt?: string | null
  unreadCount: number
}

export type MessageAckDto = {
  clientMessageId: string
  messageId: string
  createdAt: string
}

export type MessageDeliveredDto = {
  readerId: string
  senderId: string
  messageId: string
}

export type MessageReadDto = {
  conversationId: string
  readerId: string
  messageId: string
}
 
export type SendMessageCommandDto = {
  conversationId: string
  clientMessageId: string
  content: string
}

export type CreateOrGetConversationResult = {
  conversationId: string
  isCreated: boolean
}

type ApiResponse<T> = {
  data: T
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const HUB_BASE_URL = import.meta.env.VITE_HUB_BASE_URL || ''

async function apiFetch<T>(
  userId: string,
  url: string,
  options?: globalThis.RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Dev-UserId': userId,
      ...(options?.headers || {}),
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `HTTP ${response.status}`)
  }

  const json = (await response.json()) as ApiResponse<T>
  return json.data
}

export async function getConversations(
  userId: string,
  offset = 0,
  limit = 20
): Promise<ConversationDto[]> {
  return apiFetch<ConversationDto[]>(userId, `${API_BASE_URL}/conversations?offset=${offset}&limit=${limit}`)
}

export async function createDirectConversation(
  userId: string,
  targetUserId: string
): Promise<CreateOrGetConversationResult> {
  return apiFetch<CreateOrGetConversationResult>(
    userId,
    `${API_BASE_URL}/conversations/direct`,
    {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    }
  )
}

export async function deleteMessage(
  connection: signalR.HubConnection,
  messageId: string
) {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    throw new Error('Cannot delete message if connection is not connected.')
  }

  await connection.invoke('DeleteMessage', messageId)
}

export async function deleteConversation(
    userId: string,
    conversationId: string
): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/`,
      {
        method: 'DELETE',
        headers: {
        'Content-Type': 'application/json',
        'X-Dev-UserId': userId,
        }
      }
    )
    if (!response.ok) {
      const text = await response.text()
          throw new Error(text || `HTTP ${response.status}`)

    }
}
export async function markAllIncomingAsDelivered(
  connection: signalR.HubConnection
) {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    return
  }

  await connection.invoke('MarkAllIncomingAsDelivered')
}
export async function getMessages(
  userId: string,
  conversationId: string,
  offset = 0,
  limit = 20
): Promise<ChatMessageDto[]> {
  return apiFetch<ChatMessageDto[]>(
    userId,
    `${API_BASE_URL}/conversations/${conversationId}/messages?offset=${offset}&limit=${limit}`
  )
}

export function createChatConnection(userId: string) {
  const hubUrl = `${HUB_BASE_URL}/hubs/chat?devUserId=${encodeURIComponent(userId)}`

  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl)
    .withAutomaticReconnect()
    .build()
}

export async function startConnection(connection: signalR.HubConnection) {
  if (connection.state === signalR.HubConnectionState.Disconnected) {
    await connection.start()
  }
}

export async function joinConversation(
  connection: signalR.HubConnection,
  conversationId: string
) {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    throw new Error('Connection is not connected')
  }

  await connection.invoke('JoinConversation', conversationId)
}

export async function leaveConversation(
  connection: signalR.HubConnection,
  conversationId: string
) {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    return
  }

  await connection.invoke('LeaveConversation', conversationId)
}

export async function sendMessage(
  connection: signalR.HubConnection,
  dto: SendMessageCommandDto
) {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    throw new Error('Cannot send data if the connection is not in the Connected state.')
  }

  await connection.invoke('SendMessage', dto)
}

export async function markAsRead(
  connection: signalR.HubConnection,
  conversationId: string
) {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    return
  }

  await connection.invoke('MarkAsRead', conversationId)
}

export async function markAsDelivered(
  connection: signalR.HubConnection,
  messageId: string,
  conversationId: string,
  senderId: string
) {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    return
  }

  await connection.invoke('DeliveredMessage', messageId, conversationId, senderId)
}
// export async function searchUsers(userId: string, query: string) {
//   const encodedQuery = encodeURIComponent(query.trim());
  
//   const url = `${API_BASE_URL}/pro/search?query=${encodedQuery}&take=20`;

//   return apiFetch<OtherProfileDto[]>(userId, url);
// }
// В файле с API
export async function searchUsers(request: {
  query: string
  take: number
  cursor: string | null
}): Promise<OtherProfileDto[]> { // Возвращаем массив для удобства компонента

  const { data } = await api.get<CursorPageDto<OtherProfileDto>>('/profile/search', {
    params: request,
  })

  // Возвращаем именно поле items, так как в нем лежит массив пользователей
  return data.items 
}