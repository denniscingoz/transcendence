interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  subtitle?: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({
  isOpen,
  title = 'ARE YOU SURE?',
  subtitle = '(It will be deleted forever)',
  onConfirm,
  onCancel,
  confirmText = 'YES',
  cancelText = 'NO',
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-gray-300 rounded-3xl p-8 w-full max-w-md mx-4">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-gray-400/30 rounded-full transition-colors"
        >
          <XIcon className="w-8 h-8 text-gray-900" />
        </button>

        {/* Content */}
        <div className="text-center pt-8 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-4 mt-8">
          <button
            onClick={onCancel}
            className="w-full py-4 bg-green-400 text-gray-900 font-bold text-xl rounded-full
                       hover:bg-green-500 active:bg-green-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-red-500 text-white font-bold text-xl rounded-full
                       hover:bg-red-600 active:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
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