import { NavLink, useNavigate } from 'react-router-dom'
import { setLanguage } from '../i18n/i18n'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import {deleteAccountApi} from '../api/auth.api'
import { LanguageDropdown } from '../components/language/LanguageDropdown'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-xl text-sm ${isActive ? 'bg-black text-white' : 'hover:bg-black/5'}`
      }
    >
      {label}
    </NavLink>
  )
}

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  function handleClose() {
    navigate(-1)
  }

  function handleActivate2FA() {
    console.log('Activate 2FA')
  }

  async function handleDeleteAccount() {
    await deleteAccountApi()
    logout()
  }

  return (
    <div className="h-[calc(100dvh-250px)] bg-bg px-4 py-8">
      <div className="panel mx-auto max-w-2xl rounded-2xl border border-panel bg-white p-6 shadow-sm">
        
       { /*settings header and close x*/}
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-2xl font-semibold text-text">{t('settings.Settings')}</h1>
          <button
            type="button"
            onClick={handleClose}
            className="btn-ghost flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-text hover:bg-gray-100"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="space-y-8">

          { /*2FA Auth*/}
          {/* <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text">{t('settings.privacy')}</h2>

            <div className="flex items-center justify-between gap-4 bg-white rounded-xl border border-panel px-4 py-4">
              <p className="text-sm text-text">{t('settings.privacy')}</p>

              <button
                type="button"
                onClick={handleActivate2FA}
                className="bg-[#198BFC] rounded-full px-4 py-2 text-sm font-medium text-white hover:opacity-80"
              >
                {t('settings.Activate')}
              </button>
            </div>
          </section> */}

          { /*Log out*/}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text">{t('settings.logout')}</h2>

            <div className="bg-white flex items-center justify-between gap-4 rounded-xl border border-panel px-4 py-4">
              <p className="text-sm text-text">{t('settings.logoutfromaccount')}</p>

              {isAuthenticated ? (
            <button
              className="bg-gray-300 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-400"
              onClick={() => {
                logout()
                navigate('/signin')
              }}
            >
              {t('settings.logout')}
            </button>
          ) : (
            <NavItem to="/signin" label="Sign in" />
          )}


            </div>
          </section>

          { /*Delete Account*/}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text">{t('settings.account')}</h2>

            <div className="bg-white flex items-center justify-between gap-4 rounded-xl border border-panel px-4 py-4">
              <p className="text-sm text-text">{t('settings.deleteaccount')}</p>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:opacity-80"
              >
                {t('settings.Delete')}
              </button>
            </div>
          </section>
                    
          { /*Languages*/}
          <section className="space-y-3">
           
            <h2 className="text-lg font-semibold text-text">{t('settings.language')}</h2>

            <div className="bg-white flex items-center justify-between gap-4 rounded-xl border border-panel px-4 py-4">
              
                {/* Text */}
                <p className="text-sm text-text">{t('settings.changelanguage')}.</p>
          
                {/* Dropdown Menu */}
                {/* <select
                          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm"
                          value={i18n.language}
                          onChange={(e) => setLanguage(e.target.value as any)}
                        >
                          <option value="en">EN</option>
                          <option value="fr">FR</option>
                          <option value="es">ES</option>
            
               </select> */}
                <LanguageDropdown
                  value={i18n.language as 'en' | 'fr' | 'es'}
                  onChange={(lang) => setLanguage(lang)}
                />

            </div>

          </section>

        </div>
      </div>
    </div>
  )
}