import { useProtectedFile } from '../../hooks/useProtectedFile'

type ProtectedPostThumbProps = {
  fileUrl?: string | null
}

export function ProtectedPostThumb({ fileUrl }: ProtectedPostThumbProps) {
  const { resolvedUrl, isLoading } = useProtectedFile(fileUrl)

  if (isLoading || !resolvedUrl) {
    return <div className="w-full h-full bg-gray-200" />
  }

  return (
    <img
      src={resolvedUrl}
      alt=""
      className="w-full h-full object-cover"
    />
  )
}