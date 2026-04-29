import api from "./axios"
import { ApiResponse, CursorPageDto, PostDto } from "../types/api"

export async function getFeed(
  take = 20,
  cursor?: string | null
): Promise<CursorPageDto<PostDto>> {
  const response = await api.get<ApiResponse<CursorPageDto<PostDto>>>('/posts/feed', {
    params: {
      take,
      cursor,
    },
  })

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors?.[0] ?? 'Failed to load feed.')
  }

  return response.data.data
}