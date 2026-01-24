using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace Transcendence.Api.Chat;

public static class ChatEndpoints
{
    public static IEndpointRouteBuilder MapChatEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapHub<ChatHub>("/ws/chat"); // when client connects to /ws/chat serve it through ChatHub class
        return app;
    }
}
