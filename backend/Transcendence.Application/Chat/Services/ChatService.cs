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

    private ChatMessageDto MapToDto(Message message, Guid currentUserId, DateTimeOffset readByUser,  DateTimeOffset readByOthers)
    {
        return new ChatMessageDto {
            MessageId = message.Id,
            ConversationId = message.ConversationId,
            Content = message.Content,
            SenderId = message.SenderId,
            CreatedAt = message.CreatedAt,
            IsReadByUser = message.SenderId == currentUserId || message.CreatedAt <= readByUser,
            IsReadByOthers =  message.CreatedAt <= readByOthers && message.SenderId == currentUserId
        };
        // We map the domain Message to ChatMessageDto to avoid leaking domain entities,
        // control what data is exposed, and keep the application boundary explicit.
        // DTOs are stable contracts for transport, while domain models may change.

        //
    }
    public record ReadTime(DateTimeOffset ByMe, DateTimeOffset ByOthers);

    public async Task <ReadTime> GetReadTime(Guid userId, Guid conversationId)
    {   
        var participants = await _coversationRepository
                            .GetConversationParticipants(conversationId);           
        var me = participants.FirstOrDefault(p => p.UserId == userId)
           ?? throw new Exception("Participant not found");
        var others = participants.Where(p => p.UserId != userId);

        var readByMe = me.LastReadAt;
        var readByOthers = others
                                  .Select(p => p.LastReadAt)
                                  .DefaultIfEmpty(DateTimeOffset.MinValue)
                                  .Min();
        return new ReadTime(readByMe, readByOthers);
    }

    public async Task <ChatMessageDto> SendMessageAsync(
        Guid senderId, Guid conversationId, Guid clientMessageId, string? content
        )
    {
        var existing = await _messageRepository.GetByClientMessageIdAsync(senderId, clientMessageId);
        // we have separate client's messeae Id for Idempotency
        var readTime = await GetReadTime(senderId, conversationId);

        if (existing is not null) //allready sent but not delievered
            return MapToDto( existing, senderId, readTime.ByMe, readTime.ByOthers);

        if (string.IsNullOrWhiteSpace(content))
            throw new DomainValidationException("Message content is empty");
  
        var conversation = await _coversationRepository.GetByIdAsync(conversationId) 
            ?? throw new NotFoundException("No such conversation");

        if (!conversation.HasParticipant(senderId))
            throw new ForbiddenException("User is not a participant");

        var message = new Message(conversationId, senderId, clientMessageId, content);

        await _messageRepository.AddAsync(message);
        
        await _coversationRepository.SaveChangesAsync();
        return MapToDto(message, senderId,  readTime.ByMe, readTime.ByOthers);
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
        var readTime = await GetReadTime(userId, conversationId);

        return messages
            .Select(m => MapToDto(m, userId, readTime.ByMe, readTime.ByOthers))
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
 
    public async Task <IReadOnlyList<Guid>>  GetParticipantsIds(Guid conversationId)
    {
        return await _coversationRepository.GetParticipantsIds(conversationId);
    }
    public async Task MarkConversationAsRead(Guid userId, Guid conversationId)
    {
        var participant = await _coversationRepository.GetParticipant(userId,conversationId);
        
        if (participant is not null)
            participant.LastReadAt = DateTimeOffset.UtcNow;     
            
    }

    public async Task<Guid?> GetLastMessageId(Guid conversationId)
        {
            return await _messageRepository.GetLastMessageId(conversationId);

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