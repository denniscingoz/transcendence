using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using Transcendence.Application.Chat.Interfaces;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Domain.Chat;
using Transcendence.Application.Common.Exceptions;
using Transcendence.Domain.Exceptions;
using Transcendence.Domain.Users;
using Transcendence.Application.Common.Responses;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.Realtime.Contracts;
using Google.Apis.Util;

namespace Transcendence.Application.Chat.Services;

public class ChatService : IChatService
{ 
    private readonly IConversationRepository _conversationRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _notificationService;



    public ChatService(
        IConversationRepository conversationRepository,
        IMessageRepository messageRepository,
        IUserRepository userRepository,
        INotificationService notificationService)
    {
        _conversationRepository = conversationRepository;
        _messageRepository = messageRepository;
        _userRepository = userRepository;
        _notificationService = notificationService;
    }

    private ChatMessageDto MapToDto(Message message, Guid currentUserId, DateTimeOffset readByUser,  DateTimeOffset readByOthers)
    {
        return new ChatMessageDto {
            MessageId = message.Id,
            ConversationId = message.ConversationId,
            Content = message.Content,
            SenderId = message.SenderId,
            CreatedAt = message.CreatedAt,
            IsDeleted = message.IsDeleted,
            IsDelivered = message.IsDelivered,
            IsReadByUser = message.SenderId == currentUserId || message.CreatedAt <= readByUser,
            IsReadByOthers =  message.CreatedAt <= readByOthers && message.SenderId == currentUserId
        };
    }
    public record ReadTime(DateTimeOffset ByMe, DateTimeOffset ByOthers);

    public async Task <ReadTime> GetReadTime(Guid userId, Guid conversationId)
    {   
        var participants = await _conversationRepository
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
  
        var conversation = await _conversationRepository.GetByIdAsync(conversationId) 
            ?? throw new NotFoundException("No such conversation");

        if (!conversation.HasParticipant(senderId))
            throw new ForbiddenException("User is not a participant");

        foreach (var participant in conversation.Participants)
        {
            var user = await _userRepository.GetByIdAsync(participant.UserId, CancellationToken.None);

            if (user is null || user.IsDeleted)
                throw new ForbiddenException("You cannot send messages in a conversation with a deleted user.");
        }

        var message = new Message(conversationId, senderId, clientMessageId, content);
        
        
        await _messageRepository.AddAsync(message);
        conversation.UpdateLastMessage(message.Content, message.CreatedAt);
        
        await _conversationRepository.SaveChangesAsync();
        return MapToDto(message, senderId,  readTime.ByMe, readTime.ByOthers);
    }

    public async Task<CreateOrGetConversationResult> CreateOrGetDirectConversationAsync(Guid userA, Guid userB)
    {
        if (userA == userB)
            throw new DomainValidationException("Cannot write to himself");

        var existing = await _conversationRepository.GetDirectConversation(userA, userB);
        if (existing is not null)
        {
            return new CreateOrGetConversationResult
            {
                ConversationId = existing.Id,
                IsCreated = false
            };
        }

        var conversation = new Conversation(type: ConversationType.Direct, new[] { userA, userB });

        await _conversationRepository.AddAsync(conversation);
        await _conversationRepository.SaveChangesAsync();
        
        await _notificationService.NotifyConversationCreated(userA, userB, conversation.Id);
        return new CreateOrGetConversationResult
        {
            ConversationId = conversation.Id,
            IsCreated = true
        };
    }

    
    public async Task<IReadOnlyList<ChatMessageDto>> GetMessagesAsync
    (
        Guid userId, Guid conversationId, int offset, int limit
        )
    {
        if (limit <= 0 || limit >= 100)
            throw new DomainValidationException("Invalid input");

        var conversation = await _conversationRepository.GetByIdAsync(conversationId) 
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
        
        var conversation = await _conversationRepository.GetByIdAsync(conversationId) 
            ?? throw new NotFoundException("No such conversation");

        if (!conversation.HasParticipant(UserId))
            throw new ForbiddenException("User is not a participant");
    }
    public async Task <IReadOnlyList<Guid>>  GetUserConversationsIds(Guid userId)
    {
        return await _conversationRepository.GetUserConversationsIds(userId);
    }
 
