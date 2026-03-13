using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using Transcendence.Application.Chat.Interfaces;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Domain.Chat;
using Transcendence.Domain.Exceptions;
using Transcendence.Domain.Users;
namespace Transcendence.Application.Chat.Services;

public class ChatService : IChatService
{
    private readonly IConversationRepository _coversationRepository;
    private readonly IMessageRepository _messageRepository;


    public ChatService(
        IConversationRepository conversationRepository,
        IMessageRepository messageRepository
        )
    {
        _coversationRepository = conversationRepository;
        _messageRepository = messageRepository;

    }

    private ChatMessageDto MapToDto(Message message)
    {
        return new ChatMessageDto {
            MessageId = message.Id,
            ConversationId = message.ConversationId,
            Content = message.Content,
            SenderId = message.SenderId,
            CreatedAt = message.CreatedAt
        };
        // We map the domain Message to ChatMessageDto to avoid leaking domain entities,
        // control what data is exposed, and keep the application boundary explicit.
        // DTOs are stable contracts for transport, while domain models may change.
    }
    public async Task <ChatMessageDto> SendMessageAsync(
        Guid senderId, Guid conversationId, Guid clientMessageId, string? content
        )
    {

        var existing = await _messageRepository.GetByClientMessageIdAsync(senderId, clientMessageId);
        // we have separate client's messeae Id for Idempotency
        if (existing is not null) //allready sent but not delievered
            return MapToDto(existing); 

        if (string.IsNullOrWhiteSpace(content))
            throw new DomainValidationException("Message content is empty");
  
        var conversation = await _coversationRepository.GetByIdAsync(conversationId) 
            ?? throw new NotFoundException("No such conversation");

        if (!conversation.HasParticipant(senderId))
            throw new ForbiddenException("User is not a participant");

        var message = new Message(conversationId, senderId, clientMessageId, content);

        await _messageRepository.AddAsync(message);
        
        await _coversationRepository.SaveChangesAsync();
        return MapToDto(message);
    }

    public async Task <Guid> CreateOrGetDirectConversationAsync(
        Guid userA, Guid userB
        )
    {
        if (userA ==  userB)
            throw new DomainValidationException("Cannot write to himself");
        var existing = await _coversationRepository.GetDirectConversation(userA, userB);
        if (existing is not null)
            return existing.Id; 

        var conversation = new Conversation(type: ConversationType.Direct, new[] { userA, userB});
        
        await _coversationRepository.AddAsync(conversation);
        await _coversationRepository.SaveChangesAsync();

        return conversation.Id;
    }

    public async Task<IReadOnlyList<ChatMessageDto>> GetMessagesAsync
    (
        Guid userId, Guid conversationId, int offset, int limit
        )
    {
        if (limit <= 0 || limit >= 100)
            throw new DomainValidationException("Invalid input");

        var conversation = await _coversationRepository.GetByIdAsync(conversationId) 
            ?? throw new NotFoundException("No such conversation");

        if (!conversation.HasParticipant(userId))
            throw new ForbiddenException("User is not a participant");

        var messages = await _messageRepository.GetByConversationIdAsync(conversationId, offset, limit);

        return messages
            .Select(MapToDto)
            .ToList();
    }
    public async Task AssertUserIsParticipant(Guid conversationId, Guid UserId) {//? GetUserConversations?
        
        var conversation = await _coversationRepository.GetByIdAsync(conversationId) 
            ?? throw new NotFoundException("No such conversation");

        if (!conversation.HasParticipant(UserId))
            throw new ForbiddenException("User is not a participant");
    }
    public async Task <IReadOnlyList<Guid>>  GetUserConversationsIds(Guid userId)
    {
        return await _coversationRepository.GetUserConversationsIds(userId);
    }
        public async Task <IReadOnlyList<Guid>>  GetUserInterlocutors(Guid userId)
    {
        return await _coversationRepository.GetUserInterlocutors(userId);
    }
    public async Task <IReadOnlyList<Guid>>  GetParticipantsIds(Guid conversationId)
    {
        return await _coversationRepository.GetParticipantsIds(conversationId);
    }

}
 
 /*
 	1.	Валидация content
	2.	Получение Conversation из репозитория
	3.	Проверка conversation.HasParticipant(senderId)
	4.  идемпотентность
	5.	Создание Message (domain)
	6.	Сохранение через репозитории
	7.	IUnitOfWork.SaveChangesAsync()
	8.	Возврат ChatMessageDto
*/

/*

public interface IChatService
{
    Task<ChatMessageDto> SendMessageAsync(
        Guid senderId,
        Guid conversationId,
        Guid clientMessageId,
        string content);

    Task<Guid> CreateOrGetDirectConversationAsync(
        Guid userA,
        Guid userB);

    Task<IReadOnlyList<ChatMessageDto>> GetMessagesAsync(
        Guid userId,
        Guid conversationId,
        int offset,
        int limit);

    Task AssertUserIsParticipant(
        Guid conversationId,
        Guid userId);
} */