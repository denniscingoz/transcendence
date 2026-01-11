using Transcendence.Domain.Exceptions;
namespace Transcendence.Domain.UserFollows;
public sealed class UserFollow
{
    public Guid FollowerId {get; private set; }

    public Guid FollowingId {get; private set; }
    private UserFollow ( ) {}

    public UserFollow (Guid followerId, Guid followingId)
    {
        if (followerId == followingId)
            throw new FollowYourselfException();
        FollowerId = followerId;
        FollowingId = followingId;
    }


}