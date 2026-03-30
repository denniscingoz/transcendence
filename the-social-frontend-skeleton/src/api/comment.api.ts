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


export async function postComment(
  postId: string,
  content: string,
): Promise<CommentPreviewDto> {
   console.log('Comment has reached to the final and it is:', content, '.')
  const response = await api.post<ApiResponse<CommentPreviewDto>>(
    `/posts/${postId}/comments`,
    JSON.stringify(content),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors?.[0] ?? 'Failed to post comment.')
  }

  return response.data.Data
}

export async function deleteComment(
  postId: string,
  commentId: string,
): Promise<void> {
  await api.delete(`/posts/${postId}/comments/${commentId}`)
}

