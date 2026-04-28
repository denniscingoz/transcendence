import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { SignInRequestDto, SignUpRequestDto, GoogleSignInRequestDto } from '../types/api'
import { signInApi, signUpApi, googleSignInApi } from '../api/auth.api'

type AuthUser = {
  id: string
  username: string
}

type AuthState = {
  token: string | null
  user: AuthUser | null
}

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (req: SignInRequestDto) => Promise<void>
  signup: (req: SignUpRequestDto) => Promise<void>
  googleSignIn: (req: GoogleSignInRequestDto) => Promise<void>
  logout: () => void
  setAuth: (token: string | null, user: AuthUser | null) => void
}

const TOKEN_KEY = 'the-social.jwt'
const USER_KEY = 'the-social.user'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function isJwtExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split('.')[1]
    if (!payloadBase64) return true

    const payload = JSON.parse(atob(payloadBase64))
    const exp = payload.exp

    if (typeof exp !== 'number') return true

    return Date.now() >= exp * 1000
  } catch {
    return true
  }
}

function loadToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)

  if (!token || token === 'null' || token === 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return null
  }

  if (isJwtExpired(token)) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return null
  }

  return token
}

function loadUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)

  if (!raw || raw === 'null' || raw === 'undefined') {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function persistAuth(token: string | null, user: AuthUser | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY)
  else localStorage.setItem(TOKEN_KEY, token)

  if (!user) localStorage.removeItem(USER_KEY)
  else localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    token: loadToken(),
    user: loadUser(),
  }))

const setAuth = useCallback((token: string | null, user: AuthUser | null) => {
  persistAuth(token, user)
  setState({ token, user })
}, [])

const signIn = useCallback(async (req: SignInRequestDto) => {
  const res = await signInApi(req)
  setAuth(res.token, res.user)
}, [setAuth])

  const signup = useCallback(async (req: SignUpRequestDto) => {
    const res = await signUpApi(req)
    setAuth(res.token, res.user)
  }, [setAuth])

  const googleSignIn = useCallback(async (req: GoogleSignInRequestDto) => {
    const res = await googleSignInApi(req)
    setAuth(res.token, res.user)
  }, [setAuth])

  const logout = useCallback(() => setAuth(null, null), [setAuth])

  const value = useMemo<AuthContextValue>(() => ({
    token: state.token,
    user: state.user,
    isAuthenticated: Boolean(state.token),
    signIn,
    signup,
    googleSignIn,
    logout,
    setAuth,
  }), [state.token, state.user, signIn, signup, googleSignIn, logout, setAuth])


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