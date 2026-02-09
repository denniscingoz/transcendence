using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Transcendence.Application.Common.Responses;
using Transcendence.Api.Common.Extensions;
using Transcendence.Application.Users.DTOs;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.Users.Services;
using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Friends.Services;

namespace Transcendence.Api.Controllers;

[Authorize]
[ApiController]
[Route("friends")]
public sealed class FriendsController : ControllerBase
{
    private readonly IFriendsService _friendsService;
    public FriendsController(IFriendsService friendsService) {_friendsService = friendsService;}

	//GET /friends/list
	[HttpGet("list")]
	public async Task<ActionResult<ApiResponse<IReadOnlyList<FriendDto>>>> GetFriendsList(CancellationToken ct)
	{
		Guid userId = GetUserId(); //todo auth
		var friendsList = await _friendsService.GetFriendsListAsync(userId, ct);
		return this.OkResponse(friendsList);
	}

	//POST /friends/{friendUserId}
	[HttpPost("{targetUserId:guid}")]
	public async Task<IActionResult> SendFriendRequest(Guid targetUserId, CancellationToken ct)
	{
		Guid requesterId = GetUserId();
		await _friendsService.SendFriendRequestAsync(requesterId, targetUserId, ct);
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
	public async Task<ActionResult<ApiResponse<IReadOnlyList<FriendRequestDto>>>> GetFriendRequestList(CancellationToken ct)
	{
		Guid userId = GetUserId(); //todo auth
		var requests = await _friendsService.GetFriendRequestListAsync(userId, ct);
		return this.OkResponse(requests);
	}

	//POST /friends/requests/{requestId}/accept
	[HttpPost("requests/{requestId:guid}/accept")]
	public async Task<IActionResult> AcceptFriendRequest(Guid requestId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _friendsService.AcceptFriendRequestAsync(requestId, currentUserId, ct);
		return NoContent(); // 204
	}

	//POST /friends/requests/{requestId}/decline
	[HttpPost("requests/{requestId:guid}/decline")]
	public async Task<IActionResult> DeclineFriendRequest(Guid requestId, CancellationToken ct)
	{
		Guid currentUserId = GetUserId();
		await _friendsService.DeclineFriendRequestAsync(requestId, currentUserId, ct);
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