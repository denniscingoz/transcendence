using Transcendence.Domain.Exceptions;
namespace Transcendence.Domain.Friends;
public sealed class Friendship
{
	public Guid User1Id {get; private set; }

    public Guid User2Id {get; private set; }
    public DateTime CreatedAt {get; private set; } = DateTime.UtcNow;


#pragma warning disable CS8618
	private Friendship ( ) {}
#pragma warning restore CS8618

	public Friendship (Guid userAId, Guid userBId, DateTime createdAt)
    {
		if (userAId == userBId) throw new CannotFriendYourselfException();

		var (u1, u2) = userAId.CompareTo(userBId) < 0 ? (userAId, userBId) : (userBId, userAId);
		User1Id = u1;
		User2Id = u2;
		CreatedAt = createdAt;
	}
}
