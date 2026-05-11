import { useInfiniteQuery } from '@tanstack/react-query'
import type { CommentPreviewDto, CursorPageDto} from '../types/api'
import { getComments, postComment, deleteComment } from '../api/comment.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'


export function useComments(
  postId?: string,
  take = 12,
  enabled = true
) {
  return useInfiniteQuery<CursorPageDto<CommentPreviewDto>, Error>({ //used for paginated lists
    queryKey: ['posts', postId, 'comments', take],
    queryFn: ({ pageParam }) => {
      if (!postId) {
        throw new Error('Post id is required.')
      }
      return getComments(postId, take, (pageParam ?? null) as string | null)
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
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

  return useMutation<CommentPreviewDto, Error, string>({ //used for changing data, means POST / PUT / PATCH / DELETE
    mutationFn: (content: string) => {                   //Mutation changes backend
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
        queryClient.invalidateQueries({ queryKey: ['posts', postId, 'comments'] }),
        queryClient.invalidateQueries({ queryKey: ['post', postId] }),
      ])
    },
  })
}