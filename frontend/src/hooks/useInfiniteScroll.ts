import { useEffect, useRef } from 'react'

type UseInfiniteScrollOptions = {
  enabled: boolean
  onLoadMore: () => void
  rootMargin?: string
}

export function useInfiniteScroll({
  enabled,
  onLoadMore,
  rootMargin = '300px',
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!enabled || !sentinelRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore()
        }
      },
      { rootMargin }
    )

    observer.observe(sentinelRef.current)

    return () => observer.disconnect()
  }, [enabled, onLoadMore, rootMargin])

  return sentinelRef
}
