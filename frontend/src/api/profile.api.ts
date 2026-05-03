import api from './axios'
import type { MyProfileDto } from '../types/api'
import type { UpdateProfileDto, } from '../types/api'
import type {
  ApiResponse,
  CursorPageDto,
  ProfilePostPreviewDto,
  ChangePasswordDto,
  UploadFilesResultDto,
  OtherProfileDto
} from '../types/api'

export type UploadProgressHandler = (percent: number) => void

export type UploadAvatarInput = {
  file: File
  onProgress?: UploadProgressHandler
}

export async function getMyProfile(): Promise<MyProfileDto> {
  const response = await api.get<ApiResponse<MyProfileDto>>('/profile/me')

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors[0] ?? 'Failed to load profile.')
  }

  return response.data.data
}


export async function getOtherProfile(userId: string) {
  const response = await api.get<ApiResponse<OtherProfileDto>>(`/profile/${userId}`)

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors?.[0] ?? 'Failed to load profile.')
  }

  return response.data.data
}

export async function updateMyProfile(payload: Partial<UpdateProfileDto>): Promise<MyProfileDto> {
  const response = await api.patch<ApiResponse<MyProfileDto>>('/profile/me', payload)
  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors[0] ?? 'Failed to update profile.')
  }

  return response.data.data
}

//changePassword
export async function changePassword(payload: ChangePasswordDto): Promise<void> {
  await api.patch('/profile/password', payload)
}


export async function uploadAvatar(input: UploadAvatarInput | File): Promise<string> {
  const file = input instanceof File ? input : input.file
  const onProgress = input instanceof File ? undefined : input.onProgress

  const form = new FormData()
  form.append('File', file)
  const response = await api.post<ApiResponse<UploadFilesResultDto>>('/files', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) {
        return
      }

      const percent = Math.min(100, Math.max(0, Math.round((event.loaded * 100) / event.total)))
      onProgress(percent)
    },
  })

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors[0] ?? 'Failed to upload file.')
  }

  const uploadedUrl = response.data.data.fileId

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

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors[0] ?? 'Failed to load profile posts.')
  }

  return response.data.data
}



export async function getOtherProfilePostPreviews(
  userId: string,
  take = 20,
  cursor?: string | null
): Promise<CursorPageDto<ProfilePostPreviewDto>> {
  const response = await api.get<ApiResponse<CursorPageDto<ProfilePostPreviewDto>>>(
    `/posts/by-userId/${userId}`,
    {
      params: {
        take,
        cursor,
      },
    }
  )

  if (!response.data.isSuccess || !response.data.data) {
    throw new Error(response.data.errors?.[0] ?? 'Failed to load profile posts.')
  }

  return response.data.data
}
