// using Microsoft.EntityFrameworkCore;
// using Microsoft.EntityFrameworkCore.Design;
// using Microsoft.Extensions.Configuration;

// namespace Transcendence.Infrastructure.Persistence;

// public class TranscendenceDbContextFactory
// 	: IDesignTimeDbContextFactory<TranscendenceDbContext>//This class knows how to create TranscendenceDbContext for EF Core tools
// {
// 	public TranscendenceDbContext CreateDbContext(string[] args)
// {
// 	var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

// 		if (string.IsNullOrWhiteSpace(connectionString))
// 		{
// 			throw new InvalidOperationException(
// 				"ConnectionStrings__DefaultConnection is not set.");
// 		}
// 	// var configuration = new ConfigurationBuilder()
// 	// 	.SetBasePath(Directory.GetCurrentDirectory())//Load configuration from appsettings.json in the current folder
// 	// 	.AddJsonFile("appsettings.json", optional: false)
// 	// 	.Build();

// 	var optionsBuilder = new DbContextOptionsBuilder<TranscendenceDbContext>();

// 	//optionsBuilder.UseNpgsql(
// 	//	configuration.GetConnectionString("DefaultConnection"));//Use PostgreSQL and the DefaultConnection connection string
// 	optionsBuilder.UseNpgsql(connectionString);

// 	return new TranscendenceDbContext(optionsBuilder.Options);//Create the DbContext using those DB options
// }
// }
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
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString =
            configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection is not set.");
        }

        var optionsBuilder =
            new DbContextOptionsBuilder<TranscendenceDbContext>();

        optionsBuilder.UseNpgsql(connectionString);

        return new TranscendenceDbContext(optionsBuilder.Options);
    }
}