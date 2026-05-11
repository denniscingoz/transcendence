import { ProfilePostPreviewDto } from "../types/api"

export type User = {
  id: string
  username: string
  email: string
  fullName: string
  bio: string | null
  avatarUrl?: string | null
  role: string | null
  friendsCount: number
  postsCount: number
}

export type Friend = {
  id: string
  displayName: string
  avatarUrl?: string | null
  isOnline?: boolean
}

export type ChatMessage = {
  id: string
  fromUserId: string
  toUserId: string
  content: string
  sentAt: string
}

export const db: {
  token: string
  me: User
  friends: Friend[]
  chat: Map<string, ChatMessage[]>
} = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1LW1lIiwiZXhwIjo0MTAyNDQ0ODAwfQ.mocksig',
  me: {
    id: 'u-me',
    username: 'michauser',
    fullName: 'Micha',
    email: 'micha@mail.com',
    bio: 'Bio details for Micha',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    postsCount: 134,
    friendsCount: 222,
    role: null,
  },
  friends: [ /* ... */ ],
  chat: new Map(),
}

type AuthResult =
  | {
      ok: true
      user: {
        id: string
        username: string
        fullName: string
        avatarUrl?: string | null
      }
    }
  | {
      ok: false
      status: number
      body: { message: string }
    }

export function requireAuth(req: Request): AuthResult {
  const auth = req.headers.get('authorization')

  if (!auth?.startsWith('Bearer ')) {
    return { ok: false, status: 401, body: { message: 'Unauthorized' } }
  }

  return {
    ok: true,
    user: {
      id: db.me.id,
      username: db.me.username,
      fullName: db.me.fullName,
      avatarUrl: db.me.avatarUrl,
    },
  }
}