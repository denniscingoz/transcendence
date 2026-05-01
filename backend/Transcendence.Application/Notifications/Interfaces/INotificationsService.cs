using Transcendence.Application.Notifications.DTOs;

namespace Transcendence.Application.Notifications.Interfaces;

public interface INotificationsService
{
    Task<IReadOnlyList<NotificationListItemDto>> GetListAsync(Guid userId, CancellationToken ct);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken ct);
    Task MarkNotificationAsReadAsync(
        Guid userId,
        Guid notificationId,
        CancellationToken ct);

    Task MarkSeenNotificationsAsReadAsync(
        Guid userId,
        CancellationToken ct);
    Task MarkConversationAsReadAsync(Guid userId, Guid conversationId, CancellationToken ct);
}

 