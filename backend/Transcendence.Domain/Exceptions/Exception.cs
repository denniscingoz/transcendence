using System;
using System.Data;

namespace Transcendence.Domain.Exceptions
{
    public class DomainValidationException : Exception // to separate business errors from technical ones.
    {
        public DomainValidationException(string message) : base(message)
        {
        
        }   
    }
    public class CannotFriendYourselfException : DomainValidationException
    {
        public CannotFriendYourselfException() : base("Cannot friend yourself")
        {
        
        }   
    }
 
}