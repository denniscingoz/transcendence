using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Notifications.DTOs;
using Transcendence.Application.Notifications.Interfaces;
using Transcendence.Domain.Notifications;

namespace Transcendence.Application.Notifications.Services;

public sealed class NotificationsService : INotificationsService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationsService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<IReadOnlyList<NotificationListItemDto>> GetListAsync(Guid userId, CancellationToken ct)
    {
        var notifications = await _notificationRepository.ListByUserAsync(userId, ct);

        return notifications
            .Select(n => new NotificationListItemDto
            {
                Id = n.Id,
                Type = n.Type,
                Text = n.Text,
                AvatarUrl = n.ActorAvatarUrl,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                ActorUserId = n.ActorUserId,
                RelatedConversationId = n.RelatedConversationId,
                RelatedRequestId = n.RelatedRequestId
            })
            .ToList();
    }

    public Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct)
    {
        return _notificationRepository.GetUnreadCountAsync(userId, ct);
    }

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken ct)
    {
        await _notificationRepository.MarkAllAsReadAsync(userId, ct);
        await _notificationRepository.SaveChangesAsync(ct);
    } 
    public async Task MarkConversationAsReadAsync(Guid userId, Guid conversationId, CancellationToken ct)
{
    await _notificationRepository.MarkConversationAsReadAsync(userId, conversationId, ct);
    await _notificationRepository.SaveChangesAsync(ct);
}
}