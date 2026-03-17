using Transcendence.Application.Files.Interface;
using Transcendence.Domain.Files;

namespace Transcendence.Infrastructure.Repositories;
public sealed class FilesRepository : IFilesRepository
{
	public async Task<FilesAsset?> GetByIdAsync(Guid id, CancellationToken ct){throw new NotImplementedException(); }
	public async Task AddAsync(FilesAsset asset, CancellationToken ct) {throw new NotImplementedException(); }
	public async Task SaveChangesAsync(CancellationToken ct)				  { throw new NotImplementedException(); }
	public void Remove(FilesAsset asset)
	{
		throw new NotImplementedException();
	}

}
