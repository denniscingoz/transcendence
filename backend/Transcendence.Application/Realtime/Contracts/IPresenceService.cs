using Transcendence.Application.Realtime.DTOs;

namespace Transcendence.Application.Realtime.Contracts;

public interface IPresenceService
{
    public bool AddConnection (Guid userId, string connectionId);
    public bool RemoveConnection (Guid userId, string connectionId);
    public bool IsOnline(Guid userId);
    public IEnumerable<Guid> GetOnlineUsers();
}