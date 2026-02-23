using System.ComponentModel;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using Transcendence.Application.Chat.DTOs;
using Transcendence.Application.Realtime.Contracts;
using Transcendence.Api.Common.Extensions;
 

namespace  Transcendence.Api.Realtime.Hubs;

public  sealed class PresenceHub : BaseHub<IRealtimeClient>
{
    public override async Task OnConnectedAsync()
    {
        var userId =  Context.User.GetUserId();
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupNames.User(userId));

        var presence = new PresenceEventDto
        {
            UserId = userId,
            IsOnline = true,
            ChangedAt = DateTimeOffset.UtcNow
        };
        
        await Clients.All.UserOnLine(presence);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {

        if  (Context.User.TryGetUserId() is Guid userId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupNames.User(userId));
            var presence = new PresenceEventDto
            {
                UserId = userId,
                IsOnline = false,
                ChangedAt = DateTimeOffset.UtcNow
            };
            await Clients.All.UserOffLine(presence);
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
