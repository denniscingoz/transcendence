import { useEffect, useState } from 'react'
import { Modal } from '../Modal'
import { useTranslation } from 'react-i18next'
import { searchProfilesApi } from '../../api/search.api'
import type { OtherProfileDto } from '../../types/api'
import { useNavigate } from 'react-router-dom'

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [results, setResults] = useState<OtherProfileDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { t } = useTranslation()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!debouncedQuery) {
        setResults([])
        setError(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const page = await searchProfilesApi({
          query: debouncedQuery,
          take: 20,
          cursor: null,
        })

        if (!cancelled) {
          setResults(page.items)
        }
      }
      
      
      catch (e: any) {
        if (!cancelled) {
          setResults([])
          setError(e?.response?.data?.message ?? 'Search failed')
        }
      }
      
      finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  const clearSearch = () => {
    setQuery('')
    setDebouncedQuery('')
    setResults([])
    setError(null)
  }

  return (
    <Modal title={t('searchpage.search')} onClose={onClose}>
      <div className="relative">
        <input
          className="input pr-12"
          placeholder={t('searchpage.typeinyoursearch')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {!query ? (
        <div className="mt-6 opacity-60 text-sm">
          {t('searchpage.searchresultshere')}
        </div>
      ) : isLoading ? (
        <div className="mt-6 text-sm text-gray-500">
          {t('common.loading')}
        </div>
      ) : error ? (
        <div className="mt-6 text-sm text-red-500">
          {error}
        </div>
      ) : results.length> 0 ? (
            <div className="mt-6 max-h-[50vh] space-y-3 overflow-y-auto pr-1">
             {results.map((profile) => (
               <div
                 onClick={() => {
                   navigate(`/profile/${profile.id}`)
                   onClose()
                 }}
                 key={profile.id}
                 className="cursor-pointer rounded-xl border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
              <img
                src={profile.avatarUrl ? `${import.meta.env.VITE_API_BASE_URL}${profile.avatarUrl }` : 'https://placehold.co/200x200'}
                alt="Profile avatar"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-panel"
              />
              
              <div className="min-w-0 flex-1">
              <div className="font-medium">{profile.username}</div>
              <div className="text-sm text-gray-500">{profile.fullName}</div>
              </div>

              </div>
              </div>


            </div>
          )
            
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-gray-500 text-center py-8">
            {t('searchpage.noresults')} "{query}"
          </p>
        </div>
      )}
    </Modal>
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