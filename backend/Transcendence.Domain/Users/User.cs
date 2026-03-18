namespace Transcendence.Domain.Users;

public sealed class User
{
	public Guid Id { get; private set; }
	public string Username { get; private set; } = default!;
	public string? PasswordHash { get; private set; } 
	public string Email { get; private set; } = default!;
	public string FullName { get; private set; } = default!;
	public string? Bio { get; private set; }
	public Guid? AvatarFileId { get; private set; }
	public DateTime CreatedAt { get; private set; }

	public string? GoogleId { get; private set; }

	public string Role { get; private set; } = default!; // e.g. "User", "Admin"

	#pragma warning disable CS8618 // for EF Core to silence non-nullable properties
		private User() { }
	#pragma warning restore CS8618

	public static User CreateLocal(
		Guid id,
		string username,
		string email,
		string fullName,
		DateTime createdAt,
		string role)
	{
		if (id == Guid.Empty)
			throw new InvalidOperationException("Id cannot be empty.");

		var user = new User
		{
			Id = id,
			CreatedAt = createdAt
		};

		user.SetUsername(username);
		user.SetEmail(email);
		user.SetFullName(fullName);
		user.SetRole(role);

		return user;
	}
	
	public static User CreateGoogle(
		Guid id,
		string googleId,
		string username,
		string email,
		string fullName,
		DateTime createdAt,
		string role)
	{
		if (id == Guid.Empty)
			throw new InvalidOperationException("Id cannot be empty.");

		var user = new User
		{
			Id = id,
			CreatedAt = createdAt
		};

		user.SetGoogleId(googleId);
		user.SetUsername(username);
		user.SetEmail(email);
		user.SetFullName(fullName);
		user.SetRole(role);

		return user;
	}
	
	private void SetUsername(string value)
	{
		var v = value.Trim();
		if (v.Length == 0)
			throw new InvalidOperationException("Username cannot be empty.");//max length check? Best practice: important rules should be enforced before DB too.
		if (v.Length > 50)
			throw new InvalidOperationException("Username cannot exceed 50 characters.");
		Username = v;
	}
	
	private void SetEmail(string value)
	{
		var v = value.Trim().ToLowerInvariant();
		if (v.Length == 0)
			throw new InvalidOperationException("Email cannot be empty.");
		if (v.Length > 255) // other email validations, where?
			throw new InvalidOperationException("Email cannot exceed 255 characters.");
		Email = v;
	}
	private void SetFullName(string value)
	{
		var v = value.Trim();
		if (v.Length == 0)
			throw new InvalidOperationException("FullName cannot be empty.");//max length check? Best practice: important rules should be enforced before DB too.
		if (v.Length > 100)
			throw new InvalidOperationException("FullName cannot exceed 100 characters.");
		FullName = v;
	}
	public void SetPasswordHash(string passwordHash)
	{
		if (string.IsNullOrWhiteSpace(passwordHash))
			throw new InvalidOperationException("PasswordHash cannot be empty.");
		PasswordHash = passwordHash;
	}
	
	private void SetRole(string value)
	{
		var v = value.Trim();
		if (v.Length == 0)
			throw new InvalidOperationException("Role cannot be empty.");
		if (v.Length > 50)
			throw new InvalidOperationException("Role cannot exceed 50 characters.");

		Role = v;
	}
	
	private void SetGoogleId(string value)
	{
		var v = value.Trim();
		if (v.Length == 0)
			throw new InvalidOperationException("GoogleId cannot be empty.");

		GoogleId = v;
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
	
}
