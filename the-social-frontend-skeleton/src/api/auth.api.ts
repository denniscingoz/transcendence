import api from './axios'
import type { LoginRequest, LoginResponse } from '../types/api'
import type { SignUpRequestDto, AuthResponseDto } from '../types/api'

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}

export async function signUp(request: SignUpRequestDto): Promise<AuthResponseDto> {
  const { data } = await api.post<AuthResponseDto>('/signup', request)
  return data
}