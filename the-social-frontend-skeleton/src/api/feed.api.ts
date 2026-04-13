import api from "./axios"
import { ApiResponse, CursorPageDto, PostDto } from "../types/api"

export async function getFeed(
  cursor?: string
): Promise<CursorPageDto<PostDto>> {
  const response = await api.get<ApiResponse<CursorPageDto<PostDto>>>('/posts/feed', {
    params: {
      take: 20,
      cursor,
    },
  })

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors?.[0] ?? 'Failed to load feed.')
  }

  return response.data.data
}