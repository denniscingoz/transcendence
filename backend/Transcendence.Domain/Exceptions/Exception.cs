using System;

namespace Transcendence.Domain.Exceptions
{
    public class DomainException : Exception
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
}