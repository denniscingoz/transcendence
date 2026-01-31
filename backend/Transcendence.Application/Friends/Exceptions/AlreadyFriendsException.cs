namespace Transcendence.Application.Friends.Exceptions;
public sealed class AlreadyFriendsException : Exception
{
	public AlreadyFriendsException() : base("Users are already friends.") { }
}
