import { http, HttpResponse } from 'msw'
import { db, requireAuth } from './db'
import { mockPosts, mockComments, mockFeedPosts, mockFeedComments } from './posts'
import { ChangePasswordDto, SignUpRequestDto, GoogleSignInRequestDto, AuthResponseDto } from '../types/api'
import { mockFriends } from './friends'

export const handlers = [
  // Auth
  http.post('/auth/signin', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { message: 'Validation failed', details: { email: ['Required'], password: ['Required'] } },
        { status: 400 }
      )
    }
    return HttpResponse.json({ token: db.token })
  }),

http.post('/auth/signup', async ({ request }) => {
  const body = (await request.json()) as SignUpRequestDto

  if (!body.Email || !body.Password) {
    return HttpResponse.json(
      {
        message: 'Validation failed',
        details: {
          email: !body.Email ? ['Required'] : [],
          password: !body.Password ? ['Required'] : [],
        },
      },
      { status: 400 }
    )
  }

  return HttpResponse.json({ token: db.token })
}),

http.post('/auth/google', async ({ request }) => {
  const body = (await request.json()) as GoogleSignInRequestDto

  if (!body.credential) {
    return HttpResponse.json(
      {
        message: 'Validation failed',
        details: {
          credential: ['Required'],
        },
      },
      { status: 400 }
    )
  }

  const response: AuthResponseDto = {
    token: db.token,
  }

  return HttpResponse.json(response)
}),

  // Profile

  http.delete('/profile/me', ({ request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

  return HttpResponse.json({
    IsSuccess: true,
    Data: null,
    Errors: [],
  })
}),

  http.get('/profile/me', ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })
    
    return HttpResponse.json({
      IsSuccess: true,
      Data: db.me,
      Errors: [],
    })
  }),

  http.patch('/profile/password', async ({ request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const body = await request.json() as ChangePasswordDto

  if (!body.CurrentPassword || !body.NewPassword) {
    return HttpResponse.json(
      {
        IsSuccess: false,
        Data: null,
        Errors: ['Current password and new password are required.'],
      },
      { status: 400 }
    )
  }

  return new HttpResponse(null, { status: 204 })
}),
  
http.get('/posts/me', ({ request }) => {
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
      const foundIndex = allPosts.findIndex((post) => post.Id === cursor)
      startIndex = foundIndex >= 0 ? foundIndex + 1 : 0
    }

    const items = allPosts.slice(startIndex, startIndex + take)
    const lastItem = items[items.length - 1]

    const nextCursor =
      startIndex + take < allPosts.length && lastItem ? lastItem.Id : null

    return HttpResponse.json({
      IsSuccess: true,
      Data: {
        Items: items,
        NextCursor: nextCursor,
      },
      Errors: [],
    })
}),

