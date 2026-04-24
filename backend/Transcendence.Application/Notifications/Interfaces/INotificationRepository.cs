using Transcendence.Domain.Notifications;
namespace Transcendence.Application.Notifications.Interfaces;

public interface INotificationRepository
{
    Task AddAsync(Notification notification, CancellationToken ct);
    Task<IReadOnlyList<Notification>> ListByUserAsync(Guid userId, CancellationToken ct);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}