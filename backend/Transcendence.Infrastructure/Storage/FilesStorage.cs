using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Transcendence.Application.Files.Interface;

namespace Transcendence.Infrastructure.Storage;
public class FilesStorage : IFilesStorage
{
	public async Task<string> SaveAsync(Guid fileId, Stream content, CancellationToken ct) { 
		// save file to storage and return storageKeyOrPath
		throw new NotImplementedException();
	}
	public async Task<Stream> OpenReadAsync(string storageKeyOrPath, CancellationToken ct) { 
		// open file from storage and return stream
		throw new NotImplementedException();
	}
	public async Task DeleteAsync(string storageKeyOrPath, CancellationToken ct) { 
		// delete file from storage
		throw new NotImplementedException();
	}
}
