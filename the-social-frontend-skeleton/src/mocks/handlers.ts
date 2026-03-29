import { http, HttpResponse } from 'msw'
import { db, requireAuth } from './db'
import { mockPosts, mockComments, mockFeedPosts } from './posts'

export const handlers = [
  // Auth
  http.post('/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { message: 'Validation failed', details: { email: ['Required'], password: ['Required'] } },
        { status: 400 }
      )
    }
    return HttpResponse.json({ token: db.token })
  }),

  // Profile
  http.get('/profile/me', ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })
    
    return HttpResponse.json({
      IsSuccess: true,
      Data: db.me,
      Errors: [],
    })
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


  http.post('/profile/me/avatar', ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

    // We won’t store binary in-memory; just simulate a new URL
    db.me = { ...db.me, avatarUrl: 'https://placehold.co/128x128?text=Avatar' }
    return HttpResponse.json(db.me)
  }),

  // Friends
  http.get('/friends', ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })
    return HttpResponse.json(db.friends)
  }),

  http.post('/friends', async ({ request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

    const body = (await request.json()) as { friendId: string }
    if (!body.friendId) return HttpResponse.json({ message: 'friendId required' }, { status: 400 })

    // Create a fake friend if not exists
    if (!db.friends.find(f => f.id === body.friendId)) {
      db.friends.unshift({
        id: body.friendId,
        displayName: `User ${body.friendId.slice(0, 6)}`,
        avatarUrl: null,
        isOnline: Math.random() > 0.5,
      })
    }
    return HttpResponse.json({}, { status: 200 })
  }),

  http.delete('/friends/:friendId', ({ params, request }) => {
    const auth = requireAuth(request)
    if (!auth.ok) return HttpResponse.json(auth.body, { status: auth.status })

    const friendId = params.friendId as string
    db.friends = db.friends.filter(f => f.id !== friendId)
    return HttpResponse.json({}, { status: 200 })
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

  const filteredComments = mockComments
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


