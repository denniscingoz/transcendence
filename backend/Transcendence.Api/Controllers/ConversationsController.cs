using Microsoft.AspNetCore.Mvc;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Chat.Interfaces;
using Transcendence.Api.Common.Extensions;
using Transcendence.Application.Common.Responses;

namespace Transcendence.Api.Controllers;

[ApiController]
[Route("conversations")]
public class ConversationsController : ControllerBase
{
    private readonly IChatService _chatService;

    public ConversationsController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet]

    public async Task<ActionResult<ApiResponse<IReadOnlyList<ConversationDto>>>> GetConversations(
        [FromQuery] int offset = 0,
        [FromQuery] int limit = 20
    )
    {
        var userId = GetUserId();

        var conversations = await _chatService.GetConversations(userId, offset, limit);

        return this.OkResponse(conversations);
    }

    [HttpGet("{conversationId}/messages")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ChatMessageDto>>>> GetMessages(
        Guid conversationId,
        [FromQuery] int offset = 0,
        [FromQuery] int limit = 20)
    {
        var userId = GetUserId();

        var messages = await _chatService.GetMessagesAsync(userId, conversationId, offset, limit);

        return this.OkResponse(messages);
    }
 
    [HttpDelete("{conversationId:guid}")]
    public async Task<IActionResult> DeletConversation(Guid conversationId, CancellationToken ct)
    {
        var currentUserId = GetUserId();
        await _chatService.DeleteConversationAsync(currentUserId, conversationId);
        return NoContent();
    }
    [HttpPost("direct")]
    public async Task<ActionResult<ApiResponse<CreateOrGetConversationResult>>> CreateDirectConversation(
        [FromBody] CreateDirectConversationDto dto)
    {
        var userId = GetUserId();

        var conversation = await _chatService
            .CreateOrGetDirectConversationAsync(userId, dto.TargetUserId);

        return this.OkResponse(conversation);
    }
 
    private Guid GetUserId()
    {
        var claimValue =
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (Guid.TryParse(claimValue, out var claimUserId))
            return claimUserId;

        var devHeader = Request.Headers["X-Dev-UserId"].FirstOrDefault();
        if (Guid.TryParse(devHeader, out var headerUserId))
            return headerUserId;

        var devQuery = Request.Query["devUserId"].FirstOrDefault();
        if (Guid.TryParse(devQuery, out var queryUserId))
            return queryUserId;

        throw new UnauthorizedAccessException("Invalid token.");
    }
}