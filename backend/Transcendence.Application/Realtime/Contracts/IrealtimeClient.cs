using Transcendence.Application.Chat.DTOs;

namespace Transcendence.Application.Realtime.Contracts;

public interface IRealtimeClient
{
    Task NotificationReceived(NotificationDto notification);
    Task NotificationsChanged();

    Task ConversationsChanged();

    Task MessageReceived(ChatMessageDto message);
    Task MessageAck(MessageAckDto ack);
    Task MessageDelivered(MessageDeliveredDto payload);
    Task MessageRead(MessageReadDto payload);

    Task OnlineUsersSnapshot(IEnumerable<string> users);
    Task UserOnLine(object payload);
    Task UserOffLine(object payload);
}