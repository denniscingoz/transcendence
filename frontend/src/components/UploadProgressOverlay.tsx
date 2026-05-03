import { useEffect } from 'react'

type UploadProgressOverlayProps = {
  open: boolean
  progress: number
  isComplete: boolean
  title?: string
  subtitle?: string
  completionText?: string
}

const RING_RADIUS = 54
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function clampProgress(progress: number) {
  return Math.min(100, Math.max(0, progress))
}

export function UploadProgressOverlay({
  open,
  progress,
  isComplete,
  title = 'Uploading',
  subtitle = 'Please wait while we upload your file.',
  completionText = 'Uploaded',
}: UploadProgressOverlayProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) {
    return null
  }

  const normalizedProgress = clampProgress(progress)
  const ringOffset = RING_CIRCUMFERENCE - (normalizedProgress / 100) * RING_CIRCUMFERENCE

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
      <div className="mx-4 w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="relative mx-auto h-36 w-36">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={RING_RADIUS} fill="none" stroke="#e6eaf0" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r={RING_RADIUS}
              fill="none"
              stroke={isComplete ? '#16a34a' : '#1d4ed8'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              className="transition-[stroke-dashoffset,stroke] duration-300 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            {isComplete ? (
              <svg viewBox="0 0 24 24" className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className="text-2xl font-semibold text-slate-800">{Math.round(normalizedProgress)}%</span>
            )}
          </div>
        </div>

        <p className="mt-4 text-base font-semibold text-slate-900">{isComplete ? completionText : title}</p>
        <p className="mt-1 text-sm text-slate-600">{isComplete ? 'Redirecting...' : subtitle}</p>
      </div>
    </div>
  )
}
