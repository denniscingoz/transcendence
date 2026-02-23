using System.Security.Claims;
using Transcendence.Domain.Exceptions;
namespace Transcendence.Api.Common.Extensions;

public static class ClaimsPrincipalExtensions {

    public static  Guid GetUserId (this ClaimsPrincipal user)
    {
        var claim = user.FindFirst("sub")?.Value ??  // Retrieves the first claim that matches a specified condition
                    user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (Guid.TryParse(claim , out Guid id))
            return id;
        throw new Transcendence.Domain.Exceptions.UnauthorizedAccessException("Unauthorized");
    } 
    
    public static Guid? TryGetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirst("sub")?.Value ?? 
                     user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        
        return  Guid.TryParse(claim, out var id) ? id : null; 
    }
}

/*
    ClaimsPrincipal
    └─ Identities = List<ClaimsIdentity>

    ClaimsIdentity
    ├─ AuthenticationType = "Bearer"
    ├─ IsAuthenticated = true
    └─ Claims = List<Claim>
    
    Claim
    {
        Type  : string,
        Value : string
    }

    Type  = "sub"
    Value = "550e8400-e29b-41d4-a716-446655440000"
    or
    Type  = ClaimTypes.NameIdentifier
    Value = "550e8400-e29b-41d4-a716-446655440000"

    bool success = Guid.TryParse(stringValue, out Guid result);

    ClaimsPrincipal — контейнер
    Claim — пара type/value
    ClaimTypes.NameIdentifier — строка-ключ
    Value — всегда string
    Guid.TryParse — проверка и преобразование
    Extension — адаптер между стандартами
*/