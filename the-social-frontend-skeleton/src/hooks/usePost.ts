import { useQuery } from '@tanstack/react-query'
import { getPost, sharePost, uploadPostFile } from '../api/posts.api'
import type { PostDto, CreatePostDto } from '../types/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePost } from '../api/posts.api'


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



export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deletePost,
    onSuccess: (_data, postId) => {
      // queryClient.removeQueries({ queryKey: ['posts', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
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