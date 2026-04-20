namespace Transcendence.Application.Friends.Exceptions;
public class NotFriendsException : UnauthorizedAccessException
{
	public NotFriendsException() : base("You're not friends.")  { }
}