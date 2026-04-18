import { useQuery } from '@tanstack/react-query'
import { getPost, sharePost, uploadPostFile } from '../api/posts.api'
import type { PostDto, CreatePostDto } from '../types/api'
import { useMutation } from '@tanstack/react-query'


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