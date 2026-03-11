import { useState } from 'react'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(true)

  const clearSearch = () => {
    setQuery('')
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header showNotification={false} />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="panel min-h-[70vh]">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-wider">SEARCH</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-400/30 rounded-full transition-colors"
            >
              <XIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH"
              className="w-full bg-white rounded-full px-5 py-3.5 pr-12 outline-none
                         placeholder:text-gray-400 focus:ring-2 focus:ring-gray-300"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search results would go here */}
          {query && (
            <div className="mt-6 space-y-3">
              <p className="text-gray-500 text-center py-8">
                No results found for "{query}"
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNav active="search" />
    </div>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  )
}