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
  friendsCount?: number
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


export type PostDto = 
{
  Id: string
	AuthorId : string
	CreatedAtUtc : string
	Content : string
	ImageUrl : string
	IsLikedByCurrentUser : boolean
	LikesCount : number
	AuthorUsername : string
	AuthorFullName : string
	AuthorAvatarUrl : string | null
}

export type CursorPageDto<T> = 
{
  Items: T[]
  NextCursor: string | null
}

export type ProfilePostPreviewDto = {
  // public Guid Id { get; set; }
  // public Guid AuthorId { get; set; }
  // public string? ImageUrl { get; set; }

  Id: string
  AuthorId: string
  ImageUrl: string | null
}

export type ApiResponse<T> = {
  IsSuccess: boolean
  Data: T | null
  Errors: string[]
}

export type MyProfileDto = 
{
    // public Guid Id { get; init; }
    // public string Username { get; init; } = default!;
    // public string FullName { get; init; } = default!;
	// public string Email { get; init; } = default!;
	// public string? Bio { get; init; }
    // public string? AvatarUrl { get; init; }
    // public int PostsCount { get; init; }
    // public int FriendsCount { get; init; }

  Id: string
  Username: string
  FullName: string
	Email: string
	Bio: string | null
  AvatarUrl: string | null 
  PostsCount: number
  FriendsCount: number

}

export type UpdateProfileDto = 
{
// [StringLength(20, MinimumLength = 5)]
// public string? FullName { get; init; } // Nullable = optional update
// 
// public string? Bio { get; init; } // Nullable = optional update
// 
// [StringLength(15, MinimumLength = 3)] 
// public string? Username { get; init; } // Nullable = optional update
// 
// public string? AvatarUrl { get; init; } // Nullable = optional update
// 
// public string? Password { get; init; } // Nullable = optional update

  Username?: string | null
  FullName?: string | null
  Bio?: string | null
  AvatarUrl?: string | null
  Password?: string | null
}
