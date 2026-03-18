using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Users;
using Transcendence.Domain.Files;

namespace Transcendence.Infrastructure.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
	public void Configure(EntityTypeBuilder<User> builder)
	{
		builder.ToTable("users", t =>
		{
			t.HasCheckConstraint(
				"CK_users_auth_method",
				"\"PasswordHash\" IS NOT NULL OR \"GoogleId\" IS NOT NULL");
		});
		builder.HasKey(x => x.Id);
		builder.Property(x => x.Username)
			.IsRequired()
			.HasMaxLength(50);
		builder.HasIndex(x => x.Username)
			.IsUnique();
		builder.Property(x => x.PasswordHash)
			//.IsRequired()
			.HasMaxLength(255);//is 255 ok?
		builder.Property(x => x.Email)
			.IsRequired()
			.HasMaxLength(255);
		builder.HasIndex(x => x.Email)
			.IsUnique();
		builder.Property(x => x.FullName)
			.IsRequired()
			.HasMaxLength(100);
		builder.Property(x => x.Bio)
			.HasMaxLength(500);
		builder.Property(x => x.CreatedAt)
			.IsRequired();
		builder.Property(x => x.GoogleId)
			.HasMaxLength(255);
		builder.HasIndex(x => x.GoogleId)
			.IsUnique();
		builder.Property(x => x.Role)
			.IsRequired()
			.HasMaxLength(50);
		builder.HasOne<FilesAsset>()
			.WithMany()
			.HasForeignKey(x => x.AvatarFileId)
			.OnDelete(DeleteBehavior.SetNull);
	}
}
