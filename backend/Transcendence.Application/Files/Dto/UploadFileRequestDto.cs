using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Transcendence.Application.Files.Dto;
public sealed class UploadFileRequestDto
{
	[FromForm(Name = "file")]
	public IFormFile File { get; set; } = default!;
}