    public async Task <IReadOnlyList<Guid>>  GetParticipantsIds(Guid conversationId)
    {
        return await _conversationRepository.GetParticipantsIds(conversationId);
    }
    public async Task MarkConversationAsRead(Guid userId, Guid conversationId)
    {
        var participant = await _conversationRepository.GetParticipant(userId, conversationId);

        if (participant is not null)
        {
            participant.LastReadAt = DateTimeOffset.UtcNow;
            await _conversationRepository.SaveChangesAsync();
        }
    }
    public async Task<Guid?> GetLastMessageId(Guid conversationId)
        {
            return await _messageRepository.GetLastMessageId(conversationId);

        }

public async Task<IReadOnlyList<ConversationDto>> GetConversations(Guid userId,  int offset, int limit )
{
    if (limit <= 0 || limit >= 100)
            throw new DomainValidationException("Invalid input");

    var conversations = await _conversationRepository.GetConversations(userId, offset, limit);
    // conversations = conversations.Where(c => c.LastMessageAt != null).ToList();

    var targetUserIds = conversations
        .Select(c => c.Participants.First(p => p.UserId != userId).UserId)
        .Distinct()
        .ToList();

    var users = await _userRepository.GetByIdsAsync(targetUserIds, CancellationToken.None);
    var usersById = users.ToDictionary(u => u.Id);

    var dtos = new List<ConversationDto>();

    foreach (var c in conversations.OrderByDescending(c => c.LastMessageAt ?? DateTime.MinValue))
    {
        var targetUserId = c.Participants.First(p => p.UserId != userId).UserId;
        var myParticipant = c.Participants.First(p => p.UserId == userId);

        usersById.TryGetValue(targetUserId, out var targetUser);

        var unreadCount = await _messageRepository.GetUnreadCount(
            c.Id,
            userId,
            myParticipant.LastReadAt
        );

        dtos.Add(new ConversationDto
        {
            Id = c.Id,
            TargetUserId = targetUserId,
            TargetUserName = targetUser?.Username ?? targetUserId.ToString()[..8],
            TargetUserAvatarUrl = targetUser?.AvatarFileId.HasValue == true
                ? "/files/avatar/" + targetUser.AvatarFileId.Value
                : null,
            TargetUserIsDeleted = targetUser?.IsDeleted == true,
            LastMessage = c.LastMessageText ?? "",
            LastMessageAt = c.LastMessageAt,
            UnreadCount = unreadCount
        });
    }

    return dtos;
    
    }
public async Task<MessageDeletedDto> DeleteMessageAsync(Guid userId, Guid messageId)
{
    var message = await _messageRepository.GetByIdAsync(messageId)
        ?? throw new NotFoundException("Message not found.");

    if (message.SenderId != userId)
        throw new ForbiddenException("You can delete only your own messages.");

    message.Delete(DateTime.UtcNow);

    await _messageRepository.SaveChangesAsync();

    return new MessageDeletedDto
    {
        MessageId = message.Id,
        ConversationId = message.ConversationId
    };
}
    public async Task DeleteConversationAsync(
        Guid userId,
        Guid conversationId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);

        if (conversation is null)
            throw new NotFoundException("Conversation not found");

        if (!conversation.HasParticipant(userId))
            throw new ForbiddenException("User is not a participant");

        var participantIds = conversation.Participants
            .Select(p => p.UserId)
            .ToList();

        await _conversationRepository.DeleteConversationWithDataAsync(conversationId);

        await _notificationService.NotifyConversationDeleted(
            participantIds, conversationId);
    }

    public async Task<MessageDeliveredDto> MarkMessageAsDeliveredAsync(
        Guid readerId,
        Guid messageId)
    {
        var message = await _messageRepository.GetByIdAsync(messageId)
            ?? throw new NotFoundException("Message not found.");

        if (message.SenderId == readerId)
            throw new ForbiddenException("You cannot deliver your own message.");

        message.setDelivered();

        await _messageRepository.SaveChangesAsync();

        return new MessageDeliveredDto
        {
            ReaderId = readerId,
            SenderId = message.SenderId,
            MessageId = message.Id
        };
    }
    public async Task<IReadOnlyList<MessageDeliveredDto>> GetUnreadMessagesAsync(Guid userId)
    {


        var meassages =  await _messageRepository.GetUndeliveredIncomingMessagesAsync(userId) ;
        
        var res = new List<MessageDeliveredDto> ();
        
        foreach (var m in meassages)
        {
            m.setDelivered();
            res.Add(new MessageDeliveredDto
            {
              ReaderId = userId,
              MessageId = m.Id,
              SenderId = m.SenderId
            });
        }
        await _messageRepository.SaveChangesAsync();
        return res;
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