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
				// Gets the exception that was thrown.
				var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
				var exception = exceptionFeature?.Error;
				
				//Mapping specific errors to specific codes so we can understand better in the console.
				var statusCode = exception switch
				{
					DomainValidationException => StatusCodes.Status400BadRequest,
					UnauthorizedException => StatusCodes.Status401Unauthorized,
					ForbiddenException => StatusCodes.Status403Forbidden,
					NotFoundException => StatusCodes.Status404NotFound,
					ConflictException => StatusCodes.Status409Conflict,
					_ => StatusCodes.Status500InternalServerError
				};

				//creating a exception body
				var problem = new ProblemDetails
				{
					Status = statusCode,
					Title = ReasonPhrases.GetReasonPhrase(statusCode),
					Detail = exception?.Message
				};
				
				//Sets the GTTP response status code
				context.Response.StatusCode = statusCode;
				//Tells the client this ia standar ProblemDetials JSON Response
				context.Response.ContentType = "application/problem+json";
				//Sends the response as a Json
				await context.Response.WriteAsJsonAsync(problem);
			});
		});

			//returns the app so it can  be chained in Program.cs
        return app;
    }
}

