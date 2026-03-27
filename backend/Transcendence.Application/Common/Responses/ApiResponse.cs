namespace Transcendence.Application.Common.Responses;


public sealed class ApiResponse<T>
{
    public bool IsSuccess { get; }
    public T? Data { get; }
    public IReadOnlyList<string> Errors { get; }

    private ApiResponse(bool success, T? data, IEnumerable<string>? errors)
    {
        IsSuccess = success;
        Data = data;
        Errors = errors?.ToArray() ?? Array.Empty<string>();
    }

    public static ApiResponse<T> Success(T data)
        => new(true, data, null);

    public static ApiResponse<T> Fail(params string[] errors)
        => new(false, default, errors);
}