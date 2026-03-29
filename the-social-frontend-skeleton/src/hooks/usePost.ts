import { useQuery } from '@tanstack/react-query'
import { getPost } from '../api/posts.api'
import type { PostDto } from '../types/api'

export function usePost(postId?: string) {
  return useQuery<PostDto>({
    queryKey: ['post', postId],
    queryFn: () => {
      if (!postId) {
        throw new Error('Post id is required.')
      }
      return getPost(postId)
    },
    enabled: !!postId,
  })
}