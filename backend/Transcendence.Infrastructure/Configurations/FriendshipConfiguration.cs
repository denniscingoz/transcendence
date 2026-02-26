using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Friends;

namespace Transcendence.Infrastructure.Persistence.Configurations;

public sealed class FriendshipConfiguration : IEntityTypeConfiguration<Friendship>
{
    public void Configure(EntityTypeBuilder<Friendship> builder)
    {
        builder.ToTable("Friendships");

        // Composite primary key: prevents duplicates naturally.
        builder.HasKey(x => new { x.User1Id, x.User2Id });

        builder.Property(x => x.CreatedAt)
            .IsRequired();
    }
}
