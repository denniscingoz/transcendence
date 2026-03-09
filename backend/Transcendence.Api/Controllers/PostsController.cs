using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Transcendence.Application.Common.Responses;
using Transcendence.Api.Common.Extensions;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Application.Posts.DTOs;

namespace Transcendence.Api.Controllers;

[Authorize]
[ApiController]
[Route("posts")]
public sealed class PostsController : ControllerBase
{
    private readonly IPostsService _postsService;
    public PostsController(IPostsService postsService) {_postsService = postsService;}

	//GET /posts/{postId}
	[HttpGet("{postId:guid}")]
	public async Task<ActionResult<ApiResponse<PostDto>>> GetPost(Guid postId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		var post = await _postsService.GetPostAsync(postId, currentUserId, ct);
		return this.OkResponse(post);
	}

	//POST /posts
	[HttpPost]
	public async Task<ActionResult<ApiResponse<PostDto>>> CreatePost([FromBody] CreatePostDto dto, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		var post = await _postsService.CreatePostAsync(currentUserId, dto, ct);
		return StatusCode(StatusCodes.Status201Created, this.OkResponse(post));
	}

	//DELETE /posts/{postId}
	[HttpDelete("{postId:guid}")]
	public async Task<IActionResult> DeletePost(Guid postId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _postsService.DeletePostAsync(postId, currentUserId, ct);
		return NoContent();
	}

	// POST /posts/{postId}/likes
	[HttpPost("{postId:guid}/likes")]
	public async Task<IActionResult> LikePost(Guid postId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _postsService.LikePostAsync(postId, currentUserId, ct);
		return NoContent();
	}

	// DELETE /posts/{postId}/likes
	[HttpDelete("{postId:guid}/likes")]
	public async Task<IActionResult> UnlikePost([FromRoute] Guid postId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _postsService.UnlikePostAsync(postId, currentUserId, ct);
		return NoContent();
	}

	// POST /posts/{postId}/comments
	[HttpPost("{postId:guid}/comments")]
	public async Task<ActionResult<ApiResponse<CommentPreviewDto>>> AddComment(Guid postId, [FromBody] string content, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		var commentPreview = await _postsService.AddCommentAsync(postId, currentUserId, content, ct);
		return StatusCode(StatusCodes.Status201Created, this.OkResponse(commentPreview));
	}

	// DELETE /posts/{postId}/comments/{commentId}
	[HttpDelete("{postId:guid}/comments/{commentId:guid}")]
	public async Task<IActionResult> DeleteComment(Guid postId, Guid commentId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _postsService.DeleteCommentAsync(postId, commentId, currentUserId, ct);
		return NoContent();
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
