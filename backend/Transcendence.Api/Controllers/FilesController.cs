using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Reflection.Metadata;
using Transcendence.Api.Common.Extensions;
using Transcendence.Application.Common.Responses;
using Transcendence.Application.Files.Dto;
using Transcendence.Application.Files.Interface;
using Transcendence.Application.Files.Service;


namespace Transcendence.Api.Controllers;

[Authorize]
[ApiController]
[Route("files")]
public sealed class FilesController : ControllerBase
{
	private readonly IFilesService _filesService;
	public FilesController(IFilesService fileService) { _filesService = fileService; }


	//POST /files
	[HttpPost]
	public async Task<ActionResult<ApiResponse<UploadFilesResultDto>>> UploadFile([FromForm] IFormFile file, CancellationToken ct)
	{
		if (file is null || file.Length == 0)
			return BadRequest("File is empty.");
		Guid userId = GetUserId();
		var result = await _filesService.UploadFilesAsync(userId, file, ct);
		return this.OkResponse(result);
	}

	//GET /files/{id}
	[HttpGet("{fileId:guid}")]
	public async Task<IActionResult> GetFile(Guid fileId, CancellationToken ct)
	{
		Guid userId = GetUserId();

		var result = await _filesService.GetFileAsync(userId, fileId, ct);

		return File(result.Stream, result.ContentType, enableRangeProcessing: true);
	}

	//DELETE /files/{id}
	[HttpDelete("{fileId:guid}")]
	public async Task<IActionResult> DeleteFile(Guid fileId, CancellationToken ct)
	{
		Guid userId = GetUserId();
		await _filesService.DeleteFileAsync(userId, fileId, ct);
		return NoContent();
	}

	private Guid GetUserId()
	{
		var value =
			User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
			?? User.FindFirst("sub")?.Value;

		if (value is null || !Guid.TryParse(value, out var userId))
			throw new UnauthorizedAccessException("Invalid token.");

		return userId;
	}
}
