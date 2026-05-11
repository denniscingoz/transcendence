import { http, HttpResponse } from 'msw'
import { db, requireAuth } from './db'
import { mockPosts, mockComments, mockFeedPosts, mockFeedComments } from './posts'
import { ChangePasswordDto, SignUpRequestDto, GoogleSignInRequestDto, AuthResponseDto, AuthUserDto } from '../types/api'
import { mockFriends } from './friends'

export const handlers = [
  // Auth
  http.post('/api/auth/signin', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { message: 'Validation failed', details: { email: ['Required'], password: ['Required'] } },
        { status: 400 }
      )
    }
    const response: AuthResponseDto = {
      token: db.token,
      user: { id: '1', username: 'user' },
    }
    return HttpResponse.json(response)
  }),

http.post('/api/auth/signup', async ({ request }) => {
  const body = (await request.json()) as SignUpRequestDto

  if (!body.email || !body.password) {
    return HttpResponse.json(
      {
        message: 'Validation failed',
        details: {
          email: !body.email ? ['Required'] : [],
          password: !body.password ? ['Required'] : [],
        },
      },
      { status: 400 }
    )
  }
  const response: AuthResponseDto = {
    token: db.token,
    user: { id: '1', username: body.email.split('@')[0] },
  }
  return HttpResponse.json(response, { status: 201 })
}),

http.post('/api/auth/google', async ({ request }) => {
  const body = (await request.json()) as GoogleSignInRequestDto

  if (!body.idToken) {
    return HttpResponse.json(
      {
        message: 'Validation failed',
        details: {
          idToken: ['Required'],
        },
      },
      { status: 400 }
    )
  }
  const dto: AuthUserDto  = {
    id : '1',
    username: 'user'
  }
  const response: AuthResponseDto = {
    token: db.token,
    user: dto
  }

  return HttpResponse.json(response)
}),

  // Profile

  http.delete('/api/profile/me', ({ request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

  return HttpResponse.json({
    isSuccess: true,
    data: null,
    errors: [],
  })
}),

  http.get('/api/profile/me', ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })
    
    return HttpResponse.json({
      isSuccess: true,
      data: db.me,
      errors: [],
    })
  }),

  http.patch('/api/profile/password', async ({ request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const body = await request.json() as ChangePasswordDto

  if (!body.currentPassword || !body.newPassword) {
    return HttpResponse.json(
      {
        isSuccess: false,
        data: null,
        errors: ['Current password and new password are required.'],
      },
      { status: 400 }
    )
  }

  return new HttpResponse(null, { status: 204 })
}),
  
http.get('/api/posts/me', ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

    const url = new URL(request.url)
    const takeParam = url.searchParams.get('take')
    const cursorParam = url.searchParams.get('cursor')

    const take = takeParam ? Number(takeParam) : 20
    const cursor = cursorParam ?? null

    const allPosts = mockPosts ?? []

    let startIndex = 0

    if (cursor) {
      const foundIndex = allPosts.findIndex((post) => post.id === cursor)
      startIndex = foundIndex >= 0 ? foundIndex + 1 : 0
    }

    const items = allPosts.slice(startIndex, startIndex + take)
    const lastItem = items[items.length - 1]

    const nextCursor =
      startIndex + take < allPosts.length && lastItem ? lastItem.id : null

    return HttpResponse.json({
      isSuccess: true,
      data: {
        items: items,
        nextCursor: nextCursor,
      },
      errors: [],
    })
}),

