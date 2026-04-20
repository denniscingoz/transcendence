
using Microsoft.AspNetCore.Http;
using Transcendence.Application.Common.Exceptions;
using Transcendence.Application.Files.Dto;
using Transcendence.Application.Files.Interface;
using Transcendence.Application.Files.Results;
using Transcendence.Application.Friends.Interfaces;
using Transcendence.Application.Posts.Interfaces;
using Transcendence.Application.Users.Interfaces;
using Transcendence.Domain.Files;

namespace Transcendence.Application.Files.Service;

public sealed class FilesService : IFilesService
{
	public IFilesRepository _fileRepository;
	public IFilesStorage _filesStorage;
	public IUserRepository _userRepository;
	public IPostsRepository _postRepository;
	public IFriendshipRepository _friendshipRepository;
	public FilesService(IFilesRepository fileRepository,
						IFilesStorage fileStorage,
						IUserRepository userRepository,
						IPostsRepository postRepository,
						IFriendshipRepository friendshipRepository)
	{
		_fileRepository = fileRepository;
		_filesStorage = fileStorage;
		_userRepository = userRepository;
		_postRepository = postRepository;
		_friendshipRepository = friendshipRepository;
	}

	// POST /files
	public async Task<UploadFilesResultDto> UploadFilesAsync(Guid userId, IFormFile file, CancellationToken ct)
	{
		const long maxBytes = 10 * 1024 * 1024; // 10 MB
		if (file.Length > maxBytes) throw new ArgumentException("File is too large (max 10 MB).", nameof(file));

		var contentType = (file.ContentType ?? "").Trim().ToLowerInvariant();
		if (contentType is not ("image/jpg" or "image/png" or "image/jpeg" or "image/webp" or "video/mp4" or "video/webm" or "video/quicktime"))
			throw new ArgumentException("Unsupported file type. Allowed: png, jpg, jpeg, webp, mp4, webm, quicktime.", nameof(file));

		// Verifying magic bytes match the claimed type.
		await using (var sniff = file.OpenReadStream())
		{
			if (!await MatchesMagicBytesAsync(sniff, contentType, ct))
				throw new ArgumentException("File content does not match its type.", nameof(file));
		}

		var fileId = Guid.NewGuid();
		// Store bytes (disk/object storage) and get back a storage key/path.
		string storageKeyOrPath;
		await using (var input = file.OpenReadStream())
		{
			storageKeyOrPath = await _filesStorage.SaveAsync(fileId, input, contentType, ct);
		}
		// Persist metadata (DB)i
		var asset = new FilesAsset(
			id: fileId,
			ownerId: userId,
			storagePath: storageKeyOrPath,
			contentType: contentType,
			sizeBytes: file.Length
		);

		await _fileRepository.AddAsync(asset, ct);
		await _fileRepository.SaveChangesAsync(ct);

		return new UploadFilesResultDto(fileId, $"/files/{fileId}");
	}

	private static async Task<bool> MatchesMagicBytesAsync(Stream s, string contentType, CancellationToken ct)
	{
		var header = new byte[16];
		int read = await s.ReadAsync(header.AsMemory(0, header.Length), ct);
		if (read < 12) return false;

		bool isPng =
			header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47 &&
			header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A;

		bool isJpeg =
			header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;

		bool isWebp =
			header[0] == (byte)'R' && header[1] == (byte)'I' && header[2] == (byte)'F' && header[3] == (byte)'F' &&
			header[8] == (byte)'W' && header[9] == (byte)'E' && header[10] == (byte)'B' && header[11] == (byte)'P';

		bool hasFtyp =
			header[4] == (byte)'f' && header[5] == (byte)'t' && header[6] == (byte)'y' && header[7] == (byte)'p';

		bool isQuickTime =
			hasFtyp &&
			header[8] == (byte)'q' && header[9] == (byte)'t' && header[10] == (byte)' ' && header[11] == (byte)' ';

		bool isMp4 =
			hasFtyp && !isQuickTime;

		bool isWebm =
			header[0] == 0x1A && header[1] == 0x45 && header[2] == 0xDF && header[3] == 0xA3;

		return contentType switch
		{
			"image/png" => isPng,
			"image/jpeg" => isJpeg,
			"image/webp" => isWebp,
			"video/mp4" => isMp4,
			"video/webm" => isWebm,
			"video/quicktime" => isQuickTime,
			_ => false
		};
	}

