using Microsoft.Extensions.Hosting;
using System.ComponentModel.DataAnnotations;
using Transcendence.Application.Common.Exceptions;
using Transcendence.Application.Files.Interface;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Domain.Posts;


namespace Transcendence.Application.Posts.Services;

public class PostsProfileService : IPostsProfileService
{
	private readonly IPostsProfileRepository _postsProfileRepository;
	private readonly IPostsRepository _postRepository;
	private readonly IFriendshipRepository _friendshipRepository;
	private readonly IUserRepository _userRepository;
	private readonly IFilesRepository _filesRepository;
	public PostsProfileService(IPostsProfileRepository postProfileRepository,
						IPostsRepository postRepository,
						IFriendshipRepository friendshipRepository,
						IUserRepository userRepository,
						IFilesRepository filesRepository)
	{
		_postRepository = postRepository;
		_postsProfileRepository = postProfileRepository;
		_friendshipRepository = friendshipRepository;
		_userRepository = userRepository;
		_filesRepository = filesRepository;	
	}

	//GET /posts/me?take=20&cursor=<nextCursor>
	//GET /posts/by-userId/{targetUserId}?take=20&cursor=<nextCursor>
	public async Task<CursorPageDto<ProfilePostPreviewDto>> GetProfilePostsPreviewAsync(
		Guid targetUserId,
		int take,
		string? cursor,
		Guid currentUserId,
		CancellationToken ct)
	{
		var currentUser = await _userRepository.GetByIdAsync(currentUserId, ct);
		
		if (currentUser is null || currentUser.IsDeleted)
    		throw new UnauthorizedException("Invalid session.");

		take = (take < 1 || take > 50) ? 20 : take;
		var targetUser = await _userRepository.GetByIdAsync(targetUserId, ct);
		if (targetUser == null || targetUser.IsDeleted) { throw new NotFoundException("User not found."); }

		if (targetUserId != currentUserId)
		{
			var isFriend = await _friendshipRepository.IsFriendAsync(targetUserId, currentUserId, ct);
			if (!isFriend)
				throw new ForbiddenException("You do not have permission to view this user's posts.");
		}
		// repository returns: Posts + NextCursor (cursor logic stays in repository)
		var cursorPageDto = await _postsProfileRepository.GetProfilePostsPreviewAsync(targetUserId, take, cursor, ct);


		//Go through each post image and get their type for rendering information
		foreach (var post in cursorPageDto.Items)
		{
			if (post.ImageUrl != null)
			{
				var file = await _filesRepository.GetByIdAsync(post.ImageFileId, ct)
							?? throw new NotFoundException("Image file not found.");

				post.ContentType = file.ContentType;
			}
		}

		return cursorPageDto;
	}

	//GET /posts/{postId}/comments?take=20&cursor=<nextCursor>
	public async Task<CursorPageDto<CommentPreviewDto>> GetCommentsAsync(
		Guid postId,
		int take,
		string? cursor,
		Guid currentUserId,
		CancellationToken ct)
	{

		var currentUser = await _userRepository.GetByIdAsync(currentUserId, ct);
		
		if (currentUser is null || currentUser.IsDeleted)
    		throw new UnauthorizedException("Invalid session.");
		
		take = (take < 1 || take > 50) ? 20 : take;
		var post = await _postRepository.GetPostAsync(postId, ct)
			?? throw new NotFoundException("Post not found.");
		var authorId = post.AuthorId;

		if (authorId != currentUserId)
		{
			var isFriend = await _friendshipRepository.IsFriendAsync(authorId, currentUserId, ct);
			if (!isFriend)
				throw new ForbiddenException("You do not have permission to view comments.");
		}
		// repository returns: Comments + NextCursor (cursor logic stays in repository)
		return await _postsProfileRepository.GetCommentsAsync(postId, take, cursor, ct);
	}

	//GET /posts/{postId}/likes?take=20&cursor=<nextCursor>
	public async Task<CursorPageDto<LikesPreviewDto>> GetLikesAsync(
		Guid postId,
		int take,
		string? cursor,
		Guid currentUserId,
		CancellationToken ct)
	{
		var currentUser = await _userRepository.GetByIdAsync(currentUserId, ct);
		
		if (currentUser is null || currentUser.IsDeleted)
    		throw new UnauthorizedException("Invalid session.");

		take = (take < 1 || take > 50) ? 20 : take;
		var post = await _postRepository.GetPostAsync(postId, ct)
			?? throw new NotFoundException("Post not found.");
		var authorId = post.AuthorId;

		if (authorId != currentUserId)
		{
			var isFriend = await _friendshipRepository.IsFriendAsync(authorId, currentUserId, ct);
			if (!isFriend)
				throw new ForbiddenException("You do not have permission to view likes.");
		}
		// repository returns: Likes + NextCursor (cursor logic stays in repository)
		return await _postsProfileRepository.GetLikesAsync(postId, take, cursor, ct);

	}
}
