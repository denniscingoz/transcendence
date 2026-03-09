//persistent storage
using Microsoft.EntityFrameworkCore;
using Transcendence.Domain.Friends;
using Transcendence.Domain.Friends;
using Transcendence.Domain.Users;
using Transcendence.Domain.Posts;

namespace Transcendence.Infrastructure.Persistence;


public class TranscendenceDbContext: DbContext
{
     public TranscendenceDbContext( 
          DbContextOptions<TranscendenceDbContext> options) : base (options){}
     public DbSet<User> Users => Set<User>();
     //public DbSet<Friends> UserFollows => Set<Friends>();
     public DbSet<Post> Posts => Set<Post>();
     public DbSet<FriendshipRequest> FriendshipRequests => Set<FriendshipRequest>();
     public DbSet<Friendship> Friendships => Set<Friendship>();


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
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(TranscendenceDbContext).Assembly);// uses all IEntityTypeConfiguration<>
     base.OnModelCreating(modelBuilder); //calls the DbContext’s default configuration // if later you add features that rely on base behavior (common example: ASP.NET Identity), skipping it can break conventions and mappings.
    }
}

// DbContext responsibilities
// Knows which entities exist (DbSet<User>, DbSet<Post>, …)
// Knows how to connect to DB (through options)
// Applies mapping rules (OnModelCreating)
// Creates SQL when you query and saves changes when you call SaveChanges()