http.get('/posts/feed', ({ request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const url = new URL(request.url)
  const take = Number(url.searchParams.get('take') ?? 20)
  const cursor = url.searchParams.get('cursor')

  let startIndex = 0

  if (cursor) {
    const index = mockFeedPosts.findIndex((post) => post.Id === cursor)
    if (index >= 0) {
      startIndex = index + 1
    }
  }

  const items = mockFeedPosts.slice(startIndex, startIndex + take)
  const nextCursor =
    startIndex + take < mockFeedPosts.length
      ? items[items.length - 1]?.Id ?? null
      : null

  return HttpResponse.json({
    IsSuccess: true,
    Data: {
      Items: items,
      NextCursor: nextCursor,
    },
    Errors: [],
  })
}),

http.get('/posts/:postId', ({ request, params }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const postId = params.postId as string
  const post = mockPosts.find((p) => p.Id === postId) ?? mockFeedPosts.find((p) => p.Id === postId)

  if (!post) {
    return HttpResponse.json(
      {
        IsSuccess: false,
        Data: null,
        Errors: ['Post not found.'],
      },
      { status: 404 }
    )
  }

  return HttpResponse.json({
    IsSuccess: true,
    Data: post,
    Errors: [],
  })
}),

http.post('/posts/:postId/comments', async ({ request, params }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const postId = params.postId as string
  const content = await request.json() as string

  const post =
    mockPosts.find((p) => p.Id === postId) ??
    mockFeedPosts.find((p) => p.Id === postId)

  if (!post) {
    return HttpResponse.json(
      {
        IsSuccess: false,
        Data: null,
        Errors: ['Post not found.'],
      },
      { status: 404 }
    )
  }

  const newComment: (typeof mockComments)[number] = {
  Id: crypto.randomUUID(),
  PostId: postId,
  AuthorId: auth.user.Id,
  CreatedAtUtc: new Date().toISOString(),
  Content: content,
  Username: auth.user.Username,
  FullName: auth.user.FullName,
  AuthorProfileImageUrl: auth.user.AvatarUrl ?? '',
}

  mockComments.unshift(newComment)

  return HttpResponse.json(
    {
      IsSuccess: true,
      Data: newComment,
      Errors: [],
    },
    { status: 201 }
  )
}),

  http.patch('/profile/me', async ({ request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

  const patch = (await request.json()) as Partial<typeof db.me>
  db.me = { ...db.me, ...patch }

  return HttpResponse.json({
    IsSuccess: true,
    Data: db.me,
    Errors: [],
  })
}),

  http.post('/files', ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

    return HttpResponse.json({
      IsSuccess: true,
      Data: {
        Url: 'https://placehold.co/128x128?text=Uploaded',
      },
      Errors: [],
    })
  }),

  http.post('/profile/me/avatar', ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

    // We won’t store binary in-memory; just simulate a new URL
    db.me = { ...db.me, AvatarUrl: 'https://placehold.co/128x128?text=Avatar' }
    return HttpResponse.json(db.me)
  }),



  
  // Friends
  http.get('/friends/list', ({ request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  return HttpResponse.json({
    IsSuccess: true,
    Data: mockFriends,
    Errors: [],
  })
}),

http.post('/friends/:targetUserId', ({ params, request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const targetUserId = params.targetUserId as string

  if (!targetUserId) {
    return HttpResponse.json(
      {
        IsSuccess: false,
        Data: null,
        Errors: ['targetUserId required'],
      },
      { status: 400 }
    )
  }

  if (!mockFriends.find((f) => f.Id === targetUserId)) {
    mockFriends.unshift({
      Id: targetUserId,
      Username: `user_${targetUserId.slice(0, 6)}`,
      FullName: `User ${targetUserId.slice(0, 6)}`,
      AvatarUrl: null,
    })
  }

  return new HttpResponse(null, { status: 201 })
}),

http.delete('/friends/:friendUserId', ({ params, request }) => {
  const auth = requireAuth(request)
  if (!auth.ok) {
    return HttpResponse.json(auth.body, { status: auth.status })
  }

  const friendUserId = params.friendUserId as string

  const index = mockFriends.findIndex((f) => f.Id === friendUserId)
  if (index !== -1) {
    mockFriends.splice(index, 1)
  }

  return new HttpResponse(null, { status: 204 })
}),

    //Comments
  http.get('/posts/:postId/comments', ({ request, params }) => {
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
    .filter((comment) => comment.PostId === postId)
    .sort((a, b) => b.CreatedAtUtc.localeCompare(a.CreatedAtUtc))

  let startIndex = 0

  if (cursor) {
    const index = filteredComments.findIndex((comment) => comment.Id === cursor)
    if (index >= 0) {
      startIndex = index + 1
    }
  }

  const items = filteredComments.slice(startIndex, startIndex + take)
  const nextCursor =
    startIndex + take < filteredComments.length
      ? items[items.length - 1]?.Id ?? null
      : null

  return HttpResponse.json({
    IsSuccess: true,
    Data: {
      Items: items,
      NextCursor: nextCursor,
    },
    Errors: [],
  })
})

]


