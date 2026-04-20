import { useMemo, useState, useEffect } from 'react'
import { useUpdateProfile, useUploadAvatar, useOtherProfilePostPreviews, useOtherProfile } from '../hooks/useProfile'
import { useAcceptFriendRequest, useDeclineFriendRequest} from '../hooks/useFriendRequest'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'
import { PostDetailModal } from '../components/modals/PostDetailModal'
import { ProtectedPostThumbPreview } from '../components/ui/ProtectedPostThumb'
import { useAddFriend, useRemoveFriend } from '../hooks/useFriends'
import { FriendshipStatus } from '../types/api'



export function OtherProfilePage() {
  const { t } = useTranslation()
  const { userId } = useParams<{ userId: string }>()
  const { data: apiData, isLoading, error } = useOtherProfile(userId ?? '')
  const update = useUpdateProfile()
  const upload = useUploadAvatar()
  const [friendshipState, setFriendshipState] = useState<Record<string, FriendshipStatus>>({})
  const acceptFriendRequestMutation = useAcceptFriendRequest()
  const declineFriendRequestMutation = useDeclineFriendRequest()

  const data = apiData //?? mockProfile

  const profileId = data?.id ?? ''
  const status = friendshipState[data?.id ?? 'none']
  const add = useAddFriend()
  const remove = useRemoveFriend()
  


  useEffect(() => {
  if (!apiData) return

  setFriendshipState((prev) => ({
    ...prev,
    [apiData.id]: apiData.friendShipStatus,
  }))
  }, [apiData])

  const {
  data: profilePostsPageFromApi,
  isLoading: isPostsLoading,
  error: postsError,
} = useOtherProfilePostPreviews(profileId, 20, null, status === 'friends')
  const posts = profilePostsPageFromApi?.items //?? mockPosts
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Use API data if available, otherwise mock

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  )

  
  const toggleFriendship = async (id: string) => {
    const currentStatus = friendshipState[id] 

     console.log('toggle ')
    if (currentStatus === 'friends') {
      try {
          console.log('remove ')
        await remove.mutateAsync(id)
        setFriendshipState((prev) => ({ ...prev, [id]: 'none' }))
      } catch (error) {
        console.error('Failed to remove friend:', error)
      }
      return
    }







    if (currentStatus === 'none') {
      try {
        console.log('add ')
        await add.mutateAsync(id)
        setFriendshipState((prev) => ({ ...prev, [id]: 'outgoingRequest' }))
      } catch (error) {
        console.error('Failed to send friend request:', error)
      }
      return
    }

    if (currentStatus === 'outgoingRequest') {
       console.log('outgoing request ')
      return
    }
  }
  
  const acceptFriendRequest = async (profileId: string) => {
  if (!profileId) return

  await acceptFriendRequestMutation.mutateAsync(profileId)

  setFriendshipState(prev => ({
    ...prev,
    [profileId]: 'friends',
  }))
}

const declineFriendRequest = async (profileId: string) => {
  if (!profileId) return

  await declineFriendRequestMutation.mutateAsync(profileId)

  setFriendshipState(prev => ({
    ...prev,
    [profileId]: 'none',
  }))
}


  return (
    <div className="min-h-screen bg-white pb-24">
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-start md:items-center mb-8">
          {/* Avatar with ring */}
          <div className="relative">
            <img
              src={
                    previewUrl ??
                    (data?.avatarUrl ? `${import.meta.env.VITE_API_BASE_URL}${data.avatarUrl}` : 'https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg')
                  }
              alt={data?.fullName ?? 'Profile Avatar Failed to Load'}
              className="w-32 h-32 rounded-full object-cover ring-2 ring-gray-300 ring-offset-4"
            />
          </div>

          {/* Profile info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{data?.fullName || 'Full Name'}</h2>
              <p className="text-gray-500">@{data?.username ?? 'username'}</p>
            </div>

            {data?.bio && (
              <p className="text-gray-700 whitespace-pre-line max-w-md">{data?.bio}</p>
            )}
          </div>

          {/* Stats and action buttons */}
          <div className="flex  flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-gray-900">{data?.postsCount ?? -1}</div>
              <div className="text-sm text-gray-500">{t('profile.posts')}</div>
              <div className="text-xl font-bold text-gray-900">{data?.friendsCount ?? -1}</div>
              <div className="text-sm text-gray-500">{t('profile.friends')}</div>
            </div>


                <div className="flex gap-3 mb-8">
                  {status === 'incomingRequest' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => acceptFriendRequest(profileId)}
                        disabled={!profileId}
                        className="rounded-full bg-blue-500 px-12 py-2 font-medium text-white transition-colors hover:bg-blue-600"
                        >
                        {t('friends.accept')}
                      </button>
                  
                      <button
                        type="button"
                        onClick={() => declineFriendRequest(profileId)}
                        disabled={!profileId}
                        className="rounded-full bg-gray-300 px-12 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-400"
                        >
                        {t('friends.decline')}
                      </button>
                    </>
                  ) : (
                    <button
                    type="button"
                    onClick={() => toggleFriendship(profileId)}
                    disabled={!profileId || status === 'outgoingRequest'}
                    className={`rounded-full px-12 py-2 font-medium transition-colors ${
                      status === 'friends'
                      ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      : status === 'outgoingRequest'
                      ? 'cursor-default bg-gray-200 text-yellow-800'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    >
                      {status === 'friends'
                        ? t('friends.friends')
                        : status === 'outgoingRequest'
                        ? t('friends.requested')
                        : t('friends.addFriend')}
                    </button>
                  )}
                </div>


            </div>


        </div>

        {/* Posts grid and Create*/}
        <div className="grid grid-cols-2 gap-4">
          {/* {the Post Create} */}
            {/* {the Posts Grid} */}
          {posts?.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              >
                <ProtectedPostThumbPreview fileUrl={post.imageUrl} contentType={post.contentType}/>
              </div>
            ))}
        </div>

        {selectedPostId && (
          <PostDetailModal
            postId={selectedPostId}
            onClose={() => setSelectedPostId(null)}
          />
        )}
      </main>

      <BottomNav active="profile" />
    </div>
  )
}

