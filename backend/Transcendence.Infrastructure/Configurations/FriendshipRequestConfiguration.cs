using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Friends;
using Transcendence.Domain.Users;

namespace Transcendence.Infrastructure.Configurations;

public sealed class FriendshipRequestConfiguration : IEntityTypeConfiguration<FriendshipRequest>
{
	public void Configure(EntityTypeBuilder<FriendshipRequest> builder)
	{
		builder.ToTable("FriendshipRequests", t =>
		{
			t.HasCheckConstraint(
				"CK_friendship_request_different_users",
				"(\"RequesterId\" <> \"TargetUserId\")"
			);
		});

		builder.HasKey(x => x.Id);

		builder.Property(x => x.CreatedAt)
			.IsRequired();
			
		builder.Property(x => x.User1Id)
			.IsRequired();

		builder.Property(x => x.User2Id)
			.IsRequired();
			
		builder.HasOne<User>()
			.WithMany()
			.HasForeignKey(x => x.RequesterId)
			.OnDelete(DeleteBehavior.Cascade);
			
		builder.HasOne<User>()
			.WithMany()
			.HasForeignKey(x => x.TargetUserId)
			.OnDelete(DeleteBehavior.Cascade);
		// Prevent both A->B and B->A existing at the same time.
		builder.HasIndex(x => new { x.User1Id, x.User2Id })
			.IsUnique();
		builder.HasIndex(x => x.TargetUserId);
		builder.HasIndex(x => x.RequesterId);
	}
}
