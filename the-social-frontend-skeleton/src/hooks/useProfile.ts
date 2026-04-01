import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyProfile, updateMyProfile, uploadAvatar, getMyProfilePostPreviews, changePassword } from '../api/profile.api'
import type { UpdateProfileDto, ChangePasswordDto } from '../types/api'

export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: getMyProfile,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Partial<UpdateProfileDto>) => updateMyProfile(p),
    onSuccess: (data) => {
      qc.setQueryData(['profile', 'me'], data)
    },
  })
}

export function useChangePassword() {
  return useMutation<void, Error, ChangePasswordDto>({
    mutationFn: (payload: ChangePasswordDto) => {
      if (!payload.CurrentPassword.trim()) {
        throw new Error('Current password is required.')
      }

      if (!payload.NewPassword.trim()) {
        throw new Error('New password is required.')
      }

      return changePassword(payload)
    },
  })
}


export function useUploadAvatar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: (data) => {
      qc.setQueryData(['profile', 'me'], data)
    },
  })
}

export function useMyProfilePostPreviews(take = 12, cursor?: string | null) {
  const normalizedCursor = cursor ?? null

  return useQuery({
    queryKey: ['posts', 'me', take, normalizedCursor],
    queryFn: () => getMyProfilePostPreviews(take, normalizedCursor),
  })
}