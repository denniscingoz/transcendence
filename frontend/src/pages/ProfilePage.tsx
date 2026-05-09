import { useCallback, useMemo, useState } from 'react'
import { useMyProfile, useUpdateProfile, useUploadAvatar, useMyProfilePostPreviews } from '../hooks/useProfile'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '../components/BottomNav'
import { Link } from 'react-router-dom'
import { PostDetailModal } from '../components/modals/PostDetailModal'
import { useNavigate } from 'react-router-dom'
import { ProtectedPostThumbPreview } from '../components/ui/ProtectedPostThumb'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { UnknownProfileAvatar } from '../components/icons/UnknownProfileAvatar'

export function ProfilePage() {
  const { t } = useTranslation()
  const { data: apiData, isLoading, error } = useMyProfile()
  const update = useUpdateProfile()
  const upload = useUploadAvatar()
  const navigate = useNavigate()
  const {
    data: profilePostsPageFromApi,
    isLoading: isPostsLoading,
    error: postsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyProfilePostPreviews(20)
  const posts = useMemo(
    () => profilePostsPageFromApi?.pages.flatMap((page) => page.items) ?? [],
    [profilePostsPageFromApi]
  )
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Use API data if available, otherwise mock
  const data = apiData //?? mockProfile

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  )

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return
    }
    void fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const sentinelRef = useInfiniteScroll({
    enabled: !!hasNextPage && !isPostsLoading && !isFetchingNextPage,
    onLoadMore: loadMore,
  })

  return (
    <div className="min-h-screen bg-white pb-24">
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-start md:items-center mb-8">
          {/* Avatar with ring */}
          <div className="relative">
            { data?.avatarUrl ? <img
              src={
                    previewUrl ??
                    (`${import.meta.env.VITE_API_BASE_URL}${data.avatarUrl}`)
                  }
              alt={data?.fullName ?? 'Profile Avatar Failed to Load'}
              className="w-32 h-32 rounded-full object-cover ring-2 ring-gray-300 ring-offset-4"
            />
            : (<UnknownProfileAvatar className="w-32 h-32 rounded-full object-cover ring-2 ring-gray-300 ring-offset-4" /> )}
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
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-gray-900">{data?.postsCount ?? -1}</div>
              <div className="text-sm text-gray-500">{t('profile.posts')}</div>
            </div>
            <div className="flex gap-3 mb-8">
               <Link
                to="/settings"
                className="btn-ghost min-w-[250px] h-[30px] flex items-center justify-center"
                >
                {t('settings.Settings')}
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-gray-900">{data?.friendsCount ?? -1}</div>
              <Link to="/friends" className="text-sm text-gray-500">
                {t('profile.friends')}
              </Link>
            </div>
            <div className="flex gap-3 mb-8">
              <Link
                to="/edit-profile"
                className="btn-ghost min-w-[250px] h-[30px] flex items-center justify-center"
                >
                {t('profile.editprofile')}
              </Link>
            </div>
          </div>
        </div>

        {/* Posts grid and Create*/}
        <div className="grid grid-cols-2 gap-4">
          {/* {the Post Create} */}
          <button 
                type="button"
                onClick={() => navigate('/post-create')}
                className="aspect-square bg-gray-300 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors">
            <PlusIcon className="w-16 h-16 text-white" />
          </button>

            {/* {the Posts Grid} */}
          {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              >
                <ProtectedPostThumbPreview fileUrl={post.imageUrl} contentType={post.contentType} />
              </div>
            ))}

          {hasNextPage && <div ref={sentinelRef} className="col-span-2 h-1 w-full" aria-hidden="true" />}
        </div>

        {isFetchingNextPage && (
          <div className="py-4 text-center text-sm text-gray-500">Loading more posts...</div>
        )}

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

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}