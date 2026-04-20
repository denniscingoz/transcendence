using Transcendence.Application.Common.Exceptions;

namespace Transcendence.Application.Friends.Exceptions;
public sealed class FriendshipRequestAlreadyExistsException : ConflictException
{
	public FriendshipRequestAlreadyExistsException() : base("Friendship request already exists.") { }
}
