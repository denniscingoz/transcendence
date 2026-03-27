using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Transcendence.Application.Common.Responses;
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
                    ForbiddenException  => StatusCodes.Status403Forbidden,
                    NotFoundException  => StatusCodes.Status404NotFound,
                    Transcendence.Domain.Exceptions.UnauthorizedAccessException => StatusCodes.Status401Unauthorized,                    _                  => StatusCodes.Status500InternalServerError
                };

                var response = ApiResponse<object>.Fail(
                    exception?.Message ?? "Unknown error"
                );

                context.Response.StatusCode = statusCode;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsync(
                    JsonSerializer.Serialize(response)
                );
            });
        });

        return app;
    }
}


/*
var errorBranch = app.New(); // создаётся новый builder

configure(errorBranch); // ты настраиваешь errorApp

var errorDelegate = errorBranch.Build();

app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch
    {
        await errorDelegate(context); // переключение на error pipeline
    }
});
*/



 