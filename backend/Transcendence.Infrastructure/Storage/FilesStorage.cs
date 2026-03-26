using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Transcendence.Application.Files.Interface;

namespace Transcendence.Infrastructure.Storage;
public class FilesStorage : IFilesStorage
{
	private readonly string _rootPath;
	
	public FilesStorage()
	{
		_rootPath = Path.Combine(Directory.GetCurrentDirectory(), "storage");
	}
	
	public async Task<string> SaveAsync(Guid fileId, Stream content, CancellationToken ct)
	{ 
		// save file to storage and return storageKeyOrPath
		throw new NotImplementedException();
		// var uploadsDir = Path.Combine(_rootPath, "uploads");
		// Directory.CreateDirectory(uploadsDir);

		// var relativePath = Path.Combine("uploads", fileId.ToString());
		// var fullPath = Path.Combine(_rootPath, relativePath);

		// await using var output = new FileStream(
		//     fullPath,
		//     FileMode.Create,
		//     FileAccess.Write,
		//     FileShare.None,
		//     bufferSize: 81920,
		//     useAsync: true);

		// await content.CopyToAsync(output, ct);

		// return relativePath.Replace('\\', '/');
	}
	public async Task<Stream> OpenReadAsync(string storageKeyOrPath, CancellationToken ct)
	{ 
		// open file from storage and return stream
		throw new NotImplementedException();
		// ct.ThrowIfCancellationRequested();

		// var fullPath = Path.Combine(_rootPath, storageKeyOrPath);

		// if (!File.Exists(fullPath))
		//     throw new FileNotFoundException("Stored file was not found.", fullPath);

		// Stream stream = new FileStream(
		//     fullPath,
		//     FileMode.Open,
		//     FileAccess.Read,
		//     FileShare.Read,
		//     bufferSize: 81920,
		//     useAsync: true);

		// return Task.FromResult(stream);
	}
	public async Task DeleteAsync(string storageKeyOrPath, CancellationToken ct)
	{ 
		// delete file from storage
		throw new NotImplementedException();
		// ct.ThrowIfCancellationRequested();

		// var fullPath = Path.Combine(_rootPath, storageKeyOrPath);

		// if (File.Exists(fullPath))
		//     File.Delete(fullPath);

		// return Task.CompletedTask;
	}
}
