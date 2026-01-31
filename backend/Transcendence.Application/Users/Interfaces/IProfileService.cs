using Transcendence.Application.Users.DTOs;

namespace Transcendence.Application.Users.Interfaces;

public interface IProfileService
{
	Task<MyProfileDto> GetMyProfileAsync(Guid userId);                 // throws NotFoundException
	Task<MyProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
	Task<OtherProfileDto> GetOtherProfileAsync(Guid userId, Guid viewerId); // throws NotFoundException
}