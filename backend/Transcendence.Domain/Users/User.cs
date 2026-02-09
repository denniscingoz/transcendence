namespace Transcendence.Domain.Users;

public sealed class User
{
	public Guid Id { get; private set; }
	public string Username { get; private set; } = default!;
	public string PasswordHash { get; private set; } = default!;
	public string Email { get; private set; } = default!;
	public string FullName { get; private set; } = default!;
	public string? Bio { get; private set; }
	public Guid? AvatarFileId { get; private set; }
	public DateTime CreatedAt { get; private set; }

#pragma warning disable CS8618
	private User() { }
#pragma warning restore CS8618

	public void SetPasswordHash(string passwordHash)
	{
		PasswordHash = passwordHash;
	}

	public User(Guid id, string username, string email, string fullName, DateTime createdAt)
	{
		Id = id;
		SetUsername(username);
		SetEmail(email);
		SetFullName(fullName);
		CreatedAt = createdAt;
	}

	public void UpdateDetails(string? fullName = null, string? username = null)
	{
		if (fullName != null) SetFullName(fullName);
		if (username != null) SetUsername(username);
	}

	public void UpdateAvatar(Guid? avatarUrl)
	{
		AvatarFileId = avatarUrl;
	}

	public void UpdateBio(string? bio)
	{
		Bio = bio?.Trim();
		if (Bio == "") Bio = null;
	}

	private void SetFullName(string value)
	{
		var v = value.Trim();
		if (v.Length == 0) throw new InvalidOperationException("FullName cannot be empty.");
		FullName = v;
	}

	private void SetUsername(string value)
	{
		var v = value.Trim();
		if (v.Length == 0) throw new InvalidOperationException("Username cannot be empty.");
		Username = v;
	}

	private void SetEmail(string value)
	{
		var v = value.Trim().ToLowerInvariant();
		if (v.Length == 0) throw new InvalidOperationException("Email cannot be empty.");
		Email = v;
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