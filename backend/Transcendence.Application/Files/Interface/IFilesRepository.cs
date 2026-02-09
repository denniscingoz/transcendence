using Transcendence.Domain.Files;

namespace Transcendence.Application.Files.Interface;
public interface IFilesRepository
{
	Task AddAsync(FilesAsset asset, CancellationToken ct);
	Task<FilesAsset?> GetByIdAsync(Guid id, CancellationToken ct);
	Task SaveChangesAsync(CancellationToken ct);
	void Remove(FilesAsset asset);

}
