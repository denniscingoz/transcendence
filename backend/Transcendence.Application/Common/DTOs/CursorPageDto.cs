namespace Transcendence.Application.Common.DTOs;

public sealed class CursorPageDto<T>
{
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    public string? NextCursor { get; init; }
}