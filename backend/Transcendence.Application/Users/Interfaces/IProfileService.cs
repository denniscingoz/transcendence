using Transcendence.Application.Users.DTOs;

namespace Transcendence.Application.Users.Interfaces;

public interface IProfileService
{
	Task<MyProfileDto> GetMyProfileAsync(Guid userId, CancellationToken ct);                 // throws NotFoundException
	Task<MyProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken ct);
	Task<OtherProfileDto> GetOtherProfileAsync(Guid userId, Guid viewerId, CancellationToken ct); // throws NotFoundException
	Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken ct);
}