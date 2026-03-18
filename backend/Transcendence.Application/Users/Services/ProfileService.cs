using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using Transcendence.Application.Common.Exceptions;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Application.Users.DTOs;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Domain.Users;



namespace Transcendence.Application.Users.Services;

public sealed class ProfileService : IProfileService // collects meaning, repositories provide facts. (Querry)
{
	private readonly IUserRepository _userRepository;
	private readonly IFriendshipRepository _friendsRepository;
	private readonly IPostsRepository _postRepository;
	private readonly IPasswordHasher<User> _passwordHasher;
	

	public ProfileService(IFriendshipRepository friendsRepository, 
						IUserRepository userRepository,
						IPostsRepository postRepository,
						IPasswordHasher<User> passwordHasher)
	{
		_friendsRepository = friendsRepository;
		_userRepository = userRepository;
		_postRepository = postRepository;
		_passwordHasher = passwordHasher;
	}



	//GET /profile/me
	public async Task<MyProfileDto> GetMyProfileAsync(Guid userId, CancellationToken ct)
	{
		var user = await _userRepository.GetByIdAsync(userId, ct)
			?? throw new NotFoundException("User not found.");

		var postsCount = await _postRepository.CountByUserIdAsync(userId, ct);
		var friendsCount = await _friendsRepository.CountFriendsAsync(userId, ct);
		
		return new MyProfileDto
		{
			Id = user.Id,
			Username = user.Username,
			FullName = user.FullName,
			Bio = user.Bio,
			AvatarUrl = BuildAvatarFileUrl(user.AvatarFileId),
			PostsCount = postsCount,
			FriendsCount = friendsCount
		};
	}

	//PATCH /profile/me
	public async Task<MyProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken ct)
	{
		var user = await _userRepository.GetByIdAsync(userId, ct)
			?? throw new NotFoundException("User not found.");
		//First we need to check if the username is changing and if the new username is already taken.
		if (!string.IsNullOrWhiteSpace(dto.Username))
		{
			var newUsername = dto.Username.Trim();

			// Only check DB if the name is ACTUALLY changing
			// (Case-insensitive comparison is best practice for usernames)
			//if (!string.Equals(user.Username, newUsername, StringComparison.OrdinalIgnoreCase))
			if (!string.Equals(user.Username, newUsername, StringComparison.Ordinal))//case sensitive better?
			{
				var existingUser = await _userRepository.GetByUsernameAsync(newUsername, ct);

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

		// 3. Update AvatarFileId (Same logic as Bio) //This works, but design-wise it is a bit awkward:your domain stores AvatarFileId, but DTO sends AvatarUrl.
		//												That means service has to parse URL text just to get the actual ID.
		//												A cleaner backend contract would often be:
		//												frontend sends avatarFileId.backend builds URL in response.instead of sending URL back into backend.
		if (dto.AvatarUrl != null)
		{
			Guid? newAvatarFileId = null;

			if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
			{
				var lastPart = dto.AvatarUrl.Split('/').LastOrDefault();

				if (!Guid.TryParse(lastPart, out var parsedFileId))
					throw new ValidationException("Invalid avatar URL.");

				newAvatarFileId = parsedFileId;
			}

			user.UpdateAvatar(newAvatarFileId);
		}
		await _userRepository.SaveChangesAsync(ct);
		return new MyProfileDto
		{
			Id = user.Id,
			Username = user.Username,
			FullName = user.FullName,
			Bio = user.Bio,
			AvatarUrl = BuildAvatarFileUrl(user.AvatarFileId),
			PostsCount = await _postRepository.CountByUserIdAsync(userId, ct),
			FriendsCount = await _friendsRepository.CountFriendsAsync(userId, ct)
		};
	}

	//GET /profile/{id}
	public async Task<OtherProfileDto> GetOtherProfileAsync(Guid targetUserId, Guid viewerUserId, CancellationToken ct)
	{
		var user = await _userRepository.GetByIdAsync(targetUserId, ct)
			?? throw new NotFoundException("User not found.");

		bool areWeFrinds =
			await _friendsRepository.IsFriendAsync(viewerUserId, targetUserId, ct);

		return new OtherProfileDto
		{
			Id = user.Id,
			Username = user.Username,
			FullName = user.FullName,
			Bio = user.Bio,
			AvatarUrl = BuildAvatarFileUrl(user.AvatarFileId),
			PostsCount = await _postRepository.CountByUserIdAsync(targetUserId, ct), //TODO
			FriendsCount = await _friendsRepository.CountFriendsAsync(targetUserId, ct),
			AreWeFriends = areWeFrinds
		};
	}

	//PATCH /profile/password
	public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken ct)
	{
		var user = await _userRepository.GetByIdAsync(userId, ct)
			?? throw new NotFoundException("User not found.");
		
		if (string.IsNullOrWhiteSpace(user.PasswordHash))
			throw new InvalidOperationException("This account does not support password change.");//created with Google
		
		var verificationResult = _passwordHasher.VerifyHashedPassword(
			user,
			user.PasswordHash,
			dto.CurrentPassword);

		if (verificationResult == PasswordVerificationResult.Failed)
		{
			throw new ArgumentException("Current password is incorrect.", nameof(dto.CurrentPassword));
		}

		user.SetPasswordHash(_passwordHasher.HashPassword(user, dto.NewPassword));
		await _userRepository.SaveChangesAsync(ct);
	}

	string? BuildAvatarFileUrl(Guid? fileId)
		=> fileId is Guid id ? $"/files/{id}" : null;

}
