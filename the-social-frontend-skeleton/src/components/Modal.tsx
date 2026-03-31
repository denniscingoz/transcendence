// export function Modal({
//   title,
//   onClose,
//   children,
// }: {
//   title: string
//   onClose: () => void
//   children: React.ReactNode
// }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/20">
//       <div className="panel w-full max-w-3xl p-6 relative">
//         <button className="absolute right-6 top-6 text-2xl" onClick={onClose}>
//           ×
//         </button>
//         <div className="text-xl tracking-widest mb-4">{title}</div>
//         {children}
//       </div>
//     </div>
//   )
// }

import { useTranslation } from "react-i18next"

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {

  const { t } = useTranslation()
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-16"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel w-full max-w-3xl p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sm text-gray-500 hover:text-black"
        >
          {t('searchpage.close')}
        </button>

        <h2 className="mb-4 text-lg font-semibold">{title}</h2>

        {children}
      </div>
    </div>
  )
}