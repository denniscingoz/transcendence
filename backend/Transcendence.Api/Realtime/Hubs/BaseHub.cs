using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Transcendence.Api.Realtime.Hubs;
public abstract class BaseHub<TClient>: Hub<TClient> where TClient : class {
    /*
    protected Guid GetUserIdOrThrow()
    {
        var id  = TryGetUserId();
        if (id is null)
            throw new HubException("Unauthorized");
            return id.Value; /////////
    }

    protected Guid? TryGetUserId()
    {
        // fin: claim "sub" or NameIdentifier
        var claim =
            Context.User?.FindFirst("sub")?.Value ??
            Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (Guid.TryParse(claim, out var userId))
            return userId;

        // temp:
        var http = Context.GetHttpContext();
        var debug = http?.Request.Query["debugUserId"].ToString();
        if (Guid.TryParse(debug, out userId))
            return userId;

        return null;
    }
    */

}

/*
Why BaseHub instead of a static helper class:

We use inheritance (BaseHub) because these methods depend on Hub context
(Context, Claims, ConnectionId), which is part of the SignalR lifecycle.

Using a helper class would require passing HubCallerContext around,
leaking infrastructure details into business logic and breaking boundaries.

BaseHub keeps:
- authentication logic close to the Hub
- access to Context without parameter passing
- a single extension point for all hubs (ChatHub, PresenceHub)

This is the same reason ASP.NET controllers inherit from ControllerBase
instead of using static helper methods with HttpContext.

*/