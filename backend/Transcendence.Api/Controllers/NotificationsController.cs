using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Transcendence.Api.Common.Extensions;
using Transcendence.Application.Common.Responses;
using Transcendence.Application.Notifications.DTOs;
using Transcendence.Application.Notifications.Interfaces;

namespace Transcendence.Api.Controllers;

[Authorize]
[ApiController]
[Route("notifications")]
public sealed class NotificationsController : ControllerBase
{
    private readonly INotificationsService _notificationsService;

    public NotificationsController(INotificationsService notificationsService)
    {
        _notificationsService = notificationsService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<NotificationListItemDto>>>> GetList(
        CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await _notificationsService.GetListAsync(userId, ct);
        return this.OkResponse(result);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount(CancellationToken ct)
    {
        var userId = GetUserId();
        var result = await _notificationsService.GetUnreadCountAsync(userId, ct);
        return this.OkResponse(result);
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        var userId = GetUserId();
        await _notificationsService.MarkAllAsReadAsync(userId, ct);
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
    [HttpPost("conversations/{conversationId:guid}/read")]
    public async Task<IActionResult> MarkConversationAsRead(Guid conversationId, CancellationToken ct)
    {
        var userId = GetUserId();

        await _notificationsService.MarkConversationAsReadAsync(userId, conversationId, ct);

        return NoContent();
    }
    [HttpPost("{notificationId:guid}/read")]
    public async Task<IActionResult> MarkNotificationAsRead(Guid notificationId, CancellationToken ct )
    {
        var userId = GetUserId();

        await _notificationsService.MarkNotificationAsReadAsync(userId, notificationId, ct);

        return NoContent();
    }

    [HttpPost("chat-read")]
    public async Task<IActionResult> MarkChatNotificationAsRead(CancellationToken ct)
    {
        var userId = GetUserId();
        await _notificationsService.MarkChatNotificationsAsReadAsync(userId, ct);
        return NoContent();
    }

}