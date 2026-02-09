using Microsoft.AspNetCore.Http;

namespace Transcendence.Application.Files.Interface;
public interface IFilesStorage
{
	//SaveAsync(fileId, stream, ct) -> storageKeyOrPath
	Task<string> SaveAsync(Guid fileId, Stream content, CancellationToken ct);

	//OpenReadAsync(storageKeyOrPath, ct) -> stream
	Task<Stream> OpenReadAsync(string storageKeyOrPath, CancellationToken ct);

	Task DeleteAsync(string storageKeyOrPath, CancellationToken ct);
}

