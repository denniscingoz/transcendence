using Transcendence.Domain.UserFollows;
namespace Transcendence.Application.UserFollows.Interfaces;

public interface IUserFollowRepository
{
    Task <bool> IsFollowingAsync(Guid followerId, Guid followingId);
    Task AddAsync(UserFollow follow);
    Task RemoveAsync(Guid followerId, Guid followingId);
    Task <int> CountFollowersAsync (Guid userId);
    Task <int> CountFollowingAsync (Guid userId);

}