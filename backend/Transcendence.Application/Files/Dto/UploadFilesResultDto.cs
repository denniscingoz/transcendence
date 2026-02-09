namespace Transcendence.Application.Files.Dto;
public sealed class UploadFilesResultDto
{
	public Guid FileId { get; init; }
	public string Url { get; init; }
	public UploadFilesResultDto(Guid fileId, string url)
	{
		if (string.IsNullOrWhiteSpace(url))
			throw new ArgumentException("URL cannot be null or empty.", nameof(url));
		if (fileId == Guid.Empty)
			throw new ArgumentException("FileId is required.", nameof(fileId));
		FileId = fileId;
		Url = url;
	}

}
