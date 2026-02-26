using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Friends;

namespace Transcendence.Infrastructure.Persistence.Configurations;

public sealed class FriendshipRequestConfiguration : IEntityTypeConfiguration<FriendshipRequest>
{
    public void Configure(EntityTypeBuilder<FriendshipRequest> builder)
    {
        builder.ToTable("FriendshipRequests");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        // Prevent duplicate requests between same pair
        builder.HasIndex(x => new { x.RequesterId, x.TargetUserId })
            .IsUnique();
    }
}
