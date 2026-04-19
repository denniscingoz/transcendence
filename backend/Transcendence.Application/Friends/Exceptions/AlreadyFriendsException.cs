using Transcendence.Application.Common.Exceptions;

namespace Transcendence.Application.Friends.Exceptions;
public sealed class AlreadyFriendsException : ConflictException
{
	public AlreadyFriendsException() : base("Users are already friends.") { }
}
