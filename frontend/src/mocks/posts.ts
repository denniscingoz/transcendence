
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
    id: '1',
    authorId: '101',
    createdAtUtc: '2026-03-27T10:00:00Z',
    content: 'me myself and summer',
    imageUrl: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&h=400&fit=crop',
    isLikedByCurrentUser: true,
    likesCount: 14,
    authorUsername: 'michauser',
    authorFullName: 'Micha',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    authorId: '102',
    createdAtUtc: '2026-03-27T11:30:00Z',
    content: 'Yes yesy yesy yesy',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop',
    isLikedByCurrentUser: false,
    likesCount: 11,
    authorUsername: 'michauser',
    authorFullName: 'Micha',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    authorId: '103',
    createdAtUtc: '2026-03-27T12:45:00Z',
    content: 'zzzzzzzzzzzz',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1774026824616-42d56bb536b3?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isLikedByCurrentUser: true,
    likesCount: 123,
    authorUsername: 'michauser',
    authorFullName: 'Micha',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: '4',
    authorId: '104',
    createdAtUtc: '2026-03-27T14:10:00Z',
    content: 'Haydi guzelim seker ezelim',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1773772042727-f6151082bd83?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isLikedByCurrentUser: false,
    likesCount: 25,
    authorUsername: 'michauser',
    authorFullName: 'Micha',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: '5',
    authorId: '105',
    createdAtUtc: '2026-03-27T15:00:00Z',
    content: 'Turn the upside down',
    imageUrl: 'https://images.unsplash.com/photo-1773332585956-2d0e8ac80cb6?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isLikedByCurrentUser: false,
    likesCount: 0,
    authorUsername: 'michauser',
    authorFullName: 'Micha',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
]

export const mockComments = [
  { id: 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', postId: '1', authorId: '99999999-9999-9999-9999-999999999999', createdAtUtc: "2026-03-29T15:30:00Z", content: 'mockCommentsTry', username: 'michaUser', fullName: 'Micha', authorProfileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', postId: '1', authorId: '99999999-9999-9999-9999-999999999999', createdAtUtc: "2026-03-29T15:10:00Z", content: 'mockCommentsTry2', username: 'michaUser', fullName: 'Micha', authorProfileImageUrl: '' },
  { id: 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', postId: '1', authorId: '99999999-9999-9999-9999-999999999999', createdAtUtc: "2026-03-29T12:20:00Z", content: 'mockCommentsTry3', username: 'michaUser', fullName: 'Micha', authorProfileImageUrl: '' },
]





export const mockFeedPosts = [
  {
    id: 'feed-1',
    authorId: '201',
    createdAtUtc: '2026-03-28T08:15:00Z',
    content: 'Morning walk before the city wakes up.',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=900&fit=crop',
    isLikedByCurrentUser: true,
    likesCount: 42,
    authorUsername: 'lena.moves',
    authorFullName: 'Lena Weiss',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  },
  {
    id: 'feed-2',
    authorId: '202',
    createdAtUtc: '2026-03-28T10:40:00Z',
    content: 'Coffee, laptop, and a very long to-do list.',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=900&fit=crop',
    isLikedByCurrentUser: true,
    likesCount: 87,
    authorUsername: 'emir.codes',
    authorFullName: 'Emir Kaya',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
  },
  {
    id: 'feed-3',
    authorId: '203',
    createdAtUtc: '2026-03-28T13:05:00Z',
    content: 'Found this corner and had to take the shot.',
    imageUrl: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1200&h=900&fit=crop',
    isLikedByCurrentUser: false,
    likesCount: 156,
    authorUsername: 'sofia.frames',
    authorFullName: 'Sofia Marin',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
  },
  {
    id: 'feed-4',
    authorId: '204',
    createdAtUtc: '2026-03-28T16:20:00Z',
    content: 'Tried a new recipe. It actually worked.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=900&fit=crop',
    isLikedByCurrentUser: true,
    likesCount: 64,
    authorUsername: 'noah.cooks',
    authorFullName: 'Noah Fischer',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
  },
  {
    id: 'feed-5',
    authorId: '205',
    createdAtUtc: '2026-03-28T19:50:00Z',
    content: 'Blue hour always wins.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=900&fit=crop',
    isLikedByCurrentUser: false,
    likesCount: 203,
    authorUsername: 'mia.skies',
    authorFullName: 'Mia Novak',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop',
  },
]

export const mockFeedComments = [
  {
    id: 'feed-comment-1',
    postId: 'feed-1',
    authorId: '301',
    createdAtUtc: "2026-03-29T15:30:00Z",
    content: 'This looks very calm. Good shot.',
    username: 'deniz.light',
    fullName: 'Deniz Cingoz',
    authorProfileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  },
  {
    id: 'feed-comment-2',
    postId: 'feed-1',
    authorId: '302',
    createdAtUtc: "2026-03-29T15:30:00Z",
    content: 'The light is perfect here.',
    username: 'jana.view',
    fullName: 'Jana Berger',
    authorProfileImageUrl: '',
  },
  {
    id: 'feed-comment-3',
    postId: 'feed-2',
    authorId: '303',
    createdAtUtc: "2026-03-29T15:30:00Z",
    content: 'That setup looks painfully familiar.',
    username: 'alex.dev',
    fullName: 'Alex Winter',
    authorProfileImageUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=200&h=200&fit=crop',
  },
  {
    id: 'feed-comment-4',
    postId: 'feed-3',
    authorId: '304',
    createdAtUtc: "2026-03-29T15:30:00Z",
    content: 'Very strong composition.',
    username: 'nina.lines',
    fullName: 'Nina Hoffmann',
    authorProfileImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
  },
  {
    id: 'feed-comment-5',
    postId: 'feed-3',
    authorId: '305',
    createdAtUtc: "2026-03-29T15:30:00Z",
    content: 'Where was this taken?',
    username: 'mark.urban',
    fullName: 'Mark Steiner',
    authorProfileImageUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=200&h=200&fit=crop',
  },
  {
    id: 'feed-comment-6',
    postId: 'feed-4',
    authorId: '306',
    createdAtUtc: "2026-03-29T15:30:00Z",
    content: 'Now I am hungry.',
    username: 'sara.notes',
    fullName: 'Sara Klein',
    authorProfileImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
  },
  {
    id: 'feed-comment-7',
    postId: 'feed-5',
    authorId: '307',
    createdAtUtc: "2026-03-29T15:30:00Z",
    content: 'The colours are excellent.',
    username: 'leo.camera',
    fullName: 'Leo Martin',
    authorProfileImageUrl: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=200&h=200&fit=crop',
  },
  {
    id: 'feed-comment-8',
    postId: 'feed-5',
    authorId: '308',
    createdAtUtc: "2026-03-29T15:30:00Z",
    content: 'This deserves more likes.',
    username: 'eva.pixel',
    fullName: 'Eva Lang',
    authorProfileImageUrl: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=200&h=200&fit=crop',
  },
]