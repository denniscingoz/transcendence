using Transcendence.Application.Users.DTOs;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.UserFollows.Interfaces;



namespace Transcendence.Application.Users.Services;

public sealed class ProfileService // collects meaning, repositories provide facts.
{
    private readonly IUserRepository _userRepository;
    private readonly IUserFollowRepository _followRepository;

    public ProfileService(IUserFollowRepository followRepository, 
                         IUserRepository userRepository)
    {
        _followRepository = followRepository;
        _userRepository = userRepository;
    }
    public async Task<MyProfileDto> GetMyProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("User not found.");
        
        return new MyProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl
        };
    }
    public async Task UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("User not found.");
        
        user.UpdateProfile(dto.Bio, dto.AvatarUrl);

        await _userRepository.SaveChangesAsync();
    }

    public async Task<OtherProfileDto> GetOtherProfileAsync (Guid targetUserId, Guid viewerUserId)
    {
        var user = await _userRepository.GetByIdAsync(targetUserId)
            ?? throw new InvalidOperationException("User not found.");
        
        bool isFollowing = await _followRepository.IsFollowingAsync(viewerUserId, targetUserId);
        return new OtherProfileDto
        {
            Id = targetUserId,
            Username = user.Username,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            IsFollowing = isFollowing
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