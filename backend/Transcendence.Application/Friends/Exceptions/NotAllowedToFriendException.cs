using Transcendence.Application.Common.Exceptions;

namespace Transcendence.Application.Friends.Exceptions;
public class NotAllowedToFriendException : UnauthorizedException
{
	public NotAllowedToFriendException(string message) : base(message) { }
}