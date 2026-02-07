using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Chat;

public class MessageConfiguration: IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.HasKey(m => m.Id);

        builder.HasIndex(m => new{m.SenderId, m.ClientMessageId}).IsUnique();
        
        builder.Property(m => m.CreatedAt).IsRequired() ;

        builder.Property(m => m.Content).IsRequired().HasMaxLength(4000);



    }
}