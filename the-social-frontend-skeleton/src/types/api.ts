export type ApiError = {
  message: string
  details?: Record<string, string[]>
}

export type SignInRequestDto = { email: string; password: string }

export type ProfileDto = {
  Id: string
  FullName: string
  Email: string
  AvatarUrl?: string | null
  Username?: string
  Bio?: string
  PostsCount?: number
  FriendsCount?: number
}

export type FriendDto =
{
  Id: string
  Username?: string
  FullName: string
  AvatarUrl?: string | null
}

export type ChatMessageDto = {
  id: string
  fromUserId: string
  content: string
  sentAt: string
}


export type PostDto = 
{
  // public Guid Id { get; set; }
	// public Guid AuthorId { get; set; }
	// public DateTime CreatedAtUtc { get; set; }
	// public string? Content { get; set; }
	// public string? ImageUrl { get; set; }
	// public bool IsLikedByCurrentUser { get; set; }
	// public int LikesCount { get; set; }
	// public string? AuthorUsername { get; set; }
	// public string? AuthorFullName { get; set; }
	// public string? AuthorAvatarUrl { get; set; }
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

export type UploadFilesResultDto = {
  Url: string
  FileId: string
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

export type ChangePasswordDto = 
{
	// [Required]
	// public string CurrentPassword { get; init; } = default!;
// 
	// [Required]
	// [StringLength(100, MinimumLength = 8)]
	// public string NewPassword { get; init; } = default!;

  CurrentPassword: string
  NewPassword: string

}


export type CommentPreviewDto = 
{
	// public Guid Id { get; set; }
	// public Guid PostId { get; set; }
	// public Guid AuthorId { get; set; }
	// public DateTime CreatedAtUtc { get; set; }
	// public string Content { get; set; } = default!;
	
  // public string Username { get; set; } = default!;
	// public string FullName { get; set; } = default!;
	// public string AuthorProfileImageUrl { get; set; } = default!;

  Id: string
  PostId: string
  AuthorId: string
  CreatedAtUtc: string
  Content: string

  Username: string
  FullName: string
  AuthorProfileImageUrl: string | null

}


export type SignUpRequestDto =
{
	// [Required]
	// [EmailAddress]
	// [MaxLength(255)]
	// public string Email { get; set; } = string.Empty;
// 
	// [Required]
	// [StringLength(100, MinimumLength = 8)]
	// public string Password { get; set; } = string.Empty;
// 
	// [Required]
	// [MaxLength(100)]
	// public string FullName { get; set; } = string.Empty;
// 
	// [Required]
	// [MaxLength(50)]
	// public string Username { get; set; } = string.Empty;
  Email: string
  Password: string
  FullName: string
  Username: string

}

export type AuthResponseDto = 
{
  token : string
}

export interface GoogleSignInRequestDto {
  credential: string // JWT token from Google
}

export type OtherProfileDto = 
{
    // public Guid Id { get; init; }
    // public string Username { get; init; } = default!;
    // public string FullName { get; init; } = default!;
    // public string? Bio { get; init; }
    // public string? AvatarUrl { get; init; }
    // public int PostsCount { get; init; }
	// public int FriendsCount { get; init; }
	// public bool AreWeFriends { get; init; }

  Id: string
  Username: string
  FullName: string
  Bio?: string | null
  AvatarUrl?: string | null
  PostCount: string
  FriendsCount: string
  AreWeFriends: string
}

