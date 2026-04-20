using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Transcendence.Application.Common.Exceptions;
using Transcendence.Domain.Exceptions;


namespace Transcendence.Api.Common.Extensions;

public static class ExceptionHandlingExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
    {
        app.UseExceptionHandler(errorApp => //  UseExceptionHandler(IApplicationBuilder);
        {
			errorApp.Run(async context =>
			{
				var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
				var exception = exceptionFeature?.Error;

				var statusCode = exception switch
				{
					DomainValidationException => StatusCodes.Status400BadRequest,
					UnauthorizedException => StatusCodes.Status401Unauthorized,
					ForbiddenException => StatusCodes.Status403Forbidden,
					NotFoundException => StatusCodes.Status404NotFound,
					ConflictException => StatusCodes.Status409Conflict,
					_ => StatusCodes.Status500InternalServerError
				};

				var problem = new ProblemDetails
				{
					Status = statusCode,
					Title = ReasonPhrases.GetReasonPhrase(statusCode),
					Detail = exception?.Message
				};

				context.Response.StatusCode = statusCode;
				context.Response.ContentType = "application/problem+json";
				await context.Response.WriteAsJsonAsync(problem);
			});
		});

        return app;
    }
}

