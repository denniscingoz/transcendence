import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyProfile, updateMyProfile, uploadAvatar, getMyProfilePostPreviews } from '../api/profile.api'
import type { UpdateProfileDto } from '../types/api'

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