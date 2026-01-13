using Transcendence.Application.Users.DTOs;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Application.UserFollows.Interfaces;
using Transcendence.Application.Posts.Interfaces;




namespace Transcendence.Application.Users.Services;

public sealed class ProfileService // collects meaning, repositories provide facts. (Querry)
{
    private readonly IUserRepository _userRepository;
    private readonly IUserFollowRepository _followRepository;
    private readonly IPostRepository _postRepository;


    public ProfileService(IUserFollowRepository followRepository, 
                         IUserRepository userRepository,
                         IPostRepository postRepository)
    {
        _followRepository = followRepository;
        _userRepository = userRepository;
        _postRepository = postRepository;
    }
    public async Task<MyProfileDto> GetMyProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        return new MyProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            PostsCount = await _postRepository.CountByUserIdAsync(userId),
            FollowersCount = await _followRepository.CountFollowersAsync(userId),
            FollowingCount = await _followRepository.CountFollowingAsync(userId)
        };
    }
    public async Task UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        user.UpdateProfile( // Domain entity controls how it changes; the service only coordinates the use-case.
            fullName: dto.FullName,
            bio: dto.Bio,
            username: dto.Username
        );

        await _userRepository.SaveChangesAsync();
    }
    public async Task<OtherProfileDto> GetOtherProfileAsync(
        Guid targetUserId,
        Guid viewerUserId)
    {
        var user = await _userRepository.GetByIdAsync(targetUserId)
            ?? throw new InvalidOperationException("User not found.");

        bool isFollowedByMe =
            await _followRepository.IsFollowingAsync(viewerUserId, targetUserId);

        return new OtherProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            PostsCount = await _postRepository.CountByUserIdAsync(targetUserId), //TODO
            FollowersCount = await _followRepository.CountFollowersAsync(targetUserId),
            FollowingCount = await _followRepository.CountFollowingAsync(targetUserId),
            IsFollowedByMe = isFollowedByMe
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