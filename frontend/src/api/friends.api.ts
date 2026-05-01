import api from './axios'
import type { ApiResponse, FriendDto } from '../types/api'

export type FriendshipRequestDto = {
  id: string
  requesterId: string
  targetUserId: string
  createdAt: string
  requesterUsername: string
  requesterAvatarUrl?: string | null
}

export type CursorPage<T> = {
  items: T[]
  nextCursor: string | null
}

export async function listFriends(params?: {
  take?: number
  cursor?: string | null
}): Promise<CursorPage<FriendDto>> {
  const query: Record<string, string> = { take: String(params?.take ?? 20) }
  if (params?.cursor) query.cursor = params.cursor

  const response = await api.get<ApiResponse<CursorPage<FriendDto>>>(
    '/friends/list',
    { params: query },
  )

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors?.[0] ?? 'Failed to load friends.')
  }

  return response.data.data
}

export async function addFriendById(targetUserId: string): Promise<void> {
  await api.post(`/friends/${targetUserId}`)
}

export async function removeFriendById(friendUserId: string): Promise<void> {
  await api.delete(`/friends/${friendUserId}`)
}

export async function getFriendshipRequests(): Promise<FriendshipRequestDto[]> {
  const response = await api.get<ApiResponse<FriendshipRequestDto[]>>('/friends/requests')

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors?.[0] ?? 'Failed to load friendship requests.')
  }

  return response.data.data
}

export async function acceptFriendshipRequest(requesterId: string): Promise<void> {
  await api.post(`/friends/requests/${requesterId}/accept`)
}

export async function declineFriendshipRequest(requesterId: string): Promise<void> {
  await api.post(`/friends/requests/${requesterId}/decline`)
}