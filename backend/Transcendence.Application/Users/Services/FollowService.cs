namespace Transcendence.Application.Users.Services;

using Transcendence.Domain.UserFollows;
using Transcendence.Application.UserFollows.Interfaces;
using Transcendence.Application.Users.Interfaces;

using Transcendence.Domain.Users;

public sealed class FollowService // use-case (Command)
{
    private readonly IUserFollowRepository _followRepository;
    private readonly IUserRepository _userRepository;

    public FollowService(IUserFollowRepository followRepository, 
                         IUserRepository userRepository)
    {
        _followRepository = followRepository;
        _userRepository = userRepository;
    }

    public async Task ToggleFollowAsync(Guid followerId, Guid targetUserId)
    {
        if (followerId == targetUserId)
            throw new InvalidOperationException("Cannot follow yourself");

        var targetUser = await _userRepository.GetByIdAsync(targetUserId);
        if (targetUser is null)
            throw new InvalidOperationException("Target user not found");

        bool isFolowing = await _followRepository.IsFollowingAsync(followerId, targetUserId);

        if (isFolowing)
            await _followRepository.RemoveAsync(followerId, targetUserId);
        else
        {
            var follow = new UserFollow(followerId, targetUserId);
            await _followRepository.AddAsync(follow);
        }

        await _userRepository.SaveChangesAsync();
    }

}