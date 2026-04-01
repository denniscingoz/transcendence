using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Transcendence.Infrastructure.Persistence;

public class TranscendenceDbContextFactory
    : IDesignTimeDbContextFactory<TranscendenceDbContext>
{
    public TranscendenceDbContext CreateDbContext(string[] args)
{
    var configuration = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: false)
        .Build();

    var optionsBuilder = new DbContextOptionsBuilder<TranscendenceDbContext>();

    optionsBuilder.UseNpgsql(
        configuration.GetConnectionString("DefaultConnection"));

    return new TranscendenceDbContext(optionsBuilder.Options);
}
}