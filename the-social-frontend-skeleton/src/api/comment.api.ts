import api from './axios'
import { CursorPageDto, ProfilePostPreviewDto, ApiResponse, CommentPreviewDto } from "../types/api"

export async function getComments(
  postId: string,
  take = 20,
  cursor?: string | null
): Promise<CursorPageDto<CommentPreviewDto>> {
  const response = await api.get<ApiResponse<CursorPageDto<CommentPreviewDto>>>(
    `/posts/${postId}/comments`,
    {
      params: {
        take,
        cursor,
      },
    }
  )

  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors?.[0] ?? 'Failed to load comments.')
  }

  return response.data.Data
}