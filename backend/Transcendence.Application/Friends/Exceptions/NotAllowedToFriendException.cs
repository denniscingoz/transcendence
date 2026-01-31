namespace Transcendence.Application.Friends.Exceptions;
public class NotAllowedToFriendException : Exception
{
	public NotAllowedToFriendException(string message) : base(message) { }
}