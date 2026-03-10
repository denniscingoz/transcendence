import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import api from '../api/axios'
import { BottomNav } from '../components/BottomNav'
import { Header } from '../components/Header'

type PostDto = {
  id: string
  authorName: string
  authorUsername?: string
  authorLocation?: string
  authorAvatarUrl?: string | null
  imageUrl: string
  likesCount: number
  commentsCount: number
  isLiked?: boolean
}

async function getFeed(): Promise<PostDto[]> {
  const { data } = await api.get<PostDto[]>('/feed')
  return data
}

// Mock data for demo
const mockPosts: PostDto[] = [
  {
    id: '1',
    authorName: 'Dipprokash Sardar',
    authorUsername: 'dipp_sardar',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
    likesCount: 7500,
    commentsCount: 425,
    isLiked: true,
  },
  {
    id: '2',
    authorName: 'Joyprokash Sardar',
    authorUsername: 'joy_sardar',
    authorLocation: 'Mednipur',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=800&h=600&fit=crop',
    likesCount: 7500,
    commentsCount: 425,
    isLiked: false,
  },
]

export function FeedPage() {
  const { data, isLoading } = useQuery({ queryKey: ['feed'], queryFn: getFeed })
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(['1']))

  const posts = data ?? mockPosts

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }

  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    return n.toString()
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="space-y-4">
              {/* Author header */}
              <div className="flex items-center gap-3">
                <img
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  src={post.authorAvatarUrl ?? 'https://placehold.co/80x80'}
                  alt={post.authorName}
                />
                <div>
                  <div className="font-semibold text-gray-900">{post.authorName}</div>
                  {post.authorLocation && (
                    <div className="text-sm text-gray-500">{post.authorLocation}</div>
                  )}
                </div>
              </div>

              {/* Post image */}
              <img
                className="w-full aspect-[4/3] object-cover rounded-2xl"
                src={post.imageUrl}
                alt=""
              />

              {/* Actions */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-2 group"
                >
                  {likedPosts.has(post.id) ? (
                    <HeartFilledIcon className="w-7 h-7 text-red-500" />
                  ) : (
                    <HeartIcon className="w-7 h-7 text-gray-700 group-hover:text-red-500 transition-colors" />
                  )}
                  <span className="text-sm text-gray-600">{formatCount(post.likesCount)}</span>
                </button>

                <button className="flex items-center gap-2 group">
                  <CommentIcon className="w-7 h-7 text-gray-700 group-hover:text-gray-900 transition-colors" />
                  <span className="text-sm text-gray-600">{formatCount(post.commentsCount)}</span>
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />
            </article>
          ))
        )}
      </main>

      <BottomNav active="home" />
    </div>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}