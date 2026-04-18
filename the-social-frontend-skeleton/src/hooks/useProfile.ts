import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyProfile, getOtherProfile, updateMyProfile, uploadAvatar, getMyProfilePostPreviews, getOtherProfilePostPreviews,changePassword } from '../api/profile.api'
import type { UpdateProfileDto, ChangePasswordDto } from '../types/api'

export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: getMyProfile,
  })
}

export function useOtherProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getOtherProfile(userId),
    enabled: !!userId,
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
      if (!payload.currentPassword.trim()) {
        throw new Error('Current password is required.')
      }

      if (!payload.newPassword.trim()) {
        throw new Error('New password is required.')
      }

      return changePassword(payload)
    },
  })
}


export function useUploadAvatar() {
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
  })
}

export function useMyProfilePostPreviews(take = 12, cursor?: string | null) {
  const normalizedCursor = cursor ?? null

  return useQuery({
    queryKey: ['posts', 'me', take, normalizedCursor],
    queryFn: () => getMyProfilePostPreviews(take, normalizedCursor),
  })
}


export function useOtherProfilePostPreviews(
  userId: string,
  take = 12,
  cursor?: string | null,
  enabled = true
) {
  const normalizedCursor = cursor ?? null

  return useQuery({
    queryKey: ['posts', userId, take, normalizedCursor],
    queryFn: () => getOtherProfilePostPreviews(userId, take, normalizedCursor),
    enabled: !!userId && enabled,
  })
}