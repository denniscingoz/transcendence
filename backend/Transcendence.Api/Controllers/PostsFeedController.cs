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
public sealed class PostsFeedController : ControllerBase
{
	private readonly IPostsFeedService _postsFeedService;
	public PostsFeedController(IPostsFeedService postsFeedService) { _postsFeedService = postsFeedService; }

	//#--#GET /posts/feed?take=20&cursor=<nextCursor>
	[HttpGet("feed")]
	public async Task<ActionResult<ApiResponse<CursorPageDto<PostDto>>>> GetFeed(
		[FromQuery] int take  = 20,
		[FromQuery] string? cursor = null,
		CancellationToken ct = default)
	{
		Guid currentUserId = GetUserId();

		if (take <= 0 || take > 100) take = 20; // Enforce reasonable limits
		var feed = await _postsFeedService.GetFeedAsync(take, cursor, currentUserId, ct);
		return this.OkResponse(feed);
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
