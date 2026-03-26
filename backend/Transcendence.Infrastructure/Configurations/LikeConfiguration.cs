using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Posts;
using Transcendence.Domain.Users;

namespace Transcendence.Infrastructure.Configurations;

public sealed class LikeConfiguration : IEntityTypeConfiguration<Like>
{
	public void Configure(EntityTypeBuilder<Like> builder)
	{
		builder.ToTable("likes");

		builder.HasKey(x => x.Id);

		builder.Property(x => x.CreatedAtUtc)
			.IsRequired();

		builder.HasOne<Post>()
			.WithMany()
			.HasForeignKey(x => x.PostId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.HasOne<User>()
			.WithMany()
			.HasForeignKey(x => x.AuthorId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.HasIndex(x => new { x.PostId, x.AuthorId })
			.IsUnique();

		builder.HasIndex(x => x.PostId);
		builder.HasIndex(x => x.AuthorId);
	}
}