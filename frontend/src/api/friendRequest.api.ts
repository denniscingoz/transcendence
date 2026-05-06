import api from './axios'
import type { ApiResponse, FriendDto } from '../types/api'

export async function acceptFriendRequestApi(targetUserId: string) {
  await api.post(`/friends/requests/${targetUserId}/accept`)
}

export async function declineFriendRequestApi(targetUserId: string) {
  await api.post(`/friends/requests/${targetUserId}/decline`)
}