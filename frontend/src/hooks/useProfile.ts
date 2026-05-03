import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyProfile, getOtherProfile, updateMyProfile, uploadAvatar, getMyProfilePostPreviews, getOtherProfilePostPreviews,changePassword } from '../api/profile.api'
import type { UpdateProfileDto, ChangePasswordDto } from '../types/api'
import type { UploadAvatarInput } from '../api/profile.api'

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
  return useMutation<string, Error, UploadAvatarInput | File>({
    mutationFn: uploadAvatar,
  })
}

export function useMyProfilePostPreviews(take = 12) {
  return useInfiniteQuery({
    queryKey: ['posts', 'me', take],
    queryFn: ({ pageParam }) => getMyProfilePostPreviews(take, (pageParam ?? null) as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}


export function useOtherProfilePostPreviews(
  userId: string,
  take = 12,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: ['posts', userId, take],
    queryFn: ({ pageParam }) => getOtherProfilePostPreviews(userId, take, (pageParam ?? null) as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!userId && enabled,
  })
}