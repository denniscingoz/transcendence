import { useEffect, useState } from 'react'
import { BottomNav } from '../components/BottomNav'
import { PostDetailModal } from '../components/modals/PostDetailModal'
import { useFeed } from '../hooks/useFeed'
import { mockFeedPosts } from '../mocks/posts'
import type { PostDto } from '../types/api'
import { ProtectedPostThumbContent } from '../components/ui/ProtectedPostThumb'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useTranslation } from 'react-i18next'

export function FeedPage() {
  const { data, isLoading, error } = useFeed()
  const { t } = useTranslation()

  const [postsFeed, setPostsFeed] = useState<PostDto[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const navigate = useNavigate()

  useEffect(() => {
    setPostsFeed(data?.items ?? []) // ?? mockFeedPosts)
  }, [data])

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
              <button onClick={() => navigate(`/profile/${post.authorId}`)} className="flex items-center gap-3">
                <img
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  src={post.authorAvatarUrl ? `${import.meta.env.VITE_API_BASE_URL}${post.authorAvatarUrl}` : 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'}
                  alt={post.authorUsername}
                />
                
                <div>
                  
                  <div className="font-semibold text-gray-900">
                    {post.authorUsername}
                  </div>

                </div>


              </button>


               <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden">
                 <ProtectedPostThumbContent fileUrl={post.imageUrl} contentType={post.contentType} />
              </div>
              
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

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function HeartFilledIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}