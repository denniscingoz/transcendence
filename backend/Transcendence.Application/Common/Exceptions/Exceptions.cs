using Microsoft.AspNetCore.Http;
using Transcendence.Domain.Exceptions;

namespace Transcendence.Application.Common.Exceptions;


//DomainValidationException => StatusCodes.Status400BadRequest,
//UnauthorizedException => StatusCodes.Status401Unauthorized,
//ForbiddenException => StatusCodes.Status403Forbidden,
//NotFoundException => StatusCodes.Status404NotFound,
//ConflictException => StatusCodes.Status409Conflict,


public class UnauthorizedException : Exception
{
	 public UnauthorizedException(string message) : base(message) { }
}

public class ForbiddenException : Exception
{
	public ForbiddenException(string message) : base(message) { }
}

public class NotFoundException : Exception
{
	public NotFoundException(string message) : base(message) { }
}

public class ConflictException : Exception
{
	public ConflictException(string message) : base(message) { }
}