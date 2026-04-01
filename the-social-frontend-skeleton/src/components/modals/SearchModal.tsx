import { useEffect, useState } from 'react'
import { Modal } from '../Modal'
import { useTranslation } from 'react-i18next'

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const { t } = useTranslation()

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
  
  const clearSearch = () => {
    setQuery('')
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
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {query ? (
        <div className="mt-6 space-y-3">
          <p className="text-gray-500 text-center py-8">
            {t('searchpage.noresults')} "{query}"
          </p>
        </div>
      ) : (
        <div className="mt-6 opacity-60 text-sm">
          {t('searchpage.searchresultshere')}
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