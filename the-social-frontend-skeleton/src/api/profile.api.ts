import api from './axios'
import type { MyProfileDto } from '../types/api'
import type { UpdateProfileDto } from '../types/api'
import type { ApiResponse, CursorPageDto, ProfilePostPreviewDto } from '../types/api'

export async function getMyProfile(): Promise<MyProfileDto> {
  const response = await api.get<ApiResponse<MyProfileDto>>('/profile/me')

  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors[0] ?? 'Failed to load profile.')
  }

  return response.data.Data
}

export async function updateMyProfile(payload: Partial<UpdateProfileDto>): Promise<MyProfileDto> {
  console.log('updateMyProfile payload:', payload)
  
  const response = await api.patch<ApiResponse<MyProfileDto>>('/profile/me', payload)
  console.log('updateMyProfile response:', response.data)
  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors[0] ?? 'Failed to update profile.')
  }

  return response.data.Data
}


export async function uploadAvatar(file: File): Promise<MyProfileDto> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<MyProfileDto>('/profile/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}


export async function getMyProfilePostPreviews(
  take = 20,
  cursor?: string | null
): Promise<CursorPageDto<ProfilePostPreviewDto>> {
  const response = await api.get<ApiResponse<CursorPageDto<ProfilePostPreviewDto>>>(
    '/posts/me',
    {
      params: {
        take,
        cursor,
      },
    }
  )

  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors[0] ?? 'Failed to load profile posts.')
  }

  return response.data.Data
}