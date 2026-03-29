import { useMemo, useState } from 'react'
import { useMyProfile, useUpdateProfile, useUploadAvatar, useMyProfilePostPreviews } from '../hooks/useProfile'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '../components/BottomNav'
import { Link } from 'react-router-dom'
import { mockPosts } from '../mocks/posts'
import { PostDetailModal } from '../components/modals/PostDetailModal'
import { CursorPageDto, ProfilePostPreviewDto } from '../types/api'
import { useEffect} from 'react'
import { getMyProfilePostPreviews } from '../api/profile.api'
import { EditProfilePage } from './EditProfilePage'

// Mock profile data
const mockProfile = {

  //   Id: string
  // Username: string
  // FullName: string
	// Email: string
	// Bio: string | null
  // AvatarUrl: string | null 
  // PostsCount: number
  // FriendsCount: number
  Id: '1',
  FullName: 'celina',
  Username: 'Ma_woman',
  Bio: "Welcome to my profile!!\nI am a photographer with a passion to nature. Hope you like it!!",
  AvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  PostsCount: 100,
  FriendsCount: 720,
  Email: 'user@example.com',
}

export function ProfilePage() {
  const { t } = useTranslation()
  const { data: apiData, isLoading, error } = useMyProfile()
  const update = useUpdateProfile()
  const upload = useUploadAvatar()

// const [profilePostsPageFromApi, setProfilePostsPageFromApi] =
  // useState<CursorPageDto<ProfilePostPreviewDto> | null>(null)

    const {
  data: profilePostsPageFromApi,
  isLoading: isPostsLoading,
  error: postsError,
} = useMyProfilePostPreviews(20, null)


// I need to change it to hook and consider the cursor for scrolling  and take!!!!
// const { data: profilePostsPageFromApi, isLoading, error } = useMyProfilePostPreviews()
// useEffect(() => {
//   async function loadProfilePosts() {
//     try {
//       const data = await getMyProfilePostPreviews()
//       setProfilePostsPageFromApi(data)
//     } catch (error) {
//       console.error(error)
//     }
//   }

//   loadProfilePosts()
// }, [])

  const posts = profilePostsPageFromApi?.Items ?? mockPosts

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Use API data if available, otherwise mock
  const data = apiData ?? mockProfile

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile]
  )

  return (
    <div className="min-h-screen bg-white pb-24">
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-start md:items-center mb-8">
          {/* Avatar with ring */}
          <div className="relative">
            <img
              src={previewUrl ?? data.AvatarUrl ?? 'https://placehold.co/200x200'}
              alt={data.FullName}
              className="w-32 h-32 rounded-full object-cover ring-2 ring-gray-300 ring-offset-4"
            />
          </div>

          {/* Profile info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{data.FullName}</h2>
              <p className="text-gray-500">@{data.Username ?? 'username'}</p>
            </div>

            {data.Bio && (
              <p className="text-gray-700 whitespace-pre-line max-w-md">{data.Bio}</p>
            )}
          </div>

          {/* Stats and action buttons */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-gray-900">{data.PostsCount ?? 0}</div>
              <div className="text-sm text-gray-500">posts</div>
            </div>
            <div className="flex gap-3 mb-8">
               <Link
                to="/settings"
                className="btn-ghost min-w-[250px] h-[30px] flex items-center justify-center"
                >
                Settings
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-gray-900">{data.FriendsCount ?? 0}</div>
              <Link to="/friends" className="text-sm text-gray-500">
                friends
              </Link>
            </div>
            <div className="flex gap-3 mb-8">
              <Link
                to="/edit-profile"
                className="btn-ghost min-w-[250px] h-[30px] flex items-center justify-center"
                >
                Edit profile
              </Link>
            </div>
          </div>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square bg-gray-300 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors">
            <PlusIcon className="w-16 h-16 text-white" />
          </div>

          {posts.map((post) => (
            <div
              key={post.Id}
              onClick={() => setSelectedPostId(post.Id)}
              className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            >
              {post.ImageUrl ? (
                <img
                  src={post.ImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
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