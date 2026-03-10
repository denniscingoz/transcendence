import { useState } from 'react'
import { useAddFriend, useFriends, useRemoveFriend } from '../hooks/useFriends'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'

// Mock friends data
const mockFriends = [
  {
    id: '1',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
  {
    id: '2',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: false,
  },
  {
    id: '3',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
  {
    id: '4',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: false,
  },
  {
    id: '5',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
]

export function FriendsPage() {
  const { t } = useTranslation()
  const { data: apiData, isLoading, error } = useFriends()
  const add = useAddFriend()
  const remove = useRemoveFriend()

  // Use API data if available, otherwise mock
  const friends = Array.isArray(apiData) ? apiData : mockFriends

  const [followingState, setFollowingState] = useState<Record<string, boolean>>(
    Object.fromEntries(friends.map((f) => [f.id, f.isFollowing ?? true]))
  )

  const toggleFollow = (id: string) => {
    setFollowingState((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Likes modal style list */}
        <div className="panel">
          <h2 className="text-xl font-bold tracking-wider mb-6">LIKES</h2>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-4 p-4 bg-gray-200 rounded-2xl"
              >
                {/* Avatar */}
                <img
                  src={friend.avatarUrl ?? 'https://placehold.co/80x80'}
                  alt={friend.displayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-red-200"
                />

                {/* Name and username */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{friend.displayName}</div>
                  <div className="text-sm text-gray-500">@{friend.username}</div>
                </div>

                {/* Follow button */}
                <button
                  onClick={() => toggleFollow(friend.id)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    followingState[friend.id]
                      ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {followingState[friend.id] ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}