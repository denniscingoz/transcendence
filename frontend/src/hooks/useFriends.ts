import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { addFriendById, listFriends, removeFriendById, type CursorPage, } from '../api/friends.api'
import { FriendDto } from '../types/api'


export function useFriends(take = 20) {
  return useInfiniteQuery<CursorPage<FriendDto>, Error>({
    queryKey: ['friends', 'list', take],
    queryFn: ({ pageParam }) =>
      listFriends({ take, cursor: pageParam as string | null }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
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