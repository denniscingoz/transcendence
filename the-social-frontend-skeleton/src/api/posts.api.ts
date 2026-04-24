import api from './axios'
import type { PostDto, ApiResponse, MyProfileDto, CreatePostDto } from '../types/api'


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

export async function uploadPostFile(file: File) {
  console.log("It is coming all the way to uploadPostFile Api")
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },  
  })

  return response.data.data.fileId
}