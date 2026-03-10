export type ApiError = {
  message: string
  details?: Record<string, string[]>
}

export type LoginRequest = { email: string; password: string }
export type LoginResponse = { token: string }

export type ProfileDto = {
  id: string
  displayName: string
  email: string
  avatarUrl?: string | null
  username?: string
  bio?: string
  postsCount?: number
  followersCount?: number
  followingCount?: number
}

export type FriendDto = {
  id: string
  displayName: string
  avatarUrl?: string | null
  username?: string
  isOnline?: boolean
  isFollowing?: boolean
}

export type ChatMessageDto = {
  id: string
  fromUserId: string
  content: string
  sentAt: string
}