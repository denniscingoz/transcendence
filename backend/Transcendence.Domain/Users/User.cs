namespace Transcendence.Domain.Users;

public sealed class User
{
    public Guid Id { get; private set; } // Id created outside
    public  string Username {get; private set; }  // entity controles property only by itself's methods
    public  string Email {get; private set; } 
    public string FullName { get; private set; }

    public string? Bio {get; private set; }
    public string? AvatarUrl {get; private set; }

    public DateTime CreatedAt { get; private set; }

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value
    private User() { } // constructor for EF
#pragma warning restore CS8618

    public User (Guid id, string username, string email, string fullName)
    {
        Id = id;
        Username = username;
        FullName = fullName;
        Email = email;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateProfile(
        string? fullName = null,
        string? bio = null,
        string? avatarUrl = null,
        string? username = null)
    {
        if (fullName is not null)
            FullName = fullName;

        if (bio is not null)
            Bio = bio;

        if (avatarUrl is not null)
            AvatarUrl = avatarUrl;

        if (username is not null)
            Username = username;
    }
}
/*
    Domain (User)
	•	знает кто он
	•	знает что ему можно
	•	знает как себя менять
	•	НЕ знает:
	•	БД
	•	HTTP
	•	авторизацию


    1. Domain        → кто такой User
    2. Application   → что можно с ним делать (use-cases)
    3. API           → как это вызывается по HTTP
    4. Infrastructure→ как это хранится в БД

    ✔ Controller → DTO
    ✔ Service → DTO
    ✔ Domain → values
    ✔ Repository → Domain

    Profile update logic lives in the Domain entity,
    because the entity itself knows how it is allowed to change.
    The service only orchestrates the use-case and does not modify fields directly.

    Services decide WHEN something happens.
    Entities decide HOW they change.

    Domain entity содержит только то,
    за что она отвечает и что контролирует.

    Счётчики:
    - не контролируются User

    - не изменяются User

    + считаются извне
*/