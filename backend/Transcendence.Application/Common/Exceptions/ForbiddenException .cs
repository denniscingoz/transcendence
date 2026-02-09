using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Transcendence.Application.Common.Exceptions;
public sealed class ForbiddenException : Exception
{
	public ForbiddenException(string message) : base(message) { }
}
