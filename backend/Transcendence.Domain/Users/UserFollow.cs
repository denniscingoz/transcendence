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

/*
UserFollow is not a separate domain entity.
It represents a relationship within the User domain,
so it lives inside the Users module,
but it still deserves its own domain model 
because the relationship itself has business rules, 
invariants, and lifecycle constraints that must be e
xplicitly modeled and enforced
*/