import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { SearchIcon } from './icons/SearchIcon'
import { MessagesIcon } from './icons/MessagesIcon'
import { ProfileIcon } from './icons/ProfileIcon'
import { HomeIcon } from './icons/HomeIcon'
import { CommentIcon } from './icons/CommentIcon'

type NavItem = 'home' | 'search' | 'messages' | 'profile'

interface BottomNavProps {
  active?: NavItem
  onSearchClick?: () => void
}

export function BottomNav({ active, onSearchClick }: BottomNavProps) {
  const location = useLocation()
  const { t } = useTranslation()

  const isActive = (item: NavItem) => {
    if (active) return active === item
    const path = location.pathname
    if (item === 'home') return path === '/' || path === '/feed'
    if (item === 'messages') return path === '/chat' || path === '/messages'
    if (item === 'profile') return path === '/profile'
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-100/95 backdrop-blur-sm border-t border-gray-200 z-50">
    {/*  <nav className="fixed bottom-0 left-0 right-0 bg-gray-100/95 backdrop-blur-sm border-t border-gray-200 z-50"> */}
      <div className="max-w-lg mx-auto px-6 flex justify-around items-center">
        <NavLink to="/feed" active={isActive('home')}>
          <HomeIcon />
        </NavLink>

        <button
          type="button"
          onClick={onSearchClick}
          className="p-3 rounded-full transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-200"
        >
          <SearchIcon />
        </button>

        <NavLink to="/chat" active={isActive('messages')}>
          <CommentIcon />
        </NavLink>

        <NavLink to="/profile" active={isActive('profile')}>
          <ProfileIcon />
        </NavLink>
      </div>
      <div className="flex justify-center pb-2 gap-2">
            <Link to="/privacy-policy" className="text-sm text-gray-600 hover:underline">
               {t('privacyPolicy.header')}
             </Link>  

               <Link to="/terms-service" className="text-sm text-gray-600 hover:underline">
               {t('termsService.header')}
             </Link>
          </div>
    </nav>
  )
}

interface NavLinkProps {
  to: string
  active: boolean
  children: React.ReactNode
}

function NavLink({ to, active, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`p-3 rounded-full transition-colors ${
        active
          ? 'text-gray-900'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </Link>
  )
}



