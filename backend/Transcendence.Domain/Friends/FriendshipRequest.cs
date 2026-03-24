using Transcendence.Domain.Exceptions;
namespace Transcendence.Domain.Friends;
public sealed class FriendshipRequest
{
	public Guid Id { get; private set; }
	public Guid RequesterId { get; private set; }
	public Guid TargetUserId { get; private set; }
	
	// Normalized pair for uniqueness regardless of direction.
	public Guid User1Id { get; private set; }
	public Guid User2Id { get; private set; }
	public DateTime CreatedAt { get; private set; }

#pragma warning disable CS8618
	private FriendshipRequest() { }
#pragma warning restore CS8618


	public FriendshipRequest(Guid id, Guid requesterId, Guid targetUserId, DateTime createdAt)
	{
		if (id == Guid.Empty)
			throw new ArgumentException("Id cannot be empty.", nameof(id));
		if (requesterId == Guid.Empty)
			throw new ArgumentException("User ids cannot be empty.", nameof(requesterId));
		if (targetUserId == Guid.Empty)
			throw new ArgumentException("User ids cannot be empty.", nameof(targetUserId));
		if (requesterId == targetUserId) throw new CannotFriendYourselfException();

		Id = id;
		RequesterId = requesterId;
		TargetUserId = targetUserId;
		var (u1, u2) = Normalize(requesterId, targetUserId);
		User1Id = u1;
		User2Id = u2;
		CreatedAt = createdAt;
	}
	private static (Guid u1, Guid u2) Normalize(Guid a, Guid b)
		=> a.CompareTo(b) < 0 ? (a, b) : (b, a);
}

