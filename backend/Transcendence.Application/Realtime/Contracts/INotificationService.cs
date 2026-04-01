namespace Transcendence.Application.Realtime.Contracts;
using Transcendence.Application.Chat.DTOs;
public interface INotificationService
{
        Task NotifyNewMessage(
            IEnumerable<Guid> participants,
            Guid senderId,
            ChatMessageDto message
 
            );
}