http.get('/api/posts/feed', ({ request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const url = new URL(request.url)
  const take = Number(url.searchParams.get('take') ?? 20)
  const cursor = url.searchParams.get('cursor')

  let startIndex = 0

  if (cursor) {
    const index = mockFeedPosts.findIndex((post) => post.id === cursor)
    if (index >= 0) {
      startIndex = index + 1
    }
  }

  const items = mockFeedPosts.slice(startIndex, startIndex + take)
  const nextCursor =
    startIndex + take < mockFeedPosts.length
      ? items[items.length - 1]?.id ?? null
      : null

  return HttpResponse.json({
    isSuccess: true,
    data: {
      items: items,
      nextCursor: nextCursor,
    },
    errors: [],
  })
}),

http.get('/api/posts/:postId', ({ request, params }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const postId = params.postId as string
  const post = mockPosts.find((p) => p.id === postId) ?? mockFeedPosts.find((p) => p.id === postId)

  if (!post) {
    return HttpResponse.json(
      {
        isSuccess: false,
        data: null,
        errors: ['Post not found.'],
      },
      { status: 404 }
    )
  }

  return HttpResponse.json({
    isSuccess: true,
    data: post,
    errors: [],
  })
}),

http.post('/api/posts/:postId/comments', async ({ request, params }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const postId = params.postId as string
  const content = await request.json() as string

  const post =
    mockPosts.find((p) => p.id === postId) ??
    mockFeedPosts.find((p) => p.id === postId)

  if (!post) {
    return HttpResponse.json(
      {
        isSuccess: false,
        data: null,
        errors: ['Post not found.'],
      },
      { status: 404 }
    )
  }

  const newComment: (typeof mockComments)[number] = {
  id: crypto.randomUUID(),
  postId: postId,
  authorId: auth.user.id,
  createdAtUtc: new Date().toISOString(),
  content: content,
  username: auth.user.username,
  fullName: auth.user.fullName,
  authorProfileImageUrl: auth.user.avatarUrl ?? '',
}

  mockComments.unshift(newComment)

  return HttpResponse.json(
    {
      isSuccess: true,
      data: newComment,
      errors: [],
    },
    { status: 201 }
  )
}),

  http.patch('/api/profile/me', async ({ request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

  const patch = (await request.json()) as Partial<typeof db.me>
  db.me = { ...db.me, ...patch }

  return HttpResponse.json({
    isSuccess: true,
    data: db.me,
    errors: [],
  })
}),

  http.post('/api/files', ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

    return HttpResponse.json({
      isSuccess: true,
      data: {
        url: 'https://placehold.co/128x128?text=Uploaded',
      },
      errors: [],
    })
  }),

  http.post('/api/profile/me/avatar', ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

    // We won’t store binary in-memory; just simulate a new URL
    db.me = { ...db.me, avatarUrl: 'https://placehold.co/128x128?text=Avatar' }
    return HttpResponse.json(db.me)
  }),



  
  // Friends
  http.get('/api/friends/list', ({ request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  return HttpResponse.json({
    isSuccess: true,
    data: mockFriends,
    errors: [],
  })
}),

http.post('/api/friends/:targetUserId', ({ params, request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const targetUserId = params.targetUserId as string

  if (!targetUserId) {
    return HttpResponse.json(
      {
        isSuccess: false,
        data: null,
        errors: ['targetUserId required'],
      },
      { status: 400 }
    )
  }

  if (!mockFriends.find((f) => f.id === targetUserId)) {
    mockFriends.unshift({
      id: targetUserId,
      username: `user_${targetUserId.slice(0, 6)}`,
      fullName: `User ${targetUserId.slice(0, 6)}`,
      avatarUrl: null,
    })
  }

  return new HttpResponse(null, { status: 201 })
}),

http.delete('/api/friends/:friendUserId', ({ params, request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const friendUserId = params.friendUserId as string

  const index = mockFriends.findIndex((f) => f.id === friendUserId)
  if (index !== -1) {
    mockFriends.splice(index, 1)
  }

  return new HttpResponse(null, { status: 204 })
}),

    //Comments
  http.get('/api/posts/:postId/comments', ({ request, params }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const postId = params.postId as string
  const url = new URL(request.url)

  const takeParam = url.searchParams.get('take')
  const cursor = url.searchParams.get('cursor')
  const take = takeParam ? Number(takeParam) : 20

  const filteredComments = [...mockComments, ...mockFeedComments]
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => b.createdAtUtc.localeCompare(a.createdAtUtc))

  let startIndex = 0

  if (cursor) {
    const index = filteredComments.findIndex((comment) => comment.id === cursor)
    if (index >= 0) {
      startIndex = index + 1
    }
  }

  const items = filteredComments.slice(startIndex, startIndex + take)
  const nextCursor =
    startIndex + take < filteredComments.length
      ? items[items.length - 1]?.id ?? null
      : null

  return HttpResponse.json({
    isSuccess: true,
    data: {
      items: items,
      nextCursor: nextCursor,
    },
    errors: [],
  })
})

]


