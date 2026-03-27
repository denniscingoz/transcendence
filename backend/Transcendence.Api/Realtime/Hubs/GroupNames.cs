namespace Transcendence.Api.Realtime.Hubs;

internal static class GroupNames
{
    public static string Conversation(Guid conversationId)
        => $"conv:{conversationId}";

    public static string User(Guid userId)
        => $"user:{userId}";
}
