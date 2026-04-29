import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { SignInRequestDto, SignUpRequestDto, AuthResponseDto } from '../types/api'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { TheSocialLogo } from '../components/Header'
import api from '../api/axios'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { googleSignInApi } from '../api/auth.api'
import { LanguageDropdown } from '../components/language/LanguageDropdown'
import { setLanguage } from '../i18n/i18n'
import { Link } from 'react-router-dom'


export function AuthPage() {
  const { t, i18n } = useTranslation()
  const { signIn } = useAuth()
  const { signup } = useAuth()
  const { googleSignIn } = useAuth()
  const nav = useNavigate()
  const location = useLocation() as any

  const [signInApiError, setSignInApiError] = useState<string | null>(null)
  const [signupApiError, setSignupApiError] = useState<string | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const signInForm = useForm<SignInRequestDto>({
    defaultValues: { email: '', password: '' },
  })

  const signupForm = useForm<SignUpRequestDto>({
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      username: '',
    },
  })

  const onSignInSubmit = async (values: SignInRequestDto) => {
  setSignInApiError(null)
  try {
    await signIn(values)
    nav('/feed')
  } catch (e: any) {
    const errors = e?.response?.data?.errors as Record<string, string[]> | undefined
    const firstError = errors ? Object.values(errors)[0]?.[0] : null

    setSignInApiError(firstError ?? e?.response?.data?.detail ?? 'Sign in failed')
  }
}

  const onSignupSubmit = async (values: SignUpRequestDto) => {
    setSignupApiError(null)
    try {
       await signup(values)
      const to ='/feed'
      nav(to)
    } catch (e: any) {
      const errors = e?.response?.data?.errors as Record<string, string[]> | undefined
      const firstError = errors ? Object.values(errors)[0]?.[0] : null

      setSignupApiError(firstError ?? e?.response?.data?.detail ?? 'Signup failed')
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
  setGoogleError(null)
  setIsGoogleLoading(true)

  try {
    if (!credentialResponse.credential) {
      throw new Error('Missing Google credential')
    }

    await googleSignIn({ idToken: credentialResponse.credential })

    const to ='/feed'
    nav(to)
  } catch (e: any) {
    setGoogleError(e?.response?.data?.detail ?? e?.message ?? 'Google sign-in failed')
  } finally {
    setIsGoogleLoading(false)
  }
}

  const handleGoogleError = () => {
    setGoogleError('Google sign-in failed. Please try again.')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        { /*Languages*/}
        <div className="bg-white flex items-center justify-between gap-4 rounded-xl border border-panel px-4 py-4">
          
            {/* Text */}
            <p className="text-sm text-text">{t('settings.changelanguage')}.</p>
            {/* Dropdown */}
            <LanguageDropdown
              value={i18n.language as 'en' | 'fr' | 'es'}
              onChange={(lang) => {
                if (lang === i18n.language) return
                setLanguage(lang)
                window.location.reload()
              }}
            />
        </div>
        

        <h1 className="flex justify-center">
          <TheSocialLogo className="h-4 w-auto text-gray-900" />
        </h1>

        {/* signIn */}
        <div className="panel">
          <form className="space-y-4" onSubmit={signInForm.handleSubmit(onSignInSubmit)}>
            
            <div>
              <input
                className="input"
                placeholder={t('auth.email')}
                {...signInForm.register('email', { required: t('auth.emailRequired') })}
                />
              <div className="flex justify-center">
                  {signInForm.formState.errors.email && (
                   <p className="text-sm text-red-600 mt-1">
                     {signInForm.formState.errors.email.message}
                   </p>
                 )}
              </div>
            
            </div> 

            <div>
              <input
                className="input"
                placeholder={t('auth.password')}
                type="password"
                {...signInForm.register('password', { required: t('auth.passwordRequired') })}
                />
              <div className="flex justify-center">
                  {signInForm.formState.errors.password && (
                   <p className="text-sm text-red-600 mt-1">
                     {signInForm.formState.errors.password.message}
                   </p>
                 )}
              </div>

            </div>

            {signInApiError && (
              <div className="text-sm text-red-600 text-center">{signInApiError}</div>
            )}

            <div className="flex justify-center pt-2">
              <button
                className="btn-primary w-64"
                type="submit"
                disabled={signInForm.formState.isSubmitting}
              >
                {signInForm.formState.isSubmitting ? t('auth.signingin') : t('auth.signin')}
              </button>
            </div>
          </form>
        </div>

        {/* {Or text} */}
        <div className="divider">{t('auth.or')}</div>

        {/* {Singup with Google and Local} */}
        <div className="panel space-y-4">
          
          {/* Signup with Google */}
          <GoogleOAuthProvider
            clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              locale={i18n.language}
          >
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="continue_with"
                theme="outline"
                shape="pill"
                size="large"
                logo_alignment="center"
                width={400}
              />
            </div>
          </GoogleOAuthProvider>

          {googleError && (
            <div className="text-sm text-red-600 text-center">{googleError}</div>
          )}

          {/* {Or text} */}
          <div className="divider">{t('auth.or')}</div>

          {/* Local Signup */}
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
           
          <div>
              <input
                className="input"
                placeholder={t('auth.email')}
                {...signupForm.register('email', { required: t('auth.emailRequired') })}
              />

              <div className="flex justify-center">
              {signupForm.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {signupForm.formState.errors.email.message}
                </p>
              )}
              </div>


          </div>

            <div>
              <input
                className="input"
                placeholder={t('auth.password')}
                type="password"
                {...signupForm.register('password', { required: t('auth.passwordRequired') })}

               />
               <div className="flex justify-center">
                  {signupForm.formState.errors.password && (
                   <p className="text-sm text-red-600 mt-1">
                     {signupForm.formState.errors.password.message}
                   </p>
                 )}
              </div>

            </div>

            <div>
            <input
              className="input"
              placeholder={t('auth.fullname')}
              {...signupForm.register('fullName', { required: t('auth.fullnameRequired')})}
            />
              <div className="flex justify-center">
                {signupForm.formState.errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">
                    {signupForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <input
                className="input"
                placeholder={t('auth.username')}
                {...signupForm.register('username', { required: t('auth.usernameRequired')})}
                
              />

                <div className="flex justify-center"> 
                  {signupForm.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">
                      {signupForm.formState.errors.username.message}
                    </p>
                  )}
                </div>

            </div>
            {signupApiError && (
              <div className="text-sm text-red-600 text-center">{signupApiError}</div>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="btn-primary w-64"
                disabled={signupForm.formState.isSubmitting}
              >
                {signupForm.formState.isSubmitting ? t('auth.signinup') : t('auth.signup')}
              </button>
            </div>
          </form>
        </div>

          <div className="flex justify-center gap-2">
            <Link to="/privacy-policy" className="text-sm text-gray-600 hover:underline">
               {t('privacyPolicy.header')}
             </Link>  

               <Link to="/terms-service" className="text-sm text-gray-600 hover:underline">
               {t('termsService.header')}
             </Link>
          </div>


      </div>
    </div>
  )
}