namespace Transcendence.Application.Files.Results;

public sealed class FileGetResult
{
	public string ContentType { get; }
	public Stream Stream { get; }

	public FileGetResult(Stream stream, string contentType)
	{
		Stream = stream ?? throw new ArgumentNullException(nameof(stream));
		ContentType = string.IsNullOrWhiteSpace(contentType)
			? throw new ArgumentException("ContentType is required.", nameof(contentType))
			: contentType;
	}
}
