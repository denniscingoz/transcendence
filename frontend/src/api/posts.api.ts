import api from './axios'
import type {
  PostDto,
  ApiResponse,
  CreatePostDto,
  LikesPreviewDto,
  CursorPageDto,
} from '../types/api'

export type UploadProgressHandler = (percent: number) => void

export type UploadPostFileInput = {
  file: File
  onProgress?: UploadProgressHandler
}


export async function getPost(postId: string): Promise<PostDto> {
  const response = await api.get<ApiResponse<PostDto>>(`/posts/${postId}`)

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors?.[0] ?? 'Failed to load post.')
  }

  return response.data.data
}

export async function sharePost(data: Partial<CreatePostDto>) {
  const response = await api.post('/posts', data)
  return response.data
}

export async function deletePost(postId: string): Promise<void> {
  if (!postId) {
    throw new Error('Post id is required.')
  }

  await api.delete(`/posts/${postId}`)
}

export async function getPostLikes(
  postId: string,
  take = 20,
  cursor?: string | null
): Promise<CursorPageDto<LikesPreviewDto>> {
  const response = await api.get<ApiResponse<CursorPageDto<LikesPreviewDto>>>(`/posts/${postId}/likes`, {
    params: {
      take,
      cursor,
    },
  })

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors?.[0] ?? 'Failed to load likes.')
  }

  return response.data.data
}


export async function uploadPostFile(input: UploadPostFileInput | File) {
  const file = input instanceof File ? input : input.file
  const onProgress = input instanceof File ? undefined : input.onProgress

  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) {
        return
      }

      const percent = Math.min(100, Math.max(0, Math.round((event.loaded * 100) / event.total)))
      onProgress(percent)
    },
  })

  return response.data.data.fileId
}