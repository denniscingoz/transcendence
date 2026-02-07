using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace Transcendence.Api.Realtime;

public static class RealtimeEndpoints
{
    public static IEndpointRouteBuilder MapChatEndpoints(this IEndpointRouteBuilder app) // ext app.MapChatEndpoints();*
    {
        app.MapHub<ChatHub>("/hubs/chat"); // when client connects to /ws/chat serve it through ChatHub class
        app.MapHub<PresenceHub>("/hubs/presence");
        return app;
    }
}
