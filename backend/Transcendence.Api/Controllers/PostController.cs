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
[Route("post")]
public sealed class PostController : ControllerBase
{
    private readonly IPostService _postService;
    public PostController(IPostService postService) {_postService = postService;}

	//GET /post/{postId}
	[HttpGet("{postId:guid}")]
	public async Task<ActionResult<ApiResponse<PostDetailedDto>>> GetPost(Guid postId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		var post = await _postService.GetPostAsync(postId, currentUserId, ct);
		return this.OkResponse(post);
	}

	//POST /post
	[HttpPost]
	public async Task<ActionResult<ApiResponse<PostDto>>> CreatePost([FromBody] CreatePostDto dto, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		var post = await _postService.CreatePostAsync(currentUserId, dto, ct);
		return StatusCode(StatusCodes.Status201Created, this.OkResponse(post));
	}

	//DELETE /post/{postId}
	[HttpDelete("{postId:guid}")]
	public async Task<IActionResult> DeletePost(Guid postId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _postService.DeletePostAsync(postId, currentUserId, ct);
		return NoContent();
	}

	// POST /post/{postId}/like
	[HttpPost("{postId:guid}/like")]
	public async Task<IActionResult> LikePost(Guid postId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _postService.LikePostAsync(postId, currentUserId, ct);
		return NoContent();
	}

	// DELETE /posts/{postId}/like
	[HttpDelete("{postId:guid}/like")]
	public async Task<IActionResult> UnlikePost([FromRoute] Guid postId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _postService.UnlikePostAsync(postId, currentUserId, ct);
		return NoContent();
	}

	// POST /posts/{postId}/comment
	[HttpPost("{postId:guid}/comment")]
	public async Task<ActionResult<ApiResponse<CommentDto>>> AddComment(Guid postId, [FromBody] string content, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		var comment = await _postService.AddCommentAsync(postId, currentUserId, content, ct);
		return StatusCode(StatusCodes.Status201Created, this.OkResponse(comment));
	}

	// DELETE /posts/{postId}/comments/{commentId}
	[HttpDelete("{postId:guid}/comments/{commentId:guid}")]
	public async Task<IActionResult> DeleteComment(Guid postId, Guid commentId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _postService.DeleteCommentAsync(postId, commentId, currentUserId, ct);
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
/*

    ! Сервисы и репозитории НЕ хранят состояние.
    ! Всё состояние — либо в Domain, либо в БД.

    Короткий итог (зафиксируй)

    ✔ Да, сервис создаётся на каждый запрос
    ✔ Да, репозитории тоже
    ✔ Да, DbContext тоже
    ✔ Это осознанный дизайн
    ✔ Это безопасно
    ✔ Это масштабируемо 
*/