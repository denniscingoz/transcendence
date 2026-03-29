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

  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors?.[0] ?? 'Failed to load feed.')
  }

  return response.data.Data
}