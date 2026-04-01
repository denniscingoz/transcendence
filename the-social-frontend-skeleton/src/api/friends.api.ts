import api from './axios'
import type { ApiResponse, FriendDto } from '../types/api'

export async function listFriends(): Promise<FriendDto[]> {
  const response = await api.get<ApiResponse<FriendDto[]>>('/friends/list')

  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors?.[0] ?? 'Failed to load friends.')
  }

  return response.data.Data
}

export async function addFriendById(targetUserId: string): Promise<void> {
  await api.post(`/friends/${targetUserId}`)
}

export async function removeFriendById(friendUserId: string): Promise<void> {
  await api.delete(`/friends/${friendUserId}`)
}