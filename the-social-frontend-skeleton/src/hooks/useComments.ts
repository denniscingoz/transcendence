import { useQuery } from '@tanstack/react-query'
import type { CommentPreviewDto, CursorPageDto} from '../types/api'
import { getComments } from '../api/comment.api'

export function useComments(
  postId?: string,
  take = 12,
  cursor?: string | null
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
    enabled: !!postId,
  })
}