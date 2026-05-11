import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { SignInRequestDto, SignUpRequestDto, GoogleSignInRequestDto } from '../types/api'
import { signInApi, signUpApi, googleSignInApi } from '../api/auth.api'
import { useQueryClient } from '@tanstack/react-query'

// TYPE DEFINITIONS 
/** User data stored in authentication context */
type AuthUser = {
  id: string
  username: string
}

/** Internal state tracking token and user */
type AuthState = {
  token: string | null
  user: AuthUser | null
}

/** Public API exposed by the auth context to consumers */
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

// ====== CONSTANTS ======
/** LocalStorage key for JWT token */
const TOKEN_KEY = 'the-social.jwt'
/** LocalStorage key for user data */
const USER_KEY = 'the-social.user'

/** Create the auth context - initially undefined, populated by AuthProvider */
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ====== UTILITY FUNCTIONS ======
/** Decode JWT payload from base64url format to readable string */
const decodeBase64Url = (base64Url: string): string => {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')

  while (base64.length % 4 !== 0) {
    base64 += '='
  }

  return atob(base64)
}

/** Check if JWT token has expired by examining the exp claim */
export const isJwtExpired = (token: string): boolean => {
  try {
    const parts = token.split('.')

    if (parts.length !== 3) {
      return true
    }

    const payload = JSON.parse(decodeBase64Url(parts[1]))

    if (!payload.exp) {
      return true
    }

    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

/** Load token from localStorage and validate it (remove if expired) */
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

/** Load user data from localStorage and parse it safely */
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

/** Save token and user to localStorage (or remove if null) */
function persistAuth(token: string | null, user: AuthUser | null) {
  if (!token) localStorage.removeItem(TOKEN_KEY)
  else localStorage.setItem(TOKEN_KEY, token)

  if (!user) localStorage.removeItem(USER_KEY)
  else localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// ====== AUTH PROVIDER COMPONENT ======
/** Provider component that manages authentication state and makes it available to the app */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Get React Query client to clear cached data on auth changes
  const queryClient = useQueryClient()

  // Initialize auth state from localStorage (or empty if no valid token)
  const [state, setState] = useState<AuthState>(() => ({
    token: loadToken(),
    user: loadUser(),
  }))

// ====== CALLBACK FUNCTIONS ======
/** Update auth state and persist to localStorage */
const setAuth = useCallback((token: string | null, user: AuthUser | null) => {
  persistAuth(token, user)
  setState({ token, user })
}, [])

/** Handle user sign-in: call API, clear cache, update auth state */
const signIn = useCallback(async (req: SignInRequestDto) => {
  const res = await signInApi(req)
  queryClient.clear()
  setAuth(res.token, res.user)
}, [setAuth, queryClient])

/** Handle user sign-up: call API, clear cache, update auth state */
const signup = useCallback(async (req: SignUpRequestDto) => {
  const res = await signUpApi(req)
  queryClient.clear()
  setAuth(res.token, res.user)
}, [setAuth, queryClient])

/** Handle Google OAuth sign-in: call API, clear cache, update auth state */
const googleSignIn = useCallback(async (req: GoogleSignInRequestDto) => {
  const res = await googleSignInApi(req)
  queryClient.clear()
  setAuth(res.token, res.user)
}, [setAuth, queryClient])

/** Clear all authentication data and cache */
  const logout = useCallback(() => {
    setAuth(null, null)
    queryClient.clear()
  }, [setAuth, queryClient])

  // Memoize context value to prevent unnecessary re-renders of consumers
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

  // Provide context value to all child components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ====== CUSTOM HOOKS ======
/** Hook to access auth context - throws error if used outside AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Get the currently stored token from localStorage (without context) */
export function getStoredToken(): string | null {
  return loadToken()
}