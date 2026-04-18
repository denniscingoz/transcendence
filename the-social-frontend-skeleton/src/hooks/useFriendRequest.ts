import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFriendById, listFriends, removeFriendById } from '../api/friends.api'
import { FriendDto } from '../types/api'
import { acceptFriendRequestApi, declineFriendRequestApi } from '../api/friendRequest.api'

export function useAcceptFriendRequest() {
  return useMutation({
    mutationFn: (targetUserId: string) => acceptFriendRequestApi(targetUserId),
  })
}

export function useDeclineFriendRequest() {
  return useMutation({
    mutationFn: (targetUserId: string) => declineFriendRequestApi(targetUserId),
  })
}