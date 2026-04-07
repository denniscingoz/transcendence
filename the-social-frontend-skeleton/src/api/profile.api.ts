import api from './axios'
import type { MyProfileDto } from '../types/api'
import type { UpdateProfileDto } from '../types/api'
import type {
  ApiResponse,
  CursorPageDto,
  ProfilePostPreviewDto,
  ChangePasswordDto,
  UploadFilesResultDto,
} from '../types/api'

export async function getMyProfile(): Promise<MyProfileDto> {
  const response = await api.get<ApiResponse<MyProfileDto>>('/profile/me')

  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors[0] ?? 'Failed to load profile.')
  }

  return response.data.Data
}

export async function updateMyProfile(payload: Partial<UpdateProfileDto>): Promise<MyProfileDto> {
  console.log('updateMyProfile payload:', payload)
  console.log('here')
  const response = await api.patch<ApiResponse<MyProfileDto>>('/profile/me', payload)
  console.log('updateMyProfile response:', response.data)
  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors[0] ?? 'Failed to update profile.')
  }

  return response.data.Data
}

//changePassword
export async function changePassword(payload: ChangePasswordDto): Promise<void> {
  console.log('Change password call:')

  try {
    await api.patch('/profile/password', payload)
  } catch (error) {
    throw new Error('Failed to change password.')
  }
}


export async function uploadAvatar(file: File): Promise<string> {
  const form = new FormData()
  form.append('File', file)
  const response = await api.post<ApiResponse<UploadFilesResultDto>>('/files', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  if (!response.data.IsSuccess || !response.data.Data) {
    throw new Error(response.data.Errors[0] ?? 'Failed to upload file.')
  }

  const uploadedUrl = response.data.Data.Url

  if (!uploadedUrl) {
    throw new Error('Upload succeeded but no file URL was returned.')
  }

  return uploadedUrl
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