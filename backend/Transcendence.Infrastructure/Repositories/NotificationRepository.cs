using Microsoft.EntityFrameworkCore;
using Transcendence.Application.Notifications.Interfaces;
using Transcendence.Domain.Notifications;
using Transcendence.Infrastructure.Persistence;
using Transcendence.Domain.Notifications;

namespace Transcendence.Infrastructure.Repositories;

public sealed class NotificationRepository : INotificationRepository
{
    private readonly TranscendenceDbContext _db;

    public NotificationRepository(TranscendenceDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(Notification notification, CancellationToken ct)
    {
        await _db.Notifications.AddAsync(notification, ct);
    }

	public async Task<IReadOnlyList<Notification>> ListByUserAsync(Guid userId, CancellationToken ct)
	{
		var notifications = await _db.Notifications
			.Where(n => n.UserId == userId)
			.OrderByDescending(n => n.CreatedAt)
			.ToListAsync(ct);

		var friendRequestNotifications = notifications
			.Where(n => n.Text.Contains("sent you a friend request"))
			.ToList();

		if (friendRequestNotifications.Count == 0)
			return notifications;

		var relatedRequestIds = friendRequestNotifications
			.Where(n => n.RelatedRequestId != null)
			.Select(n => n.RelatedRequestId!.Value)
			.ToList();

		var existingRequestIds = await _db.FriendshipRequests
			.Where(fr => relatedRequestIds.Contains(fr.Id))
			.Select(fr => fr.Id)
			.ToListAsync(ct);

		var existingRequestIdsSet = existingRequestIds.ToHashSet();

		var staleNotifications = friendRequestNotifications
			.Where(n =>
				n.RelatedRequestId == null ||
				!existingRequestIdsSet.Contains(n.RelatedRequestId.Value))
			.ToList();

		if (staleNotifications.Count > 0)
		{
			_db.Notifications.RemoveRange(staleNotifications);
			await _db.SaveChangesAsync(ct);

			notifications.RemoveAll(n => staleNotifications.Contains(n));
		}

		return notifications;
	}

	public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken ct)
    {
        return await _db.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, ct);
    }

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken ct)
    {
        var notifications = await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(ct);

        foreach (var notification in notifications)
        {
            notification.MarkAsRead();
        }
    }
    public async Task MarkConversationAsReadAsync(Guid userId, Guid conversationId, CancellationToken ct)
    {
        var notifications = await _db.Notifications
            .Where(n =>
                n.UserId == userId &&
                n.RelatedConversationId == conversationId &&
                !n.IsRead)
            .ToListAsync(ct);

        foreach (var notification in notifications)
            notification.IsRead = true;
    }
    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
    public async Task MarkSeenNotificationsAsReadAsync(
        Guid userId,
        CancellationToken ct)
    {
        var notifications = await _db.Notifications
            .Where(n =>
                n.UserId == userId &&
                n.Type != (int)NotificationType.FriendRequest &&
                !n.IsRead)
            .ToListAsync(ct);

        foreach (var notification in notifications)
        {
            notification.MarkAsRead();
        }
    }
    public async Task MarkNotificationAsReadAsync(
        Guid userId,
        Guid notificationId,
        CancellationToken ct)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(
                n => n.Id == notificationId &&
                    n.UserId == userId,
                ct);

        if (notification is null)
            return;

        notification.MarkAsRead();
    }
}