using Transcendence.Application.Chat.DTOs;
namespace Transcendence.Application.Realtime.Contracts;
public interface IRealtimeClient
{
    Task MessageReceived(ChatMessageDto message);
    Task MessageAck(MessageAckDto ack);
    Task UserOnline(PresenceEventDto presence);
    Task UserOffline(PresenceEventDto presence);
    Task NotificationReceived(NotificationDto notification);
}
