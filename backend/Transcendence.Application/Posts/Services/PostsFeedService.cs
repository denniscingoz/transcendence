using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Posts.DTOs;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Domain.Posts;

namespace Transcendence.Application.Posts.Services;
internal class PostsFeedService : IPostsFeedService
{
	private readonly IPostsFeedRepository _postsFeedRepository;
	private readonly IUserRepository _userRepository;
	private readonly IPostsRepository _postRepository;
	private readonly IFriendshipRepository _friendshipRepository;
	public PostsFeedService(
		IPostsFeedRepository postsFeedRepository,
		IUserRepository userRepository,
		IPostsRepository postRepository,
		IFriendshipRepository friendshipRepository)
	{
		_postsFeedRepository = postsFeedRepository;
		_userRepository = userRepository;
		_postRepository = postRepository;
		_friendshipRepository = friendshipRepository;
	}

	public async Task<CursorPageDto<PostDto>> GetFeedAsync(
		int take,
		string? cursor,
		Guid currentUserId,
		CancellationToken ct)
	{
		take = (take < 1 || take > 50) ? 20 : take;

		// repository returns: Items + NextCursor (cursor logic stays in repository)
		var page = await _postsFeedRepository.GetFeedPageAsync(currentUserId, take, cursor, ct);


		// Map entity to DTO
		var items = page.Items.Select(p => new PostDto
		{
			Id = p.Id,
			AuthorId = p.AuthorId,
			CreatedAtUtc = p.CreatedAtUtc,
			Content = p.Content,
			ImageUrl = p.ImageUrl,
			IsLikedByCurrentUser = p.IsLikedByCurrentUser,
			LikesCount = p.LikesCount,
			AuthorFullName = p.AuthorFullName,
			AuthorUsername = p.AuthorUsername,
			AuthorAvatarUrl = p.AuthorAvatarUrl
		}).ToList();

		return new CursorPageDto<PostDto>(items, page.NextCursor);
	}
}

