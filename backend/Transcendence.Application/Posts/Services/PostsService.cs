using System.ComponentModel.DataAnnotations;

using Transcendence.Domain.Posts;

using Transcendence.Application.Common.Exceptions;
using Transcendence.Application.Files.Interface;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Posts.Interfaces;

using Transcendence.Application.Users.Interfaces;


namespace Transcendence.Application.Posts.Services;
public class PostsService : IPostsService
{
	private readonly IPostsRepository _postRepository;
	private readonly IFriendshipRepository _friendshipRepository;
	private readonly IUserRepository _userRepository;
	private readonly IFilesRepository _filesRepository;
	private readonly IFilesService _filesService;
	public PostsService(IPostsRepository postRepository,
						IFriendshipRepository friendshipRepository,
						IUserRepository userRepository,
						IFilesRepository filesRepository,
						IFilesService filesService)
	{
		_postRepository = postRepository;
		_friendshipRepository = friendshipRepository;
		_userRepository = userRepository;
		_filesRepository = filesRepository;
		_filesService = filesService;
	}

	// GET /posts/{postId}
	public async Task<PostDto> GetPostAsync(Guid postId, Guid currentUserId, CancellationToken ct)
	{
		var post = await _postRepository.GetPostAsync(postId, ct)
			?? throw new NotFoundException("Post not found.");

		var authorId = post.AuthorId;

		if (authorId != currentUserId)
		{
			var isFriend = await _friendshipRepository.IsFriendAsync(authorId, currentUserId, ct);
			if (!isFriend)
				throw new ForbiddenException("You do not have permission to view this post.");
		}
		
		var author = await _userRepository.GetByIdAsync(authorId, ct)
				?? throw new NotFoundException("Author not found.");
		var likesCount = await _postRepository.GetLikeCountAsync(postId, ct);
		var comments = await _postRepository.GetCommentsAsync(postId, ct);

		string? BuildAvatarFileUrl(Guid? fileId)
			=> fileId is Guid id ? $"/files/{id}" : null;
		string BuildImageFileUrl(Guid fileId) => $"/files/{fileId}";


		return new PostDto
		{
			Id = post.Id,
			AuthorId = post.AuthorId,
			CreatedAtUtc = post.CreatedAtUtc,
			Content = post.Content,
			ImageUrl = BuildImageFileUrl(post.ImageFileId),
			LikesCount = likesCount,
			AuthorUsername = author.Username,
			AuthorFullName = author.FullName,
			AuthorAvatarUrl = BuildAvatarFileUrl(author.AvatarFileId),
		};
	}

	// POST
	public async Task<PostDto> CreatePostAsync(Guid currentUserId, CreatePostDto dto, CancellationToken ct)
	{
		if (dto.ImageFileId == Guid.Empty)
			throw new ArgumentException("ImageFileId is required.", nameof(dto.ImageFileId));

		// Ensure file exists and belongs to user
		var file = await _filesRepository.GetByIdAsync(dto.ImageFileId, ct)
			?? throw new NotFoundException("Image file not found.");

		if (file.OwnerId != currentUserId)
			throw new ForbiddenException("You do not own this file.");

		var postId = Guid.NewGuid();

		var post = new Post(postId, currentUserId, dto.ImageFileId, dto.Content);
		await _postRepository.AddPostAsync(post, ct);
		await _postRepository.SaveChangesAsync(ct);

		return new PostDto
		{
			Id = postId,
			AuthorId = currentUserId,
			ImageUrl = $"/files/{dto.ImageFileId}"
		};
	}

	// DELETE /posts/{postId}
	public async Task DeletePostAsync(Guid postId, Guid currentUserId, CancellationToken ct)
	{
		var post = await _postRepository.GetPostAsync(postId, ct)
			?? throw new NotFoundException("Post not found.");

		if (post.AuthorId != currentUserId)
			throw new ForbiddenException("You do not have permission to delete this post.");

		var imageFileId = post.ImageFileId;
		_postRepository.Remove(post);
		await _postRepository.SaveChangesAsync(ct);

		try
		{
			await _filesService.DeleteFileAsync(currentUserId, imageFileId, ct);
		}
		catch (NotFoundException)
		{
			// Intentionally ignored: the post is already deleted; file metadata might already be gone.
		}
	}


