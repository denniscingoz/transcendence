using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Transcendence.Application.Files.Interface;

namespace Transcendence.Infrastructure.Storage;

public class FilesStorage : IFilesStorage
{
    private readonly string _rootPath;

    public FilesStorage()
    {
        _rootPath =
            Environment.GetEnvironmentVariable("STORAGE_ROOT_PATH")
            ?? Path.Combine(AppContext.BaseDirectory, "storage");

        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> SaveAsync(Guid fileId, Stream content, string contentType, CancellationToken ct)
	{
	    ct.ThrowIfCancellationRequested();

	    Directory.CreateDirectory(_rootPath);

	    var extension = contentType switch
	    {
	        "image/jpeg" => ".jpg",
	        "image/png" => ".png",
	        "image/webp" => ".webp",
            "video/mp4" => ".mp4",
            "video/webm" => ".webm",
            "video/quicktime" => ".mov",
			// "image/gif" => ".gif",
			_ => throw new InvalidOperationException("Unsupported file content type.")
	    };

	    var fileName = $"{fileId:N}{extension}";
	    var relativePath = fileName;
	    var fullPath = GetSafeFullPath(relativePath);

	    await using var output = new FileStream(
	        fullPath,
	        FileMode.Create,
	        FileAccess.Write,
	        FileShare.None,
	        bufferSize: 81920,
	        useAsync: true);

	    await content.CopyToAsync(output, ct);

	    return relativePath.Replace('\\', '/');
	}

    public Task<Stream> OpenReadAsync(string storageKeyOrPath, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        var fullPath = GetSafeFullPath(storageKeyOrPath);

        if (!File.Exists(fullPath))
            throw new FileNotFoundException("Stored file was not found.", fullPath);

        Stream stream = new FileStream(
            fullPath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read,
            bufferSize: 81920,
            useAsync: true);

        return Task.FromResult(stream);
    }

    public Task DeleteAsync(string storageKeyOrPath, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        var fullPath = GetSafeFullPath(storageKeyOrPath);

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }

    private string GetSafeFullPath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            throw new ArgumentException("Storage path is required.", nameof(relativePath));

        var normalizedRelativePath = relativePath.Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(_rootPath, normalizedRelativePath));
        var rootFullPath = Path.GetFullPath(_rootPath);

        if (!fullPath.StartsWith(rootFullPath, StringComparison.Ordinal))
            throw new InvalidOperationException("Invalid storage path.");

        return fullPath;
    }
}