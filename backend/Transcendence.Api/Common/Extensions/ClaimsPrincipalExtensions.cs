using System.Security.Claims;

namespace Transcendence.Api.Common.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var claim =
            user.FindFirst("sub")?.Value ??
            user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (Guid.TryParse(claim, out var id))
            return id;

        throw new UnauthorizedAccessException("Unauthorized");
    }

    public static Guid? TryGetUserId(this ClaimsPrincipal user)
    {
        var claim =
            user.FindFirst("sub")?.Value ??
            user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(claim, out var id) ? id : null;
    }
}