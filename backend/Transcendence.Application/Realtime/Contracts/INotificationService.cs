using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Friends.DTOs;

namespace Transcendence.Application.Realtime.Contracts;

public interface INotificationService
{
    Task NotifyNewMessage(
        IEnumerable<Guid> participants,
        Guid senderId,
        ChatMessageDto message);

    Task NotifyChange(Guid userId);

    Task NotifyFriendRequest(Guid targetUserId, FriendshipRequestDto request);

    Task NotifyFriendRequestAccepted(Guid targetUserId, FriendshipRequestDto request);

    Task NotifyFriendRequestDeclined(Guid targetUserId, FriendshipRequestDto request);

    Task NotifyConversationCreated(Guid userA, Guid userB, Guid conversationId);
    Task NotifyConversationDeleted(IEnumerable <Guid> participantIds, Guid conversationId);
    Task NotifyConversationsChanged(IEnumerable<Guid> userIds);
}