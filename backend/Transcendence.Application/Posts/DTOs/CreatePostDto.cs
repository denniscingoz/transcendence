using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Transcendence.Application.Posts.DTOs;
public sealed class CreatePostDto
{
	public string? Content { get; init; }
	public Guid ImageFileId { get; init; }
}
