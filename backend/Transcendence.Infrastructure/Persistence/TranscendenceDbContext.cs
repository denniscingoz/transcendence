//persistent storage
using Microsoft.EntityFrameworkCore;
using Transcendence.Domain.Friends;
using Transcendence.Domain.Users;
using Transcendence.Domain.Posts;
<<<<<<< HEAD
using Transcendence.Domain.Files;
=======
using Transcendence.Domain.Chat;

>>>>>>> 5178767 (chat main things)

namespace Transcendence.Infrastructure.Persistence;


public class TranscendenceDbContext: DbContext
{
<<<<<<< HEAD
	public TranscendenceDbContext( 
		DbContextOptions<TranscendenceDbContext> options) : base (options){} //allows DI to provide database config, like: PostgreSQL connection, SQLite connection, SQL Server connection
	public DbSet<User> Users => Set<User>();
	public DbSet<Post> Posts => Set<Post>();
	public DbSet<FriendshipRequest> FriendshipRequests => Set<FriendshipRequest>();
	public DbSet<Friendship> Friendships => Set<Friendship>();
	
	public DbSet<Comment> Comments => Set<Comment>();
	public DbSet<Like> Likes => Set<Like>();
	
	public DbSet<FilesAsset> Files => Set<FilesAsset>();


	/*
	public DbSet<User> Users // коллекция ползователй из БД
	{
		get
		{
			return Set<User>(); // Сет - метод возращающий всю коллекцибю юзеров
		}
	} */
	 protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		modelBuilder.HasDefaultSchema("app"); // tells EF: put tables into app schema
		modelBuilder.ApplyConfigurationsFromAssembly(typeof(TranscendenceDbContext).Assembly);//Find all classes in this assembly that implement IEntityTypeConfiguration<T> and apply them automatically. Not manually modelBuilder.ApplyConfiguration(new UserConfiguration());
		base.OnModelCreating(modelBuilder); //calls the DbContext’s default configuration // if later you add features that rely on base behavior (common example: ASP.NET Identity), skipping it can break conventions and mappings.
	}
}

// DbContext responsibilities
// Knows which entities exist (DbSet<User>, DbSet<Post>, …)
// Knows how to connect to DB (through options)
// Applies mapping rules (OnModelCreating)
// Creates SQL when you query and saves changes when you call SaveChanges()
=======
     public TranscendenceDbContext( 
          DbContextOptions<TranscendenceDbContext> options) : base (options){}
     public DbSet<User> Users => Set<User>();
     public DbSet<UserFollow> UserFollows => Set<UserFollow>();
     public DbSet<Post> Posts => Set<Post>();
     public DbSet<Conversation> Conversations => Set<Conversation>();
     public DbSet<ConversationParticipant> ConversationParticipants => Set<ConversationParticipant>();
     public DbSet<Message> Messages => Set<Message>();

     protected override void OnModelCreating(ModelBuilder modelBuilder) // finds all classes that implement IEntityTypeCOnfiguration<T>
     {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(TranscendenceDbContext).Assembly);
     }
}
>>>>>>> 5178767 (chat main things)
