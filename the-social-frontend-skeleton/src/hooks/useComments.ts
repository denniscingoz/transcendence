import { useQuery } from '@tanstack/react-query'
import type { CommentPreviewDto, CursorPageDto} from '../types/api'
import { getComments, postComment, deleteComment } from '../api/comment.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'


export function useComments(
  postId?: string,
  take = 12,
  cursor?: string | null,
  enabled = true
) {
  const normalizedCursor = cursor ?? null

  return useQuery<CursorPageDto<CommentPreviewDto>>({
    queryKey: ['posts', postId, 'comments', take, normalizedCursor],
    queryFn: () => {
      if (!postId) {
        throw new Error('Post id is required.')
      }
      return getComments(postId, take, normalizedCursor)
    },
    enabled: !!postId && enabled,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false
      }
      return failureCount < 2
    },
  })
}


export function usePostComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation<CommentPreviewDto, Error, string>({
    mutationFn: (content: string) => {
      if (!postId) {
        throw new Error('Post id is required.')
      }
      if (!content.trim()) {
        throw new Error('Comment content is required.')
      }

      return postComment(postId, content)
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['posts', postId, 'comments'] })
    },
  })
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (commentId: string) => {
      if (!postId) {
        throw new Error('Post id is required.')
      }
      if (!commentId) {
        throw new Error('Comment id is required.')
      }

      return deleteComment(postId, commentId)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
        queryClient.invalidateQueries({ queryKey: ['post', postId] }),
      ])
    },
  })
}