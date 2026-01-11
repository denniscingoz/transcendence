using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain;

public sealed class UserFollowConfiguration : IEntityTypeConfiguration<UserFollow>
{
    public void Configure(EntityTypeBuilder<UserFollow> builder)
    {
        builder.ToTable("user_follows"); //table of connections
        builder.HasKey(x => new { x.FollowerId, x.FollowingId }); //composite key
        builder.HasIndex(x => x.FollowerId); // for quick search by
        builder.HasIndex(x => x.FollowingId); // for quick searchby

        
    }
}
