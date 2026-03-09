using Transcendence.Application.Friends.DTOs;
using Transcendence.Application.Friends.Queries;

namespace Transcendence.Infrastructure.Query;
public sealed class FriendsQuery : IFriendsQuery
{

	public async Task<IReadOnlyList<FriendDto>> ListFriendsAsync(Guid userId, CancellationToken ct) 
	{
		throw new NotImplementedException("Should be implemented");
	}
	public async Task<IReadOnlyList<FriendRequestDto>> ListFriendRequestsAsync(Guid userId, CancellationToken ct) 
	{
		throw new NotImplementedException("Should be implemented");
	}
}
