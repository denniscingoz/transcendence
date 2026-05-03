import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePostLikes } from '../../hooks/usePost'
import type { LikesPreviewDto } from '../../types/api'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'

type LikesModalProps = {
  postId: string
  onClose: () => void
}

export function LikesModal({ postId, onClose }: LikesModalProps) {
  const { t } = useTranslation()
  const {
    data: likesData,
    isLoading,
    isFetching,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePostLikes(postId, 20)
  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

  const likes = useMemo(() => {
    const merged = likesData?.pages.flatMap((page) => page.items) ?? []
    const seen = new Set<string>()
    return merged.filter((item) => {
      if (seen.has(item.authorId)) {
        return false
      }
      seen.add(item.authorId)
      return true
    })
  }, [likesData])

  const loadMoreLikes = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return
    }
    void fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const sentinelRef = useInfiniteScroll({
    enabled: !!hasNextPage && !isLoading && !isFetchingNextPage,
    onLoadMore: loadMoreLikes,
    rootMargin: '150px',
  })

  const getAvatarSrc = (avatarPath: string | null) => {
    if (!avatarPath) {
      return 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'
    }

    if (/^https?:\/\//i.test(avatarPath)) {
      return avatarPath
    }

    if (!apiBase) {
      return avatarPath
    }

    if (avatarPath.startsWith('/')) {
      return `${apiBase}${avatarPath}`
    }

    return `${apiBase}/${avatarPath}`
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
          className="panel relative w-full max-w-lg max-h-[85vh] overflow-hidden bg-white p-6"
      >
        <div className="mb-8 flex items-start justify-between">
          <h2 className="text-2xl font-semibold text-text">{t('postdetail.likes')}</h2>

          <button
            type="button"
            onClick={onClose}
            className="btn-ghost flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-text hover:bg-gray-100"
            aria-label="Close likes"
          >
            x
          </button>
        </div>

        <div className="min-h-0 max-h-[65vh] space-y-2 overflow-y-auto">
          {isLoading && <div>{t('postdetail.loading')}</div>}

          {error && !isLoading && <div>{t('postdetail.postnotfound')}</div>}

          {!isLoading && !error && likes.length === 0 && (
            <div className="text-sm text-gray-500">No likes yet.</div>
          )}

          {!isLoading && !error && likes.map((user) => {
            return (
              <div
                key={user.id}
                className="flex items-center gap-4 rounded-2xl bg-gray-200 p-4"
              >
                <img
                  src={getAvatarSrc(user.authorProfileImageUrl)}
                  alt={user.authorUsername}
                  className="h-14 w-14 rounded-full border-2 border-red-200 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900">{user.authorFullName || user.authorUsername}</div>
                  <div className="text-sm text-gray-500">@{user.authorUsername}</div>
                </div>

              </div>
            )
          })}

          {!isLoading && !error && hasNextPage && (
            <div className="pt-2">
              <button
                type="button"
                onClick={loadMoreLikes}
                disabled={isFetching}
                className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {isFetching ? t('postdetail.loading') : 'Load more'}
              </button>
            </div>
          )}

          {hasNextPage && <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />}
        </div>
      </div>
    </div>
  )
}