export type ApiError = {
  message: string
  details?: Record<string, string[]>
}

export type SignInRequestDto = { email: string; password: string }

export type ProfileDto = {
  id: string
  fullName: string
  email: string
  avatarUrl?: string | null
  username?: string
  bio?: string
  postsCount?: number
  friendsCount?: number
}

export type FriendDto =
{
  id: string
  username?: string
  fullName: string
  avatarUrl?: string | null
}
 


export type PostDto = 
{

	// public Guid Id { get; set; }
	// public Guid AuthorId { get; set; }
	// public DateTime CreatedAtUtc { get; set; }
	// public string? Content { get; set; }
	// public Guid ImageFileId { get; set; }
	// public string? ImageUrl { get; set; }
	// public string? ContentType { get; set; }
	// public bool IsLikedByCurrentUser { get; set; }
	// public int LikesCount { get; set; }
	// public string? AuthorUsername { get; set; }
	// public string? AuthorFullName { get; set; }
	// public string? AuthorAvatarUrl { get; set; }

  id: string
	authorId : string
	createdAtUtc : string
	content : string
  imageFileId: string
	imageUrl : string
  contentType: string
	isLikedByCurrentUser : boolean
	likesCount : number
	authorUsername : string
	authorFullName : string
	authorAvatarUrl : string | null
}

export type CursorPageDto<T> = 
{
  items: T[]
  nextCursor: string | null
}

export type ProfilePostPreviewDto = {
  // public Guid Id { get; set; }
	// public Guid AuthorId { get; set; }
	// 
	// public DateTime CreatedAtUtc { get; set; }//dasha: a stable sorting field needed
	// public Guid ImageFileId { get; set; }
	// public string? ImageUrl { get; set; }
	// public string? ContentType { get; set; }

  id: string
  authorId: string

  imageUrl: string | null
  imageFileId: string | null
  contentType: string | null
}

export type ApiResponse<T> = {
  isSuccess: boolean
  data: T | null
  errors: string[]
}

export type UploadFilesResultDto = {
  url: string
  fileId: string
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

  id: string
  username: string
  fullName: string
	email: string
	bio: string | null
  avatarUrl: string | null 
  postsCount: number
  friendsCount: number

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

  username?: string | null
  fullName?: string | null
  bio?: string | null
  avatarUrl?: string | null
  password?: string | null
}

export type ChangePasswordDto = 
{
	// [Required]
	// public string CurrentPassword { get; init; } = default!;
// 
	// [Required]
	// [StringLength(100, MinimumLength = 8)]
	// public string NewPassword { get; init; } = default!;

  currentPassword: string
  newPassword: string

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

  id: string
  postId: string
  authorId: string
  createdAtUtc: string
  content: string

  username: string
  fullName: string
  authorProfileImageUrl: string | null

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
  email: string
  password: string
  fullName: string
  username: string

}

export type AuthUserDto = {
  id: string
  username: string
}

export type AuthResponseDto = {
  token: string
  user: AuthUserDto
}
export interface GoogleSignInRequestDto {
  idToken: string // JWT token from Google
}


export type FriendshipStatus = 'friends' | 'outgoingRequest' | 'incomingRequest' | 'none'

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

  id: string
  username: string
  fullName: string
  bio?: string | null
  avatarUrl?: string | null
  postsCount: number
  friendsCount: number
  friendShipStatus: FriendshipStatus
}

export type CreatePostDto = 
{
	// public string? Content { get; init; }
	// public Guid ImageFileId { get; init; }
  content?: string | null
  imageFileId: string
}
