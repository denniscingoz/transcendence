using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Chat;

public class ConversationParticipantConfiguration : IEntityTypeConfiguration<ConversationParticipant>
{
    public void Configure(EntityTypeBuilder<ConversationParticipant> builder)
    {
        builder.HasKey(cp => new {cp.ConversationId, cp.UserId});
        //One user can participate in one conversation only once.
        //this is expressed as (ConversationId, UserId) must be unique
    }
}