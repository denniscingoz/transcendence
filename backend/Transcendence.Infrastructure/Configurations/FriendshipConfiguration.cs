using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Friends;
using Transcendence.Domain.Users;

namespace Transcendence.Infrastructure.Configurations;

public sealed class FriendshipConfiguration : IEntityTypeConfiguration<Friendship>
{
	public void Configure(EntityTypeBuilder<Friendship> builder)
	{
		builder.ToTable("Friendships", t =>
		{
			t.HasCheckConstraint(
				"CK_friendship_different_users",
				"(\"User1Id\" < \"User2Id\")"
			);
		});

		// Composite primary key: prevents duplicates naturally.
		builder.HasKey(x => new { x.User1Id, x.User2Id });

		builder.Property(x => x.CreatedAt)
			.IsRequired();
			
		builder.HasOne<User>()
			.WithMany()
			.HasForeignKey(x => x.User1Id)
			.OnDelete(DeleteBehavior.Cascade);
		
		builder.HasOne<User>()
			.WithMany()
			.HasForeignKey(x => x.User2Id)
			.OnDelete(DeleteBehavior.Cascade);
			
		builder.HasIndex(x => x.User1Id);
		builder.HasIndex(x => x.User2Id);
	}
}
