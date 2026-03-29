import api from './axios'
import type { PostDto, ApiResponse, MyProfileDto } from '../types/api'


export async function getPost(postId: string): Promise<PostDto> {
  const response = await api.get<ApiResponse<PostDto>>(`/posts/${postId}`)

  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors?.[0] ?? 'Failed to load post.')
  }

  return response.data.Data
}