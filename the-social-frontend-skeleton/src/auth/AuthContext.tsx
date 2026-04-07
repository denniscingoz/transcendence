import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { SignInRequestDto, SignUpRequestDto, GoogleSignInRequestDto } from '../types/api'
import { signInApi, signUpApi, googleSignInApi } from '../api/auth.api'

type AuthState = {
  token: string | null
}

type AuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  signIn: (req: SignInRequestDto) => Promise<void>
  signup: (req: SignUpRequestDto) => Promise<void>
  googleSignIn: (req: GoogleSignInRequestDto) => Promise<void>
  logout: () => void
  setToken: (token: string | null) => void
}

const TOKEN_KEY = 'the-social.jwt'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function loadToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function persistToken(token: string | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY)
  else localStorage.setItem(TOKEN_KEY, token)
}

export function AuthProvider({ children }: { children: React.ReactNode })
{
  const [state, setState] = useState<AuthState>(() => ({ token: loadToken() }))

  const setToken = useCallback((token: string | null) => {
    persistToken(token)
    setState({ token })
  }, [])

  const signIn = useCallback(async (req: SignInRequestDto) => {
    // Call backend (or MSW mock in dev) to obtain a JWT token.
    const res = await signInApi(req)
    setToken(res.token)
  }, [setToken])

  const signup = useCallback(async (req: SignUpRequestDto) => {
    // Call backend (or MSW mock in dev) to obtain a JWT token.
    const res = await signUpApi(req)
    setToken(res.token)
  }, [setToken])

  const googleSignIn = useCallback(async (req: GoogleSignInRequestDto) => {
  const res = await googleSignInApi(req)
  setToken(res.token)
  }, [setToken])

  const logout = useCallback(() => setToken(null), [setToken])

  const value = useMemo<AuthContextValue>(() => ({
    token: state.token,
    isAuthenticated: Boolean(state.token),
    signIn,
    signup,
    googleSignIn,
    logout,
    setToken,
  }), [state.token, signIn, signup, googleSignIn, logout, setToken])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function getStoredToken(): string | null {
  return loadToken()
}
