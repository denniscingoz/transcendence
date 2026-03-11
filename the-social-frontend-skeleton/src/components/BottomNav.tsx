import { Link, useLocation } from 'react-router-dom'

type NavItem = 'home' | 'search' | 'messages' | 'profile'

interface BottomNavProps {
  active?: NavItem
}

export function BottomNav({ active }: BottomNavProps) {
  const location = useLocation()
  
  const isActive = (item: NavItem) => {
    if (active) return active === item
    const path = location.pathname
    if (item === 'home') return path === '/' || path === '/feed'
    if (item === 'search') return path === '/search'
    if (item === 'messages') return path === '/chat' || path === '/messages'
    if (item === 'profile') return path === '/profile'
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-100/95 backdrop-blur-sm border-t border-gray-200 z-50">
      <div className="max-w-lg mx-auto px-6 py-3 flex justify-around items-center">
        <NavLink to="/feed" active={isActive('home')}>
          <HomeIcon />
        </NavLink>
        
        <NavLink to="/search" active={isActive('search')}>
          <SearchIcon />
        </NavLink>
        
        <NavLink to="/chat" active={isActive('messages')}>
          <MessagesIcon />
        </NavLink>
        
        <NavLink to="/profile" active={isActive('profile')}>
          <ProfileIcon />
        </NavLink>
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

function HomeIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function MessagesIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}