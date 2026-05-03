import { ProfilePostPreviewDto } from "../types/api"

export type User = {
  Id: string
  Username: string
  Email: string
  FullName: string
  Bio: string | null
  AvatarUrl?: string | null
  Role: string | null
  FriendsCount: number
  PostsCount: number
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
  token: 'mock-jwt-token',
  me: {
    Id: 'u-me',
    Username: 'michauser',
    FullName: 'Micha',
    Email: 'micha@mail.com',
    Bio: 'Bio details for Micha',
    AvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    PostsCount: 134,
    FriendsCount: 222,
    Role: null,
  },
  friends: [ /* ... */ ],
  chat: new Map(),
}

type AuthResult =
  | {
      ok: true
      user: {
        Id: string
        Username: string
        FullName: string
        AvatarUrl?: string | null
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
      Id: db.me.Id,
      Username: db.me.Username,
      FullName: db.me.FullName,
      AvatarUrl: db.me.AvatarUrl,
    },
  }
}