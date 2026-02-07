using System.Reflection.Metadata.Ecma335;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Transcendence.Application.Chat.Services;


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
    [HttpGet("{conversationId}/messages")]
    public async Task<IActionResult> GetMessages(
        Guid conversationId,
        [FromQuerry] int offset = 0,
        [FromQuerry] int limit = 20)
    {
        var userId = GetUserId();
        var messages = await _chatService.GetMessagesAsync(userId, conversationId, offset, limit);
        return this.OkResponse(messages);
    }
     [HttpPost("direct")]
     public async Task<IActionResult> CreateDirectConversation(
            [FromBody] CreateDirectConversationDto dto)
    {   
        var userId = GetUserId();
        var conversationId = await _chatService
            .CreateOrGetDirectConversationAsync(userId, dto.TargetUserId);
        return this.OkResponse(conversationId);
    }


}
