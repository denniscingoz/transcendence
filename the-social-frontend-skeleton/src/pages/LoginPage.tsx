import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { LoginRequest } from '../types/api'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

export function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const nav = useNavigate()
  const location = useLocation() as any
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginRequest) => {
    setApiError(null)
    try {
      await login(values)
      const to = location?.state?.from ?? '/profile'
      nav(to)
    } catch (e: any) {
      setApiError(e?.response?.data?.message ?? 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <h1 className="text-center text-2xl font-bold tracking-[0.3em] text-gray-900">
          THE SOCIAL
        </h1>

        {/* Login Card */}
        <div className="panel">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <input
              className="input"
              placeholder="Username, or email"
              {...register('email', { required: true })}
            />
            <input
              className="input"
              placeholder="Password"
              type="password"
              {...register('password', { required: true })}
            />

            {apiError && (
              <div className="text-sm text-red-600 text-center">{apiError}</div>
            )}

            <div className="flex justify-center pt-2">
              <button className="btn-primary w-64" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="divider">OR</div>

        {/* Signup Card */}
        <div className="panel space-y-4">
          {/* Google Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white rounded-full px-5 py-3.5 
                       hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="divider">OR</div>

          {/* Signup Form */}
          <div className="space-y-4">
            <input className="input" placeholder="Email" />
            <input className="input" placeholder="Password" type="password" />
            <input className="input" placeholder="Full name" />
            <input className="input" placeholder="Username" />

            <div className="flex justify-center pt-2">
              <button type="button" className="btn-primary w-64">
                Signup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}