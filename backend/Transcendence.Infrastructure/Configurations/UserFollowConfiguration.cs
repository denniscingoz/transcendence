using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.UserFollows;

public sealed class UserFollowConfiguration : IEntityTypeConfiguration<Friendship>
{
    public void Configure(EntityTypeBuilder<Friendship> builder)
    {
        builder.ToTable("user_follows"); //table of connections
        builder.HasKey(x => new { x.FollowerId, x.FollowingId }); //composite key
        builder.HasIndex(x => x.FollowerId); // for quick search by
        builder.HasIndex(x => x.FollowingId); // for quick searchby

        
    }
}
