using System;

namespace Transcendence.Domain.Exceptions
{
    public class DomainException : Exception // to separate business errors from technical ones.
    {
        public DomainException(string message) : base(message)
        {
        
        }   
    }
    public class CannotFriendYourselfException : DomainException
    {
        public CannotFriendYourselfException() : base("Cannot follow yourself")
        {
        
        }   
    }

    public class NotFoundException : DomainException
    {
        public NotFoundException(string message): base(message) {}
        public NotFoundException() : base ("not found") {}
    }

    public class ForbiddenException : DomainException
    {
        public ForbiddenException(string message): base (message) {}
        public ForbiddenException(): base ("No way ") {}

    }
    
    public class DomainValidationException : DomainException
    {
        public DomainValidationException(string message): base (message) {}
        public DomainValidationException(): base ("Bad request") {}

    }
    
    public class UnauthorizedAccessException : DomainException
    {
        public UnauthorizedAccessException(string message): base (message) {}
        public UnauthorizedAccessException(): base ("Unathorized exception") {}

    }

   public class InvalidArgumentException : DomainException
    {
        public InvalidArgumentException(string message): base (message) {}
        public InvalidArgumentException(): base ("wrong arguement ") {}

    }
 
}