import { useProtectedFile } from '../../hooks/useProtectedFile'

type ProtectedPostThumbProps = {
  fileUrl?: string | null
  contentType?: string | null 
}


export function ProtectedPostThumb({ fileUrl, contentType }: ProtectedPostThumbProps) {
  const { resolvedUrl, isLoading } = useProtectedFile(fileUrl)

  if (isLoading || !resolvedUrl) {
    return <div className="w-full h-full bg-gray-200" />
  }

  if (contentType?.startsWith('video/')) {
    return (
      <video
        src={resolvedUrl}
        className="w-full h-full object-cover pointer-events-none"
        muted
        playsInline
      />
    )
  }

  if (contentType?.startsWith('image/')) {
    return (
      <img
        src={resolvedUrl}
        alt=""
        className="w-full h-full object-cover"
      />
    )
  }

  return <div className="w-full h-full bg-gray-200" />
}


export function ProtectedPostThumbPreview({ fileUrl, contentType }: ProtectedPostThumbProps) {
  const { resolvedUrl, isLoading } = useProtectedFile(fileUrl)

  if (isLoading || !resolvedUrl) {
    return <div className="w-full h-full bg-gray-200" />
  }

  if (contentType?.startsWith('video/'))
  {
    return (
      <div className="relative w-full h-full">
        <video
          src={resolvedUrl}
          className="w-full h-full object-cover pointer-events-none"
          muted
          playsInline
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <PlayIcon />
        </div>
      </div>
    )
  }

  if (contentType?.startsWith('image/')) {
    return (
      <img
        src={resolvedUrl}
        alt=""
        className="w-full h-full object-cover"
      />
    )
  }

  return <div className="w-full h-full bg-gray-200" />
}

export function ProtectedPostThumbContent({ fileUrl, contentType }: ProtectedPostThumbProps) {
  const { resolvedUrl, isLoading } = useProtectedFile(fileUrl)

  if (isLoading || !resolvedUrl) {
    return <div className="w-full h-full bg-gray-200" />
  }

  if (contentType?.startsWith('video/')) {
    return (
      <video
        src={resolvedUrl}
        className="w-full h-full object-cover"
        controls
        muted
        playsInline
      />
    )
  }

  if (contentType?.startsWith('image/')) {
    return (
      <img
        src={resolvedUrl}
        alt=""
        className="w-full h-full object-cover"
      />
    )
  }

  return <div className="w-full h-full bg-gray-200" />
}

export function PlayIcon() {
  return (
    <svg
      viewBox="0 0 271.21 288.23"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-10 h-10"
      fill="none"
    >
      <path
        fill="#f4f4f4"
        d="M238.65,87.44C194.7,56.88,147.25,31.73,98.99,7.91c-22.15-10.93-44.38-10.65-64.91,1.58C17.13,19.58,5.3,38.38,3.3,61.83c-4.62,54.2-4.04,108.32-.41,162.85,2.47,37.05,30.42,65.93,67.61,63.39,13.19-.9,27.43-5.87,39.33-12.01,44.63-23.06,87.62-47.13,128.87-74.98,20.92-14.12,32.86-34.51,32.49-58.04-.36-22.35-12.4-41.59-32.54-55.6Z"
      />
    </svg>
  )
}