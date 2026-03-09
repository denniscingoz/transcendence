using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Transcendence.Application.Common.Responses;
using Transcendence.Api.Common.Extensions;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Domain.Posts;

namespace Transcendence.Api.Controllers;

[Authorize]
[ApiController]
[Route("posts")]
public sealed class PostsProfileController : ControllerBase
{
	private readonly IPostsProfileService _postsProfileService;
	public PostsProfileController(IPostsProfileService postsProfileService) { _postsProfileService = postsProfileService; }

	//GET /posts/me?take=20&cursor=<nextCursor>
	[HttpGet("me")]
	public async Task<ActionResult<ApiResponse<CursorPageDto<ProfilePostPreviewDto>>>> GetOwnProfilePosts(
		[FromQuery] int take = 20,
		[FromQuery] string? cursor = null,
		CancellationToken ct = default)
	{
		Guid currentUserId = GetUserId();

		if (take <= 0 || take > 50) take = 20; // Enforce reasonable limits
		var postList = await _postsProfileService.GetProfilePostsPreviewAsync(currentUserId /*as in target*/, take, cursor, currentUserId, ct);
		return this.OkResponse(postList);
	}

	//GET /posts/by-userId/{targetUserId}?take=20&cursor=<nextCursor>
	[HttpGet("by-userId/{targetUserId:guid}")]
	public async Task<ActionResult<ApiResponse<CursorPageDto<ProfilePostPreviewDto>>>> GetUserProfilePosts(
		[FromRoute] Guid targetUserId,
		[FromQuery] int take = 20,
		[FromQuery] string? cursor = null,
		CancellationToken ct = default)
	{
		Guid currentUserId = GetUserId();
		if (take <= 0 || take > 50) take = 20; // Enforce reasonable limits
		var postList = await _postsProfileService.GetProfilePostsPreviewAsync(targetUserId, take, cursor, currentUserId, ct);
		return this.OkResponse(postList);
	}

	//GET /posts/{postId}/comments?take=20&cursor=<nextCursor>
	[HttpGet("{postId:guid}/comments")]
	public async Task<ActionResult<ApiResponse<CursorPageDto<CommentPreviewDto>>>> GetCommentsDto(
		[FromRoute] Guid postId,
		[FromQuery] int take = 20,
		[FromQuery] string? cursor = null,
		CancellationToken ct = default)
	{
		Guid currentUserId = GetUserId();
		if (take <= 0 || take > 50) take = 20; // Enforce reasonable limits
		var commentList = await _postsProfileService.GetCommentsAsync(postId, take, cursor, currentUserId, ct);
		return this.OkResponse(commentList);
	}

	//GET /posts/{postId}/likes?take=20&cursor=<nextCursor>
	[HttpGet("{postId:guid}/likes")]
	public async Task<ActionResult<ApiResponse<CursorPageDto<LikesPreviewDto>>>> GetLikesDto(
		[FromRoute] Guid postId,
		[FromQuery] int take = 20,
		[FromQuery] string? cursor = null,
		CancellationToken ct = default)
	{
		Guid currentUserId = GetUserId();
		if (take <= 0 || take > 50) take = 20; // Enforce reasonable limits
		var likeList = await _postsProfileService.GetLikesAsync(postId, take, cursor, currentUserId, ct);
		return this.OkResponse(likeList);
	}


	private Guid GetUserId()
	{
		var value =
			User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
			?? User.FindFirst("sub")?.Value;

		if (value is null || !Guid.TryParse(value, out var userId))
			throw new UnauthorizedAccessException("Invalid token.");

		return userId;
	}
}
