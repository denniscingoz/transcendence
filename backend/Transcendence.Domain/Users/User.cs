namespace Transcendence.Domain.Users;

public sealed class User
{
    public Guid Id { get; private set; } // Id created outside
    public  string Username {get; private set; }  // entity controles property only by itself's methods
    public  string Email {get; private set; } 

    public string? Bio {get; private set; }
    public string? AvatarUrl {get; private set; }

    public DateTime CreatedAt { get; private set; }

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value
    private User() { } // constructor for EF
#pragma warning restore CS8618




    public User (Guid id, string username, string email)
    {
        Id = id;
        Username = username;
        Email = email; 
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateProfile(string? bio, string? avatarUrl) // recieves privimitives , not DTO
    {
        Bio = bio; // "" if indo was deleted 
        AvatarUrl = avatarUrl; // same
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

*/