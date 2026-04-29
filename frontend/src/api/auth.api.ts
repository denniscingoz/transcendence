import api from './axios'
import type { SignInRequestDto, SignUpRequestDto, AuthResponseDto, GoogleSignInRequestDto  } from '../types/api'



export async function signInApi(payload: SignInRequestDto): Promise<AuthResponseDto> {
  const { data } = await api.post<AuthResponseDto>('/auth/signin', payload)
  return data
}

export async function signUpApi(request: SignUpRequestDto): Promise<AuthResponseDto> {
  const { data } = await api.post<AuthResponseDto>('/auth/signup', request)
  return data
}

export async function googleSignInApi(request: GoogleSignInRequestDto): Promise<AuthResponseDto> {
  const { data } = await api.post<AuthResponseDto>('/auth/google', request)
  return data
}

export async function deleteAccountApi(): Promise<void> {
  await api.delete('/profile/me')
}