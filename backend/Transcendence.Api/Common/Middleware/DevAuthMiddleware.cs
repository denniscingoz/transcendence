using System.Net;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Transcendence.Api.Common.Middelware;
public class DevAuthMiddleware
{
    private readonly RequestDelegate _next;

    public DevAuthMiddleware (RequestDelegate next)
    {
        _next = next; //delegate Task RequestDelegate(HttpContext context);
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            await _next(context);
            return;
        }

        string userId = context.Request.Query["userId"];

        if (string.IsNullOrEmpty(userId))
            userId = context.Request.Headers["X-Dev-UserId"].FirstOrDefault();

        if (string.IsNullOrEmpty(userId))
            userId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
        var claims = new List<Claim>
        {
            new Claim("sub", userId),
            new Claim(ClaimTypes.NameIdentifier, userId)
        };
        var identity = new ClaimsIdentity(claims, authenticationType: "Dev");
        context.User = new ClaimsPrincipal(identity);
        Console.WriteLine("DevAuth userId = " + userId);
        await _next(context);
    }
}
