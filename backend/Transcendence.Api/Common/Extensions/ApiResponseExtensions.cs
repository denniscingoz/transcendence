using System.ComponentModel;
using Microsoft.AspNetCore.Mvc;
using Transcendence.Application.Common.Responses;

namespace Transcendence.Api.Common.Extensions;

public static class ApiResponseExtensions
{
    //// Creates a standard successful API response.
    public static ActionResult<ApiResponse<T>> OkResponse<T>(
        this ControllerBase controller,
        T data)
    {
          // Returns HTTP 200 with ApiResponse.Success(data).
        return controller.Ok(ApiResponse<T>.Success(data));
    }

     // Creates a standard failed API response.
    public static ActionResult<ApiResponse<T>> FailResponse<T> (
        this ControllerBase controller, IReadOnlyList<string> errors)
    {
        //returns HTTP 400 with ApiResponse.Fail(errors)
        return controller.BadRequest(ApiResponse<T>.Fail(errors.ToArray()));
    }
}
