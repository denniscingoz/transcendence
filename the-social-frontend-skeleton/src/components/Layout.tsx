import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { BottomNav } from '../components/BottomNav'
import { Header } from '../components/Header'
import { SearchModal } from '../components/modals/SearchModal'

export function Layout() {
  const { isAuthenticated } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <div className="page min-h-screen bg-white">
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 pb-28">
        <Outlet />
      </main>

      {isAuthenticated ? (
        <BottomNav onSearchClick={() => setIsSearchOpen(true)} />
      ) : null}

      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
    </div>
  )
}