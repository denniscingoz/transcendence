using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;

namespace Transcendence.Api.Configurations;

public static class SwaggerConfiguration
{
	public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
	{
		// Allows Swagger to discover API endpoints.
		services.AddEndpointsApiExplorer();

		// Registers and configures Swagger/OpenAPI generation.
		services.AddSwaggerGen(options =>
		{
			// Defines the Swagger document information.
			options.SwaggerDoc("v1", new OpenApiInfo
			{
				Title = "Transcendence.Api",
				Version = "v1"
			});

			// Adds JWT Bearer authentication support to Swagger UI.
			options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
			{
				Name = "Authorization",
				Type = SecuritySchemeType.Http,
				Scheme = "bearer",
				BearerFormat = "JWT",
				In = ParameterLocation.Header,
				Description = "Paste only the JWT token"
			});

			// Applies the Bearer token requirement to protected endpoints.
			options.AddSecurityRequirement(new OpenApiSecurityRequirement
			{
				{
					new OpenApiSecurityScheme
					{
						// References the Bearer security definition above.
						Reference = new OpenApiReference
						{
							Type = ReferenceType.SecurityScheme,
							Id = "Bearer"
						}
					},
					Array.Empty<string>()
				}
			});
		});

		// Returns services so calls can be chained in Program.cs.
		return services;
	}
}