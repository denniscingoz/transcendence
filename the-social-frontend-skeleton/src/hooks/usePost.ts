import { useQuery } from '@tanstack/react-query'
import { getPost, sharePost, uploadPostFile, getPostLikes } from '../api/posts.api'
import type { PostDto, CreatePostDto, LikesPreviewDto, CursorPageDto } from '../types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePost } from '../api/posts.api'


export function usePost(postId?: string, enabled = true) {
  return useQuery<PostDto>({
    queryKey: ['post', postId],
    queryFn: () => {
      if (!postId) {
        throw new Error('Post id is required.')
      }
      return getPost(postId)
    },
    enabled: !!postId && enabled,
  })
}

export function usePostLikes(
  postId?: string,
  take = 20,
  cursor?: string | null,
  enabled = true
) {
  const normalizedCursor = cursor ?? null

  return useQuery<CursorPageDto<LikesPreviewDto>>({
    queryKey: ['posts', postId, 'likes', take, normalizedCursor],
    queryFn: () => {
      if (!postId) {
        throw new Error('Post id is required.')
      }
      return getPostLikes(postId, take, normalizedCursor)
    },
    enabled: !!postId && enabled,
  })
}



export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['post', postId] }),
        queryClient.cancelQueries({ queryKey: ['posts', postId, 'comments'] }),
      ])
    },
    onSuccess: (_data, postId) => {
      queryClient.removeQueries({ queryKey: ['post', postId] })
      queryClient.removeQueries({ queryKey: ['posts', postId, 'comments'] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] })
    },
  })
}

export function useSharePost() {
  return useMutation({
    mutationFn: sharePost,
  })
}

export function useUploadPostFile() {
  return useMutation({
    mutationFn: uploadPostFile,
  })
}