using System;

namespace Transcendence.Domain.Exceptions
{
    public class DomainException : Exception
    {
        public DomainException(string message) : base(message)
        {
        
        }   
    }
    public class FollowYourselfException : DomainException
    {
        public FollowYourselfException() : base("Cannot follow yourself")
        {
        
        }   
    }
}