import api from './axios'
import type { MyProfileDto } from '../types/api'
import type { UpdateProfileDto } from '../types/api'
import type { ApiResponse, CursorPageDto, ProfilePostPreviewDto, OtherProfileDto } from '../types/api'


export async function searchProfilesApi(request: {
  query: string
  take: number
  cursor: string | null
}): Promise<CursorPageDto<OtherProfileDto>> {

	const { data } = await api.get<CursorPageDto<OtherProfileDto>>('/profile/search', {
    params: {
      query: request.query,
      take: request.take,
      cursor: request.cursor,
    },
  })

  return data
}