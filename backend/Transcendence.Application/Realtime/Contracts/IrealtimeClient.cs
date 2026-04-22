using Transcendence.Application.Realtime.DTOs;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Friends.DTOs;

namespace Transcendence.Application.Realtime.Contracts;
public interface IRealtimeClient
{
    Task MessageReceived(ChatMessageDto message);
    Task MessageAck(MessageAckDto ack);
    Task UserOnLine(PresenceEventDto presence);
    Task UserOffLine(PresenceEventDto presence);
    Task NotificationReceived(NotificationDto notification);
    Task OnlineUsersSnapshot(IEnumerable<Guid> users);
    Task MessageRead(MessageReadDto read);
    Task MessageDelivered(MessageDeliveredDto delivered);
    Task ConversationsChanged();
    Task FriendshipRequestReceived(FriendshipRequestDto request);
}
