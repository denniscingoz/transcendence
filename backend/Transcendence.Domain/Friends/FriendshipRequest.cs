using Transcendence.Domain.Exceptions;
namespace Transcendence.Domain.Friends;
public sealed class FriendRequest
{
	public Guid Id { get; private set; }
	public Guid RequesterId { get; private set; }
	public Guid TargetUserId { get; private set; }
	public DateTime CreatedAt { get; private set; }

	private FriendRequest() { }

	public FriendRequest(Guid id, Guid requesterId, Guid targetUserId, DateTime createdAt)
	{
		if (requesterId == targetUserId) throw new CannotFriendYourselfException();

		Id = id;
		RequesterId = requesterId;
		TargetUserId = targetUserId;
		CreatedAt = createdAt;
	}
}

