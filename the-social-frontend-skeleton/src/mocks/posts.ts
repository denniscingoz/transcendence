
// export type PostDto = 
// {
  // Id: string
	// AuthorId : string
	// CreatedAtUtc : string
	// Content : string
	// ImageUrl : string
	// IsLikedByCurrentUser : boolean
	// LikesCount : number
	// AuthorUsername : string
	// AuthorFullName : string
	// AuthorAvatarUrl : string | null
// }



// export const mockPosts = [
//   { id: '11111111-1111-1111-1111-111111111111', imageUrl: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&h=400&fit=crop', content: 'me myself and summer', likesCount: 14 },
//   { id: '22222222-2222-2222-2222-222222222222', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop', content: 'YEs yesy yesy yesy', likesCount: 11 },
//   { id: '33333333-3333-3333-3333-333333333333', imageUrl: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&h=400&fit=crop', content: 'zzzzzzzzzzzz', likesCount: 123 },
//   { id: '44444444-4444-4444-4444-444444444444', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop', content: 'Haydi guzelim seker ezelim', likesCount: 25 },
//   { id: '55555555-5555-5555-5555-555555555555', imageUrl: 'https://images.unsplash.com/photo-1773332585956-2d0e8ac80cb6?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', content: 'Turn the upside down', likesCount: 0 },
// ]

