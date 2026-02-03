namespace Transcendence.Application.Friends.Exceptions;
public sealed class FriendshipRequestAlreadyExistsException : Exception
{
	public FriendshipRequestAlreadyExistsException() : base("Users are already friends.") { }
}
