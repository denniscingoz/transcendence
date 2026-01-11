using Transcendence.Domain.UserFollows;
namespace Transcendence.Application.UserFollows.Interfaces;

public interface IUserFollowRepository
{
    Task <bool> IsFollowingAsync(Guid folllowerId, Guid followingId);
    Task AddAsync(UserFollow follow);
    Task RemoveAsync(Guid followerId, Guid followingId);
}