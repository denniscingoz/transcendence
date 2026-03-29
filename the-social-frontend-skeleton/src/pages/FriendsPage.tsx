import { useState } from 'react'
import { useAddFriend, useFriends, useRemoveFriend } from '../hooks/useFriends'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'
import { useNavigate } from 'react-router-dom'
// Mock friends data
const mockFriends = [
  {
    id: '1',
    displayName: 'Lena Weiss',
    username: 'lena.moves',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
  {
    id: '2',
    displayName: 'Emir Kaya',
    username: 'emir.codes',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    isFollowing: true,
    isOnline: false,
  },
  {
    id: '3',
    displayName: 'Sofia Marin',
    username: 'sofia.frames',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
  {
    id: '4',
    displayName: 'Noah Fischer',
    username: 'noah.cooks',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
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
  {
    id: '6',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
    {
    id: '7',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
      {
    id: '8',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
        {
    id: '9',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
          {
    id: '10',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
          {
    id: '11',
    displayName: 'Dipprokash Sardar',
    username: 'dipp_sardar',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isFollowing: true,
    isOnline: true,
  },
          {
    id: '12',
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
  const navigate = useNavigate()
  // Use API data if available, otherwise mock
  const friends = Array.isArray(apiData) && apiData.length > 0 ? apiData : mockFriends

  const [followingState, setFollowingState] = useState<Record<string, boolean>>(
    Object.fromEntries(friends.map((f) => [f.id, f.isFollowing ?? true]))
  )
  function handleClose() {
    navigate(-1)
  }

  const toggleFollow = (id: string) => {
    setFollowingState((prev) => ({ ...prev, [id]: !prev[id] }))
  }

return (
  <div className="h-[calc(100dvh-250px)] overflow-hidden bg-white">
    <main className="mx-auto h-full max-w-2xl px-4 py-6">
      <div className="panel flex h-[85%] flex-col overflow-hidden">
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-2xl font-semibold text-text">Friends</h1>

          <button
            type="button"
            onClick={handleClose}
            className="btn-ghost flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-text hover:bg-gray-100"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
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

      <BottomNav onSearchClick={() => {}} />
    </div>
  )
}