import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addFriendById, listFriends, removeFriendById } from '../api/friends.api'
import { FriendDto } from '../types/api'

export function useFriends() {
  return useQuery<FriendDto[], Error>({
    queryKey: ['friends', 'list'],
    queryFn: listFriends,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

export function useAddFriend() {
  return useMutation<void, Error, string>({
    mutationFn: (friendId: string) => addFriendById(friendId),
  })
}

export function useRemoveFriend() {
  return useMutation<void, Error, string>({
    mutationFn: (friendId: string) => removeFriendById(friendId),
  })
}