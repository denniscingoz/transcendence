using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Posts;
using Transcendence.Domain.Users;

namespace Transcendence.Infrastructure.Configurations;

public sealed class CommentConfiguration : IEntityTypeConfiguration<Comment>
{
	public void Configure(EntityTypeBuilder<Comment> builder)
	{
		builder.ToTable("comments");

		builder.HasKey(x => x.Id);

		builder.Property(x => x.Content)
			.IsRequired()
			.HasMaxLength(1000);

		builder.Property(x => x.CreatedAtUtc)
			.IsRequired();

		builder.Property(x => x.UpdatedAtUtc);

		builder.HasOne<Post>()
			.WithMany()
			.HasForeignKey(x => x.PostId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.HasOne<User>()
			.WithMany()
			.HasForeignKey(x => x.AuthorId)
			.OnDelete(DeleteBehavior.Cascade);

		builder.HasIndex(x => x.PostId);
		builder.HasIndex(x => x.AuthorId);
	}
}