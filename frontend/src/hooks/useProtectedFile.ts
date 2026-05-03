import { useEffect, useState } from 'react'
import { getProtectedFileBlob } from '../api/files.api'

export function useProtectedFile(fileUrl?: string | null) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    setResolvedUrl(null)

    if (!fileUrl) {
      setIsLoading(false)
      return
    }

    const loadFile = async () => {
      try {
        setIsLoading(true)

        const blob = await getProtectedFileBlob(fileUrl)

        if (cancelled) return

        objectUrl = URL.createObjectURL(blob)
        setResolvedUrl(objectUrl)
      } catch {
        if (!cancelled) {
          setResolvedUrl(null)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadFile()

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [fileUrl])

  return { resolvedUrl, isLoading }
}