	// GET /files/{fileId}
	public async Task<FileGetResult> GetFileAsync(Guid requesterId, Guid fileId, CancellationToken ct)
	{
		// 1) Load file metadata
		var asset = await _fileRepository.GetByIdAsync(fileId, ct)
			?? throw new NotFoundException("File not found.");

		// 2) Access rules:
		//    - Avatar: anyone can view
		//    - Post image: only author or friends of author can view

		// Is this file used as an AVATAR????
		Guid? avatarOwnerId = await _userRepository.GetUserIdByAvatarFileIdAsync(fileId, ct);

		if (avatarOwnerId is null)
		{
			// Not an avatar, will treat as POST IMAGE!!!
			Guid? postAuthorId = await _postRepository.GetAuthorIdByImageFileIdAsync(fileId, ct);

			if (postAuthorId is null)
				throw new NotFoundException("File is not linked to any post.");

			if (postAuthorId.Value != requesterId)
			{
				bool isFriend = await _friendshipRepository.IsFriendAsync(postAuthorId.Value, requesterId, ct);
				if (!isFriend)
					throw new ForbiddenException("You do not have permission to view this file.");
			}
		}

		// 3) Here we open the bytes stream from storage (disk/object storage)
		var stream = await _filesStorage.OpenReadAsync(asset.StoragePath, ct);

		// 4) Return stream + content type for controller to return File(...)
		return new FileGetResult(stream, asset.ContentType);
	}

	//GET /files/avatar/{fileId}
	public async Task<FileGetResult> GetAvatarFileAsync(Guid fileId, CancellationToken ct)
	{
				Console.WriteLine("Trying to file the file");
		var asset = await _fileRepository.GetByIdAsync(fileId, ct)
			?? throw new NotFoundException("File not found.");
				Console.WriteLine("Found the file");
				Console.WriteLine("Trying to find the owner");
			Console.WriteLine($"File id{fileId}");
		Guid? avatarOwnerId = await _userRepository.GetUserIdByAvatarFileIdAsync(fileId, ct);
		if (avatarOwnerId is null)
			throw new NotFoundException("File is not used as an avatar.");
				Console.WriteLine("Found the owner");

				Console.WriteLine("Trying to open");
		var stream = await _filesStorage.OpenReadAsync(asset.StoragePath, ct);
				Console.WriteLine("Opened");
		Console.WriteLine($"Getting avatar with asset.ContentType: {asset.ContentType}");
		return new FileGetResult(stream, asset.ContentType);
	}


	// DELETE /files/{fileId}
	public async Task DeleteFileAsync(Guid requesterId, Guid fileId, CancellationToken ct)
	{
		var asset = await _fileRepository.GetByIdAsync(fileId, ct)
			?? throw new NotFoundException("File not found.");

		if (asset.OwnerId != requesterId)
			throw new ForbiddenException("You do not have permission to delete this file.");

		// 1) Delete bytes first, with small retry
		const int maxAttempts = 3;
		for (int attempt = 1; attempt <= maxAttempts; attempt++)
		{
			try
			{
				await _filesStorage.DeleteAsync(asset.StoragePath, ct);
				break; // success
			}
			catch when (attempt < maxAttempts)
			{
				await Task.Delay(TimeSpan.FromMilliseconds(150 * attempt), ct);
			}
		}

		// If still exists, _fileStorage.DeleteAsync should have thrown on last attempt.
		// 2) Delete metadata after bytes are gone
		_fileRepository.Remove(asset);
		await _fileRepository.SaveChangesAsync(ct);
	}
}
