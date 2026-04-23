import { useEffect, useRef, useState } from 'react'

type Language = 'en' | 'fr' | 'es'

type Props = {
  value: Language
  onChange: (lang: Language) => void
  className?: string
}

const options: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
  { value: 'es', label: 'ES' },
]

export function LanguageDropdown({ value, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find((option) => option.value === value)

  return (
    <div
      ref={ref}
      className={`relative inline-block w-24 text-sm ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between border border-gray-300 bg-white px-4 py-2.5 text-base font-medium text-slate-800 shadow-sm transition ${
          open
            ? 'rounded-t-full rounded-b-none border-b-transparent'
            : 'rounded-full'
        }`}
      >
        <span>{selected?.label}</span>
        <svg
          className={`h-4 w-4 text-slate-500 transition ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 8l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 -mt-px w-full overflow-hidden rounded-b-3xl border border-gray-300 border-t-0 bg-white shadow-lg">
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-base transition ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-800 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}