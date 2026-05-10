import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { addFriendById, listFriends, removeFriendById } from '../api/friends.api'
import { FriendDto } from '../types/api'
import { acceptFriendRequestApi, declineFriendRequestApi } from '../api/friendRequest.api'

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (targetUserId: string) => acceptFriendRequestApi(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
    onError: (err: any) => {
      // Stale notification: the request was already resolved → backend returns 404.
      // Treat it like a successful resolution and clear the stale state silently.
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        return
      }
    },
  })
}

export function useDeclineFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetUserId: string) => declineFriendRequestApi(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err: any) => {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
        return
      }
    },
  })
}