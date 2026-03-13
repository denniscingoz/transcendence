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

	public string? GoogleId { get; private set; }

	public string? Role { get; private set; }

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

	public User(Guid id, string googleId, string username, string email, string fullName, DateTime createdAt)
	{
		Id = id;
		SetUsername(username);
		SetEmail(email);
		SetFullName(fullName);
		CreatedAt = createdAt;
		GoogleId = googleId;
	}

	public User(Guid id, string username, string email, string fullName, DateTime createdAt, string role)
	{
		Id = id;
		SetUsername(username);
		SetEmail(email);
		SetFullName(fullName);
		CreatedAt = createdAt;
		Role = role;
	}
	public void UpdateDetails(string? fullName = null, string? username = null)
	{
		if (fullName != null) SetFullName(fullName);
		if (username != null) SetUsername(username);
	}

	public void UpdateAvatar(Guid? avatarFileId)
	{
		AvatarFileId = avatarFileId;
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
