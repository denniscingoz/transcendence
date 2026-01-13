using Microsoft.EntityFrameworkCore;
using Transcendence.Domain.UserFollows;
using Transcendence.Domain.Users;
using Transcendence.Domain.Posts;

namespace Transcendence.Infrastructure.Persistence;


public class TranscendenceDbContext: DbContext
{
     public TranscendenceDbContext( 
          DbContextOptions<TranscendenceDbContext> options) : base (options){}
     public DbSet<User> Users => Set<User>();
     public DbSet<UserFollow> UserFollows => Set<UserFollow>();
     public DbSet<Post> Posts => Set<Post>();


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
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(TranscendenceDbContext).Assembly);
    }
}