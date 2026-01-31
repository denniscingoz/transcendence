namespace Transcendence.Application.Friends.Exceptions;
public sealed class FriendRequestAlreadyExistsException : Exception
{
	public FriendRequestAlreadyExistsException() : base("Users are already friends.") { }
}
