using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Notifications;
using Transcendence.Domain.Users;
using Transcendence.Domain.Chat;
using Transcendence.Domain.Friends;

namespace Transcendence.Infrastructure.Configurations;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(n => n.Id);

        builder.Property(n => n.Text)
            .IsRequired();

        builder.Property(n => n.CreatedAt)
            .IsRequired();

        builder.Property(n => n.Type)
            .IsRequired();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(n => n.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<Conversation>()
            .WithMany()
            .HasForeignKey(n => n.RelatedConversationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne<FriendshipRequest>()
            .WithMany()
            .HasForeignKey(n => n.RelatedRequestId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}