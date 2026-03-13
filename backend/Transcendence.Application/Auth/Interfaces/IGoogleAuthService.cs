using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Transcendence.Application.Auth.DTOs;

namespace Transcendence.Application.Auth.Interfaces;
public interface IGoogleAuthService
{
	Task<GoogleUserPayloadDto> VerifyIdTokenAsync(string idToken, CancellationToken ct);

}

