import { useState, useEffect } from 'react'
import { useAddFriend, useFriends, useRemoveFriend } from '../hooks/useFriends'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '../components/BottomNav'
import { useNavigate } from 'react-router-dom'

type FriendshipStatus = 'friends' | 'requested' | 'none'

export function FriendsPage() {
  const { t } = useTranslation()
  const { data: apIData, isLoading, error } = useFriends()
  const add = useAddFriend()
  const remove = useRemoveFriend()
  const navigate = useNavigate()

  const friends = apIData ?? []

  const [friendshipState, setFriendshipState] = useState<Record<string, FriendshipStatus>>({})

  useEffect(() => {
    if (!apIData) return

    setFriendshipState((prev) => {
      const next = { ...prev }

      for (const friend of apIData) {
        if (!(friend.Id in next)) {
          next[friend.Id] = 'friends'
        }
      }

      return next
    })
  }, [apIData])

  function handleClose() {
    navigate(-1)
  }

  const toggleFriendship = async (id: string) => {
    const currentStatus = friendshipState[id] ?? 'friends'

    if (currentStatus === 'friends') {
      try {
        await remove.mutateAsync(id)
        setFriendshipState((prev) => ({ ...prev, [id]: 'none' }))
      } catch (error) {
        console.error('Failed to remove friend:', error)
      }
      return
    }

    if (currentStatus === 'none') {
      try {
        await add.mutateAsync(id)
        setFriendshipState((prev) => ({ ...prev, [id]: 'requested' }))
      } catch (error) {
        console.error('Failed to send friend request:', error)
      }
      return
    }

    if (currentStatus === 'requested') {
      return
    }
  }

  return (
    <div className="h-[calc(100dvh-250px)] overflow-hidden bg-white">
      <main className="mx-auto h-full max-w-2xl px-4 py-6">
        <div className="panel flex h-[85%] flex-col overflow-hidden">
          <div className="mb-8 flex items-start justify-between">
            <h1 className="text-2xl font-semibold text-text">{t('friends.friends')}</h1>

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
            {friends.map((friend) => {
              const status = friendshipState[friend.Id] ?? 'friends'

              return (
                <div
                  key={friend.Id}
                  className="flex items-center gap-4 rounded-2xl bg-gray-200 p-4"
                >
                  <img
                    src={friend.AvatarUrl ?? 'https://placehold.co/80x80'}
                    alt={friend.FullName}
                    className="h-14 w-14 rounded-full border-2 border-red-200 object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900">{friend.FullName}</div>
                    <div className="text-sm text-gray-500">@{friend.Username}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFriendship(friend.Id)}
                    disabled={status === 'requested'}
                    className={`rounded-full px-6 py-2 font-medium transition-colors ${
                      status === 'friends'
                        ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        : status === 'requested'
                        ? 'cursor-default bg-gray-200 text-yellow-800'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                     {status === 'friends'
                      ? t('friends.friends')
                      : status === 'requested'
                      ? t('friends.requested')
                      : t('friends.addFriend')} 
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <BottomNav onSearchClick={() => {}} />
    </div>
  )
}