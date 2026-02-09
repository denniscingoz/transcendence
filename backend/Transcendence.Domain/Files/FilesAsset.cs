namespace Transcendence.Domain.Files;
public sealed class FilesAsset
{
	public Guid Id { get; private set; }
	public Guid OwnerId { get; private set; }
	public string StoragePath { get; private set; }
	public string ContentType { get; private set; }
	public long SizeBytes { get; private set; }
	public DateTime UploadedAtUtc { get; private set; }

#pragma warning disable CS8618
	private FilesAsset() { }
#pragma warning restore CS8618
	public FilesAsset(Guid id, Guid ownerId, string storagePath, string contentType, long sizeBytes)
	{
		if (id == Guid.Empty) throw new ArgumentException("Id is required.", nameof(id));
		if (ownerId == Guid.Empty) throw new ArgumentException("OwnerId is required.", nameof(ownerId));
		if (string.IsNullOrWhiteSpace(storagePath)) throw new ArgumentException("StoragePath is required.", nameof(storagePath));
		if (string.IsNullOrWhiteSpace(contentType)) throw new ArgumentException("ContentType is required.", nameof(contentType));
		if (sizeBytes <= 0) throw new ArgumentException("SizeBytes cannot be negative.", nameof(sizeBytes));
		Id = id;
		OwnerId = ownerId;
		StoragePath = storagePath;
		ContentType = contentType;
		SizeBytes = sizeBytes;
		UploadedAtUtc = DateTime.UtcNow;
	}

}
