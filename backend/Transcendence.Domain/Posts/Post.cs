using System.Xml.Linq;

namespace Transcendence.Domain.Posts;

public sealed class Post
{
	public Guid Id { get; private set; }
	public Guid AuthorId { get; private set; }

	// Image is mandatory, so we store the file reference (not the URL because reference can be turned into URL!!!!).
	public Guid ImageFileId { get; private set; }

	// Content can be empty or null (image-only post).
	public string? Content { get; private set; }

	public DateTime CreatedAtUtc { get; private set; }
	public DateTime? UpdatedAtUtc { get; private set; }
#pragma warning disable CS8618
	private Post() { } // EF Core
#pragma warning disable CS8618

	public Post(Guid id, Guid authorId, Guid imageFileId, string? content)
	{
		if (id == Guid.Empty) throw new ArgumentException("Id is required.", nameof(id));
		if (authorId == Guid.Empty) throw new ArgumentException("AuthorId is required.", nameof(authorId));
		if (imageFileId == Guid.Empty) throw new ArgumentException("ImageFileId is required.", nameof(imageFileId));

		Id = id;
		AuthorId = authorId;
		ImageFileId = imageFileId;
		Content = content;
		CreatedAtUtc = DateTime.UtcNow;
	}

	public void UpdateContent(string? content)
	{
		Content = content;
		UpdatedAtUtc = DateTime.UtcNow;
	}

	public void ChangeImage(Guid newImageFileId)
	{
		if (newImageFileId == Guid.Empty) throw new ArgumentException("ImageFileId is required.", nameof(newImageFileId));
		ImageFileId = newImageFileId;
		UpdatedAtUtc = DateTime.UtcNow;
	}
}
