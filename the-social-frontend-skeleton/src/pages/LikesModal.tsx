import { useState } from 'react'

interface User {
  id: string
  displayName: string
  username: string
  avatarUrl?: string
  isFollowing?: boolean
}

interface LikesModalProps {
  isOpen: boolean
  onClose: () => void
  users: User[]
  onFollowToggle?: (userId: string, isFollowing: boolean) => void
}

export function LikesModal({ isOpen, onClose, users, onFollowToggle }: LikesModalProps) {
  const [followingState, setFollowingState] = useState<Record<string, boolean>>(
    Object.fromEntries(users.map((u) => [u.id, u.isFollowing ?? false]))
  )

  if (!isOpen) return null

  const toggleFollow = (userId: string) => {
    const newState = !followingState[userId]
    setFollowingState((prev) => ({ ...prev, [userId]: newState }))
    onFollowToggle?.(userId, newState)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-300 rounded-3xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-bold tracking-wider">LIKES</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-400/30 rounded-full transition-colors"
          >
            <XCircleIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* User list */}
        <div className="px-4 pb-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 p-4 bg-gray-200 rounded-2xl"
            >
              {/* Avatar */}
              <img
                src={user.avatarUrl ?? 'https://placehold.co/80x80'}
                alt={user.displayName}
                className="w-12 h-12 rounded-full object-cover border-2 border-red-200"
              />

              {/* Name and username */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{user.displayName}</div>
                <div className="text-sm text-gray-500">{user.username}</div>
              </div>

              {/* Follow button */}
              <button
                onClick={() => toggleFollow(user.id)}
                className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                  followingState[user.id]
                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {followingState[user.id] ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  )
}