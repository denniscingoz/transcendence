import { useState, useEffect, useMemo } from 'react'
import { useAddFriend, useFriends, useRemoveFriend } from '../hooks/useFriends'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '../components/BottomNav'
import { useNavigate } from 'react-router-dom'

type FriendshipStatus = 'friends' | 'requested' | 'none'

export function FriendsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const add = useAddFriend()
  const remove = useRemoveFriend()
  
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFriends()

  // Memoize so the array reference is stable across renders that don't change pages
  const friends = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  )

  const [friendshipState, setFriendshipState] = useState<Record<string, FriendshipStatus>>({})

  useEffect(() => {
    if (friends.length === 0) return
    setFriendshipState((prev) => {
      const next = { ...prev }
      for (const friend of friends) {
        if (!(friend.id in next)) next[friend.id] = 'friends'
      }
      return next
    })
  }, [friends])

  function handleClose() {
    navigate(-1)
  }

  const toggleFriendship = async (id: string) => {
    const currentStatus = friendshipState[id] ?? 'friends'

    if (currentStatus === 'friends') {
      try {
        await remove.mutateAsync(id)
        setFriendshipState((prev) => ({ ...prev, [id]: 'none' }))
      } catch (e) {
        console.error('Failed to remove friend:', e)
      }
      return
    }

    if (currentStatus === 'none') {
      try {
        await add.mutateAsync(id)
        setFriendshipState((prev) => ({ ...prev, [id]: 'requested' }))
      } catch (e) {
        console.error('Failed to send friend request:', e)
      }
      return
    }

    if (isLoading) return <div className="p-8">Loading…</div>
    if (error) return <div className="p-8">Error: {error.message}</div>
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
              const status = friendshipState[friend.id] ?? 'friends'

                  return (
                  <div
                  key={friend.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/profile/${friend.id}`)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      navigate(`/profile/${friend.id}`)
                    }
                  }}
                  className="flex cursor-pointer items-center gap-4 rounded-2xl bg-gray-100 p-4 hover:bg-gray-200"
                  >
                    <img
                    src={
                      friend?.avatarUrl
                        ? `${import.meta.env.VITE_API_BASE_URL}${friend.avatarUrl}`
                        : 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg'
                    }
                    alt={friend.fullName}
                    className="h-14 w-14 rounded-full border-2 border-red-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900">{friend.fullName}</div>
                    <div className="text-sm text-gray-500">@{friend.username}</div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFriendship(friend.id)
                    }}
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
            {hasNextPage && (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mx-auto mt-2 block rounded-full bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                {isFetchingNextPage
                  ? t('friends.loading') ?? 'Loading…'
                  : t('friends.loadMore') ?? 'Load more'}
              </button>
            )}
          </div>
        </div>
      </main>

      <BottomNav onSearchClick={() => {}} />
    </div>
  )
}