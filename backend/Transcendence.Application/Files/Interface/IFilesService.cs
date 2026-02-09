using Microsoft.AspNetCore.Http;
using Transcendence.Application.Files.Dto;
using Transcendence.Application.Files;
using Transcendence.Application.Files.Results;


namespace Transcendence.Application.Files.Interface;
public interface IFilesService
{
	Task<UploadFilesResultDto> UploadFilesAsync(Guid userId, IFormFile file, CancellationToken ct);
	Task<FileGetResult> GetFileAsync(Guid requesterId, Guid fileId, CancellationToken ct);
	Task DeleteFileAsync(Guid requesterId, Guid fileId, CancellationToken ct);
}

