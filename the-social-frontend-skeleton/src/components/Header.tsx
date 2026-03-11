import { useState } from 'react'

interface HeaderProps {
  showNotification?: boolean
}

export function Header({ showNotification = true }: HeaderProps) {
  const [hasNotifications] = useState(true)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-xl font-bold tracking-[0.2em] text-gray-900">
          THE SOCIAL
        </h1>

        {/* Notification bell */}
        {showNotification && (
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <BellIcon className="w-6 h-6 text-gray-700" />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>
        )}
      </div>
    </header>
  )
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}