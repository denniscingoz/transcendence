// persistent storage
using Microsoft.EntityFrameworkCore;

using Transcendence.Domain.Users;
using Transcendence.Domain.Posts;
using Transcendence.Domain.Friends;
using Transcendence.Domain.Files;
using Transcendence.Domain.Chat;

namespace Transcendence.Infrastructure.Persistence;

public class TranscendenceDbContext: DbContext
{
    public TranscendenceDbContext(
        DbContextOptions<TranscendenceDbContext> options) : base(options) { }

    // Core entities
    public DbSet<User> Users => Set<User>();
    public DbSet<Post> Posts => Set<Post>();

    // Friends
    public DbSet<FriendshipRequest> FriendshipRequests => Set<FriendshipRequest>();
    public DbSet<Friendship> Friendships => Set<Friendship>();

    // Social
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Like> Likes => Set<Like>();

    // Files
    public DbSet<FilesAsset> Files => Set<FilesAsset>();

    // Chat
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationParticipant> ConversationParticipants => Set<ConversationParticipant>();
    public DbSet<Message> Messages => Set<Message>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("app");

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(TranscendenceDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}