using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Transcendence.Domain.Chat;

public class MessageConfiguration: IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        // PRIMARY KEY
        // A Primary Key is a column (or set of columns) that uniquely identifies
        // each row in a table. It cannot be NULL and must be unique.
        // The database automatically creates an index for the primary key.
        builder.HasKey(m => m.Id);


        // UNIQUE COMPOSITE INDEX
        
        // A Unique Index enforces uniqueness of values (or combinations of values)
        // across rows and also improves query performance.
        // Unlike a Primary Key, it does not identify the row itself,
        // but enforces a business rule.
        //
        // In this model:
        // The combination (SenderId, ClientMessageId) must be unique.
        // This means the same sender cannot create two messages
        // with the same client-generated message ID.
        //
        // Purpose:
        // - Enforces a business constraint at the database level
        // - Prevents duplicate messages (e.g. caused by retries or network issues)
        // - Allows fast lookups by SenderId and ClientMessageId
        //
        // Note:
        // Id is the technical primary key,
        // while (SenderId, ClientMessageId) represents business-level uniqueness.
        builder.HasIndex(m => new{m.SenderId, m.ClientMessageId}).IsUnique();
        
        builder.Property(m => m.CreatedAt).IsRequired() ;

        builder.Property(m => m.Content).IsRequired().HasMaxLength(4000);

        builder.HasOne<Conversation>()
                .WithMany()
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);


    }
}