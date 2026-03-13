using System.Reflection.Metadata.Ecma335;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Transcendence.Application.Chat.Services;
using Transcendence.Application.Chat.DTOs;
using  Transcendence.Application.Chat.Interfaces;
using Transcendence.Api.Realtime.Hubs;
using Transcendence.Api.Common.Extensions;
using Transcendence.Application.Common.Responses;


namespace Transcendence.Api.Controllers;

[ApiController] // automatically detects source of parameteres
[Route("conversations")]
public class ConversationsController : ControllerBase
{
    private readonly IChatService _chatService;
    public ConversationsController(IChatService chatService)
    {
        _chatService = chatService;
    }
    [HttpGet("{conversationId}/messages")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ChatMessageDto>>>> GetMessages(
        Guid conversationId,
        [FromQuery] int offset = 0,
        [FromQuery] int limit = 20)
    {
        var userId = User.GetUserId();
        Console.WriteLine($"userID wants to read meassages {userId}");
         //  User (ClaimsPrincipal) is always available in the controller
        var messages = await _chatService.GetMessagesAsync(userId, conversationId, offset, limit);
        return this.OkResponse(messages);
    }
    // IReadOnlyList<T> Used in APIs to express intent: the data is a result, not a working collection.

     [HttpPost("direct")]
     public async Task<ActionResult<ApiResponse<Guid>>> CreateDirectConversation(
            [FromBody] CreateDirectConversationDto dto)
    {   
        var userId = User.GetUserId(); //temp
        var conversationId = await _chatService
            .CreateOrGetDirectConversationAsync(userId, dto.TargetUserId);
        return this.OkResponse(conversationId);
    }

}