export const mockPosts = [
  {
    Id: '1',
    AuthorId: '101',
    CreatedAtUtc: '2026-03-27T10:00:00Z',
    Content: 'me myself and summer',
    ImageUrl: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&h=400&fit=crop',
    IsLikedByCurrentUser: true,
    LikesCount: 14,
    AuthorUsername: 'michauser',
    AuthorFullName: 'Micha',
    AuthorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    Id: '2',
    AuthorId: '102',
    CreatedAtUtc: '2026-03-27T11:30:00Z',
    Content: 'Yes yesy yesy yesy',
    ImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop',
    IsLikedByCurrentUser: false,
    LikesCount: 11,
    AuthorUsername: 'michauser',
    AuthorFullName: 'Micha',
    AuthorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    Id: '3',
    AuthorId: '103',
    CreatedAtUtc: '2026-03-27T12:45:00Z',
    Content: 'zzzzzzzzzzzz',
    ImageUrl: 'https://plus.unsplash.com/premium_photo-1774026824616-42d56bb536b3?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    IsLikedByCurrentUser: true,
    LikesCount: 123,
    AuthorUsername: 'michauser',
    AuthorFullName: 'Micha',
    AuthorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    Id: '4',
    AuthorId: '104',
    CreatedAtUtc: '2026-03-27T14:10:00Z',
    Content: 'Haydi guzelim seker ezelim',
    ImageUrl: 'https://plus.unsplash.com/premium_photo-1773772042727-f6151082bd83?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    IsLikedByCurrentUser: false,
    LikesCount: 25,
    AuthorUsername: 'michauser',
    AuthorFullName: 'Micha',
    AuthorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    Id: '5',
    AuthorId: '105',
    CreatedAtUtc: '2026-03-27T15:00:00Z',
    Content: 'Turn the upside down',
    ImageUrl: 'https://images.unsplash.com/photo-1773332585956-2d0e8ac80cb6?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    IsLikedByCurrentUser: false,
    LikesCount: 0,
    AuthorUsername: 'michauser',
    AuthorFullName: 'Micha',
    AuthorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
]

export const mockComments = [
  { Id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', postId: '1', authorId: '99999999-9999-9999-9999-999999999999', createdAtUtc: 23123123, Content: 'mockCommentsTry', Username: 'michaUser', FullName: 'Micha', AuthorProfileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { Id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', postId: '1', authorId: '99999999-9999-9999-9999-999999999999', createdAtUtc: 23123125, Content: 'mockCommentsTry2', Username: 'michaUser', FullName: 'Micha', AuthorProfileImageUrl: '' },
  { Id: 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', postId: '1', authorId: '99999999-9999-9999-9999-999999999999', createdAtUtc: 23123126, Content: 'mockCommentsTry3', Username: 'michaUser', FullName: 'Micha', AuthorProfileImageUrl: '' },
]





export const mockFeedPosts = [
  {
    Id: 'feed-1',
    AuthorId: '201',
    CreatedAtUtc: '2026-03-28T08:15:00Z',
    Content: 'Morning walk before the city wakes up.',
    ImageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=900&fit=crop',
    IsLikedByCurrentUser: false,
    LikesCount: 42,
    AuthorUsername: 'lena.moves',
    AuthorFullName: 'Lena Weiss',
    AuthorAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-2',
    AuthorId: '202',
    CreatedAtUtc: '2026-03-28T10:40:00Z',
    Content: 'Coffee, laptop, and a very long to-do list.',
    ImageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=900&fit=crop',
    IsLikedByCurrentUser: true,
    LikesCount: 87,
    AuthorUsername: 'emir.codes',
    AuthorFullName: 'Emir Kaya',
    AuthorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-3',
    AuthorId: '203',
    CreatedAtUtc: '2026-03-28T13:05:00Z',
    Content: 'Found this corner and had to take the shot.',
    ImageUrl: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1200&h=900&fit=crop',
    IsLikedByCurrentUser: false,
    LikesCount: 156,
    AuthorUsername: 'sofia.frames',
    AuthorFullName: 'Sofia Marin',
    AuthorAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-4',
    AuthorId: '204',
    CreatedAtUtc: '2026-03-28T16:20:00Z',
    Content: 'Tried a new recipe. It actually worked.',
    ImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=900&fit=crop',
    IsLikedByCurrentUser: true,
    LikesCount: 64,
    AuthorUsername: 'noah.cooks',
    AuthorFullName: 'Noah Fischer',
    AuthorAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-5',
    AuthorId: '205',
    CreatedAtUtc: '2026-03-28T19:50:00Z',
    Content: 'Blue hour always wins.',
    ImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=900&fit=crop',
    IsLikedByCurrentUser: false,
    LikesCount: 203,
    AuthorUsername: 'mia.skies',
    AuthorFullName: 'Mia Novak',
    AuthorAvatarUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop',
  },
]

export const mockFeedComments = [
  {
    Id: 'feed-comment-1',
    postId: 'feed-1',
    authorId: '301',
    createdAtUtc: 23123131,
    Content: 'This looks very calm. Good shot.',
    Username: 'deniz.light',
    FullName: 'Deniz Cingoz',
    AuthorProfileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-comment-2',
    postId: 'feed-1',
    authorId: '302',
    createdAtUtc: 23123132,
    Content: 'The light is perfect here.',
    Username: 'jana.view',
    FullName: 'Jana Berger',
    AuthorProfileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-comment-3',
    postId: 'feed-2',
    authorId: '303',
    createdAtUtc: 23123133,
    Content: 'That setup looks painfully familiar.',
    Username: 'alex.dev',
    FullName: 'Alex Winter',
    AuthorProfileImageUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-comment-4',
    postId: 'feed-3',
    authorId: '304',
    createdAtUtc: 23123134,
    Content: 'Very strong composition.',
    Username: 'nina.lines',
    FullName: 'Nina Hoffmann',
    AuthorProfileImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-comment-5',
    postId: 'feed-3',
    authorId: '305',
    createdAtUtc: 23123135,
    Content: 'Where was this taken?',
    Username: 'mark.urban',
    FullName: 'Mark Steiner',
    AuthorProfileImageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-comment-6',
    postId: 'feed-4',
    authorId: '306',
    createdAtUtc: 23123136,
    Content: 'Now I am hungry.',
    Username: 'sara.notes',
    FullName: 'Sara Klein',
    AuthorProfileImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-comment-7',
    postId: 'feed-5',
    authorId: '307',
    createdAtUtc: 23123137,
    Content: 'The colours are excellent.',
    Username: 'leo.camera',
    FullName: 'Leo Martin',
    AuthorProfileImageUrl: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=200&h=200&fit=crop',
  },
  {
    Id: 'feed-comment-8',
    postId: 'feed-5',
    authorId: '308',
    createdAtUtc: 23123138,
    Content: 'This deserves more likes.',
    Username: 'eva.pixel',
    FullName: 'Eva Lang',
    AuthorProfileImageUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=200&h=200&fit=crop',
  },
]