	// POST /posts/{postId}/like
	public async Task LikePostAsync(Guid postId, Guid currentUserId, CancellationToken ct)
	{
		var post = await _postRepository.GetPostAsync(postId, ct)
			?? throw new NotFoundException("Post not found.");
		if (post.AuthorId != currentUserId)
		{
			var isFriend = await _friendshipRepository.IsFriendAsync(post.AuthorId, currentUserId, ct);
			if (!isFriend)
				throw new ForbiddenException("You do not have permission to like this post.");
		}
		await _postRepository.AddLikeAsync(postId, currentUserId, ct);
		await _postRepository.SaveChangesAsync(ct);
	}


	// DELETE /posts/{postId}/like
	public async Task UnlikePostAsync(Guid postId, Guid currentUserId, CancellationToken ct)
	{
		var like = await _postRepository.GetLikeAsync(postId, currentUserId, ct)
			?? throw new NotFoundException("Like not found.");

		if (like.AuthorId != currentUserId)
			throw new ForbiddenException("You do not have permission to unlike this post.");

		await _postRepository.RemoveLikeAsync(like, ct);
		await _postRepository.SaveChangesAsync(ct);
	}

	// POST /posts/{postId}/comment
	public async Task<CommentPreviewDto> AddCommentAsync(Guid postId, Guid currentUserId, string content, CancellationToken ct)
	{
		if (string.IsNullOrWhiteSpace(content))
			throw new ValidationException("Content is required.");
		
		if (content.Length > 1000)
			throw new ValidationException("Content cannot exceed 1000 characters.");

		var post = await _postRepository.GetPostAsync(postId, ct)
			?? throw new NotFoundException("Post not found.");
		if (post.AuthorId != currentUserId)
		{
			var isFriend = await _friendshipRepository.IsFriendAsync(post.AuthorId, currentUserId, ct);
			if (!isFriend)
				throw new ForbiddenException("You do not have permission to comment on this post.");
		}

		var commentId = Guid.NewGuid();
		var comment = new Comment(commentId, postId, currentUserId, content);
		await _postRepository.AddCommentAsync(comment, ct);
		await _postRepository.SaveChangesAsync(ct);
		return new CommentPreviewDto
		{
			Id = comment.Id,
			AuthorId = comment.AuthorId,
			Content = comment.Content,
			CreatedAtUtc = comment.CreatedAtUtc
		};
	}

	// DELETE /posts/{postId}/comment/{commentId}
	public async Task DeleteCommentAsync(Guid postId, Guid commentId, Guid currentUserId, CancellationToken ct)
	{
		var comment = await _postRepository.GetCommentAsync(postId, commentId, ct)
			?? throw new NotFoundException("Comment not found.");

		if (comment.AuthorId != currentUserId)
			throw new ForbiddenException("You do not have permission to delete this comment.");

		await _postRepository.RemoveCommentAsync(comment, ct);
		await _postRepository.SaveChangesAsync(ct);
	}



	// Idempotent: returns true if state changed, false if already in desired state
	//Task LikePostAsync(Guid postId, Guid currentUserId, CancellationToken ct); // POST /posts/{postId}/like
	//Task(Guid postId, Guid currentUserId, CancellationToken ct); // DELETE /posts/{postId}/like
	//Task<int> GetLikeCountAsync(Guid postId, CancellationToken ct); // GET /posts/{postId}/likes/count

	//Comments
	//Task<CommentDto> AddCommentAsync(Guid postId, Guid currentUserId, CreateCommentDto dto, CancellationToken ct); // POST /posts/{postId}/comments
	//Task DeleteCommentAsync(Guid postId, Guid commentId, Guid currentUserId, CancellationToken ct);
}

