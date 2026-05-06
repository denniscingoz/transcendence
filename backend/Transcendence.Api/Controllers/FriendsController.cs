using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Transcendence.Api.Common.Extensions;
using Transcendence.Application.Common.Responses;
using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Friends.Services;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Users.DTOs;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.Users.Services;

namespace Transcendence.Api.Controllers;

[Authorize]
[ApiController]
[Route("friends")]
public sealed class FriendsController : ControllerBase
{
    private readonly IFriendsService _friendsService;
    public FriendsController(IFriendsService friendsService) {_friendsService = friendsService;}

	//GET /friends/list?take=20&cursor=<nextCursor>
	[HttpGet("list")]
	public async Task<ActionResult<ApiResponse<CursorPageDto<FriendDto>>>> GetFriendsList(
	[FromQuery] int take = 20,
	[FromQuery] string? cursor = null,
	CancellationToken ct = default)
	{
		// Get the currently authenticated user's id from the JWT.
		var userId = GetUserId();

		// Service handles take validation and passes take/cursor to repository.
		var friendsList = await _friendsService.GetFriendsListAsync(userId, take, cursor, ct);

		// Return standard API response wrapper.
		return this.OkResponse(friendsList);
	}

	//POST /friends/{friendUserId}
	[HttpPost("{targetUserId:guid}")]
	public async Task<IActionResult> SendFriendshipRequest(Guid targetUserId, CancellationToken ct)
	{
		Guid requesterId = GetUserId();
		await _friendsService.SendFriendshipRequestAsync(requesterId, targetUserId, ct);
		return StatusCode(StatusCodes.Status201Created); // 201, no body, no Location
	}

	//DELETE /friends/{friendUserId}
	[HttpDelete("{friendUserId:guid}")]
	public async Task<ActionResult> RemoveFriend(Guid friendUserId, CancellationToken ct)
	{
		Guid userId = GetUserId(); //todo auth
		await _friendsService.RemoveFriendAsync(userId, friendUserId, ct);
		return NoContent(); // 204
	}

	//GET /friends/requests
	[HttpGet("requests")]
	public async Task<ActionResult<ApiResponse<IReadOnlyList<FriendshipRequestDto>>>> GetFriendshipRequestList(CancellationToken ct)
	{
		Guid userId = GetUserId(); //todo auth
		var requests = await _friendsService.GetFriendshipRequestListAsync(userId, ct);
		return this.OkResponse(requests);
	}

	//POST /friends/requests/{requestId}/accept
	[HttpPost("requests/{targetUserId:guid}/accept")]
	public async Task<IActionResult> AcceptFriendshipRequest(Guid targetUserId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _friendsService.AcceptFriendshipRequestAsync(targetUserId, currentUserId, ct);
		return NoContent(); // 204
	}

	//POST /friends/requests/{requestId}/decline
	[HttpPost("requests/{targetUserId:guid}/decline")]
	public async Task<IActionResult> DeclineFriendshipRequest(Guid targetUserId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _friendsService.DeclineFriendshipRequestAsync(targetUserId, currentUserId, ct);
		return NoContent(); // 204
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