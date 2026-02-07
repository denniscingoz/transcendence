using System.ComponentModel;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Realtime.Contracts;

namespace  Transcendence.Api.Realtime.Hubs;

public  sealed class PresenceHub : BaseHub<IRealtimeClient>
{
    public override async Task OnConnectedAsync()
    {
        var userId = GetUserIdOrThrow();
        await Group.AddToGroupAsync(Context.ConnectionId, GroupNames.User(userId));

        var presence = new PresenceEventDto
        {
            userId = userId,
            IsOnline = true,
            ChangedAt = DateTimeOffset.UtcNow
        };
        
        await Clients.All.UserOnLine(presence);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {

        var userId = TryGetUserId();
        if  (userId is not null)
        {
            await Group.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.User(userId));
            var presence = new PresenceEventDto
            {
                userId = userId,
                IsOnline = false,
                ChangedAt = DateTimeOffset.UtcNow
            };
            await Clients.All.UserOffline(presence);
        }

        await base.OnDisconnectedAsync(exception); //  correct cleanup
    }

    /*
        Почему не бросают throw здесь
        OnDisconnectedAsync — это notification, а не операция
        соединение уже мертво. ничего “починить” нельзя.
        throw ничего не изменит

        Поэтому: exception передаётся (для логирования
            для аналитики нестабильных клиентов
            для отладки reconnect’ов
            НЕ для бизнес-логики
        )но не пробрасывается
    */
}
