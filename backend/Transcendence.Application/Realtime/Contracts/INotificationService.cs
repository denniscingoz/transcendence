namespace Transcendence.Application.Realtime.Contracts;
using Transcendence.Application.Chat.DTOs;
using System.Collections.Generic;
using Transcendence.Application.Friends.DTOs;

public interface INotificationService
{
        Task NotifyNewMessage(
            IEnumerable<Guid> participants,
            Guid senderId,
            ChatMessageDto message
 
            );
        Task NotifyConversationCreated(Guid userA, Guid userB, Guid conversationId);
        Task NotifyFriendRequest(Guid targetUserId, FriendshipRequestDto request);
        
} //class Transcendence.Application.Chat.DTOs.ChatMessageDto