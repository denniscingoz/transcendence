using Microsoft.AspNetCore.Mvc;
using Transcendence.Application.Common.Responses;

namespace Transcendence.Api.Common.Extensions;

public static class ApiResponseExtensions
{
    //
    public static ActionResult<ApiResponse<T>> OkResponse<T>(
        this ControllerBase controller,
        T data)
    {
        return controller.Ok(ApiResponse<T>.Success(data));
    }
}
