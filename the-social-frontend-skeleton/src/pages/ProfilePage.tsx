import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMyProfile, useUpdateProfile, useUploadAvatar } from '../hooks/useProfile'
import type { ProfileDto } from '../types/api'
import { useTranslation } from 'react-i18next'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'

// Mock profile data
const mockProfile = {
  id: '1',
  displayName: 'My own Profile',
  username: 'My_own_profile',
  bio: "Welcome to my profile!!\nI am a photographer with a passion to nature. Hope you like it!!",
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  postsCount: 100,
  followersCount: 720,
  followingCount: 1200,
  email: 'user@example.com',
}

// Mock posts grid
const mockPosts = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&h=400&fit=crop' },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop' },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=400&h=400&fit=crop' },
  { id: '4', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop' },
]

export function ProfilePage() {
  const { t } = useTranslation()
  const { data: apiData, isLoading, error } = useMyProfile()
  const update = useUpdateProfile()
  const upload = useUploadAvatar()

  // Use API data if available, otherwise mock
  const data = apiData ?? mockProfile

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile])

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center mb-8">
          {/* Avatar with ring */}
          <div className="relative">
            <img
              src={previewUrl ?? data.avatarUrl ?? 'https://placehold.co/200x200'}
              alt={data.displayName}
              className="w-32 h-32 rounded-full object-cover ring-4 ring-teal-500 ring-offset-4"
            />
          </div>

          {/* Profile info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{data.displayName}</h2>
              <p className="text-gray-500">@{data.username ?? 'username'}</p>
            </div>

            {data.bio && (
              <p className="text-gray-700 whitespace-pre-line max-w-md">{data.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-xl font-bold text-gray-900">{data.postsCount ?? 0}</div>
              <div className="text-sm text-gray-500">posts</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{data.followersCount ?? 0}</div>
              <div className="text-sm text-gray-500">followers</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{data.followingCount ?? 0}</div>
              <div className="text-sm text-gray-500">following</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-8">
          <button className="btn-ghost flex-1 max-w-[200px]">Edit profile</button>
          <button className="btn-ghost flex-1 max-w-[200px]">Settings</button>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Add new post placeholder */}
          <div className="aspect-square bg-gray-300 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors">
            <PlusIcon className="w-16 h-16 text-white" />
          </div>

          {/* Posts */}
          {mockPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img
                src={post.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </main>

      <BottomNav active="profile" />
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}