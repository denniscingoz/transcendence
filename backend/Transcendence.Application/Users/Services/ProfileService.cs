using Transcendence.Application.Common.Exceptions;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Application.Users.DTOs;
using Transcendence.Application.Users.Interfaces;

namespace Transcendence.Application.Users.Services;

public sealed class ProfileService : IProfileService // collects meaning, repositories provide facts. (Querry)
{
	private readonly IUserRepository _userRepository;
	private readonly IFriendshipRepository _friendsRepository;
	private readonly IPostRepository _postRepository;


	public ProfileService(IFriendshipRepository friendsRepository, 
						 IUserRepository userRepository,
						 IPostRepository postRepository)
	{
		_friendsRepository = friendsRepository;
		_userRepository = userRepository;
		_postRepository = postRepository;
	}
	public async Task<MyProfileDto> GetMyProfileAsync(Guid userId)
	{
		var user = await _userRepository.GetByIdAsync(userId)
			?? throw new NotFoundException("User not found.");

		var postsCount = await _postRepository.CountByUserIdAsync(userId);
		var friendsCount = await _friendsRepository.CountFriendsAsync(userId);

		return new MyProfileDto
		{
			Id = user.Id,
			Username = user.Username,
			FullName = user.FullName,
			Bio = user.Bio,
			AvatarUrl = user.AvatarUrl,
			PostsCount = postsCount,
			FriendsCount = friendsCount
		};
	}
	public async Task<MyProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
	{
		var user = await _userRepository.GetByIdAsync(userId)
			?? throw new NotFoundException("User not found.");
		//First we need to check if the username is changing and if the new username is already taken.
		if (!string.IsNullOrWhiteSpace(dto.Username))
		{
			var newUsername = dto.Username.Trim();

			// Only check DB if the name is ACTUALLY changing
			// (Case-insensitive comparison is best practice for usernames)
			if (!string.Equals(user.Username, newUsername, StringComparison.OrdinalIgnoreCase))
			{
				var existingUser = await _userRepository.GetByUsernameAsync(newUsername);

				if (existingUser != null)
				{
					// Stop! Do not proceed.
					throw new InvalidOperationException($"Username '{newUsername}' is already taken.");
				}
			}
		}
		// 1. Update Identity (Name, Username)
		// We pass nulls if they aren't in the DTO; the Domain ignores them safely.
		user.UpdateDetails(dto.FullName, dto.Username);

		// 2. Update Bio
		// We check if the DTO value is NOT null. If it's null, we do nothing (preserve existing).
		if (dto.Bio != null)
		{
			// If frontend sent "", we convert it to null to "Delete" it.THIS IS IMPORTANT!!!!
			// If frontend sent "Hello", we save "Hello".
			string? newBio = dto.Bio == "" ? null : dto.Bio;
			user.UpdateBio(newBio);
		}

		// 3. Update Avatar (Same logic as Bio)
		if (dto.AvatarUrl != null)
		{
			string? newAvatar = dto.AvatarUrl == "" ? null : dto.AvatarUrl;
			user.UpdateAvatar(newAvatar);
		}
		await _userRepository.SaveChangesAsync();
		return new MyProfileDto
		{
			Id = user.Id,
			Username = user.Username,
			FullName = user.FullName,
			Bio = user.Bio,
			AvatarUrl = user.AvatarUrl,
			PostsCount = await _postRepository.CountByUserIdAsync(userId),
			FriendsCount = await _friendsRepository.CountFriendsAsync(userId)
		};
	}
	public async Task<OtherProfileDto> GetOtherProfileAsync(Guid targetUserId, Guid viewerUserId)
	{
		var user = await _userRepository.GetByIdAsync(targetUserId)
			?? throw new InvalidOperationException("User not found.");

		bool areWeFrinds =
			await _friendsRepository.IsFriendAsync(viewerUserId, targetUserId);

		return new OtherProfileDto
		{
			Id = user.Id,
			Username = user.Username,
			FullName = user.FullName,
			Bio = user.Bio,
			AvatarUrl = user.AvatarUrl,
			PostsCount = await _postRepository.CountByUserIdAsync(targetUserId), //TODO
			FriendsCount = await _friendsRepository.CountFriendsAsync(targetUserId),
			AreWeFriends = areWeFrinds
		};
	}
}
/*
	Service (Application layer)
		•	реализует конкретный сценарий
		•	решает:
			•	кого загрузить
			•	в каком порядке
			•	какие проверки нужны
			•	какие domain-методы вызвать
		•	управляет транзакцией (через DbContext)

		X не хранит состояние
		X не знает SQL
		X не меняет поля напрямую
		X не содержит сложных правил сущности

		HTTP
		↓
		Controller  → перевод HTTP → вызов Use Case
		↓
		Service     → бизнес-сценарий
		↓
		Domain      → правила и поведение
		↓
		Repository  → сохранение
		↓
		DB
*/