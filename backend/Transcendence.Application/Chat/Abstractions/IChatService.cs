namespace Transcendence.Application.Chat.Abstractions;
using Transcendence.Application.Chat.DTOs;

public interface IChatService
{
    Task <ChatMessageDto> SendMessageAsync(
        Guid senderId,
        Guid conversationId,
        Guid clientMessageId, 
        string content
    );
}

/*
ChatService is where business logic starts.

The Hub is only a transport adapter: it receives realtime calls,
extracts the user identity and delegates the operation to the Application layer.

ChatService is responsible for enforcing domain rules, validating input,
persisting messages and returning the resulting ChatMessageDto.
It must not depend on SignalR, groups or client connections.
*/