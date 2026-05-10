import { useCallback, useEffect, useMemo, useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { PostDetailModal } from '../components/modals/PostDetailModal'
import { useFeed } from '../hooks/useFeed'
import type { PostDto } from '../types/api'
import { ProtectedPostThumbContent } from '../components/ui/ProtectedPostThumb'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useTranslation } from 'react-i18next'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { HeartIcon } from '../components/icons/HeatIcon'
import { HeartFilledIcon } from '../components/icons/HeartFilledIcon'
import { CommentIcon } from '../components/icons/CommentIcon'
import { UnknownProfileAvatar } from '../components/icons/UnknownProfileAvatar'

export function FeedPage() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(20)
  const { t } = useTranslation()

  const [postsFeed, setPostsFeed] = useState<PostDto[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const navigate = useNavigate()

  const allPosts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  )

  useEffect(() => {
    setPostsFeed(allPosts)
  }, [allPosts])

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return
    }
    void fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const sentinelRef = useInfiniteScroll({
    enabled: !!hasNextPage && !isLoading && !isFetchingNextPage,
    onLoadMore: loadMore,
  })

  const updateLikeState = (postId: string) => {
  setPostsFeed((prev) =>
    prev.map((post) =>
      post.id === postId
        ? {
            ...post,
            isLikedByCurrentUser: !post.isLikedByCurrentUser,
            likesCount: post.isLikedByCurrentUser
              ? post.likesCount - 1
              : post.likesCount + 1,
          }
        : post
    )
  )
}

const toggleLike = async (postId: string) => {
  const post = postsFeed.find((p) => p.id === postId)
  if (!post) return

  const wasLiked = post.isLikedByCurrentUser

  updateLikeState(postId)

  try {
    if (wasLiked) {
      await api.delete(`/posts/${postId}/likes`)
    } else {
      await api.post(`/posts/${postId}/likes`)
    }
  } catch (error) {
    updateLikeState(postId) // rollback by toggling back
    console.error('Failed to toggle like', error)
  }
}


  const posts = postsFeed

  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    return n.toString()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center py-12 text-red-500">Failed to load feed.</div>
        </main>
        <BottomNav active="home" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : ( (posts?.length ?? 0) ?
          posts.map((post) => (
            <article key={post.id} className="space-y-4">
              {/* Top part with avatar etc */}
              <button onClick={() => navigate(`/profile/${post.authorId}`)} className="flex items-center gap-3">
                { post.authorAvatarUrl ? <img
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  src={`${import.meta.env.VITE_API_BASE_URL}${post.authorAvatarUrl}`}
                  alt={post.authorUsername}
                />
                  : (<UnknownProfileAvatar className="h-10 w-10 rounded-full" /> )
               }
                
                {/* Username */}
                <div>
                  
                  <div className="font-semibold text-gray-900">
                    {post.authorUsername}
                  </div>

                </div>


              </button>

              {/* IMAGEorVIDEO */}
               <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden">
                 <ProtectedPostThumbContent fileUrl={post.imageUrl} contentType={post.contentType} />
              </div>
              {/* LIKE and Comment AREA */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-2 group"
                >
                  {post.isLikedByCurrentUser ? (
                    <HeartFilledIcon className="w-7 h-7 text-red-500" />
                  ) : (
                    <HeartIcon className="w-7 h-7 text-gray-700 group-hover:text-red-500 transition-colors" />
                  )}
                  <span className="text-sm text-gray-600">
                    {formatCount(post.likesCount)}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedPostId(post.id)}
                  className="flex items-center gap-2 group"
                >
                  <CommentIcon className="w-7 h-7 text-gray-700 group-hover:text-gray-900 transition-colors" />
                </button>
              </div>

              <div className="border-t border-gray-100" />
            </article>
          )) : <div className="text-center py-12 text-gray-500">{t('feed.nothingtoshow')}</div>
        )}

        {isFetchingNextPage && (
          <div className="text-center py-4 text-sm text-gray-500">Loading more...</div>
        )}

        {hasNextPage && <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />}
      </main>

      {selectedPostId && (
        <PostDetailModal
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}

      <BottomNav active="home" />
    </div>
  )
}

