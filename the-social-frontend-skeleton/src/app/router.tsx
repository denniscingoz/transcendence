import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth } from '../auth/RequireAuth'
import { Layout } from '../components/Layout'
import { AuthPage } from '../pages/AuthPage'
import { ProfilePage } from '../pages/ProfilePage'
import { FriendsPage } from '../pages/FriendsPage'
import { ChatPage } from '../pages/ChatPage'
import { FeedPage } from '../pages/FeedPage'
import { EditProfilePage } from '../pages/EditProfilePage'
import { SettingsPage } from '../pages/SettingsPage'
import { PostCreatePage } from '../pages/PostCreatePage'
import { OtherProfilePage } from '../pages/OtherProfilePage'
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage'
import { TermsOfServicePage} from '../pages/TermsOfServicePage'
// import { PostDetailPage} from '../pages/PostDetailPage'
//import { SearchPage } from '../pages/SearchPage'

export const router = createBrowserRouter([
  
  { path: '/signin', element: <AuthPage /> },
  { path: '/terms-service', element: <TermsOfServicePage /> },
  { path: '/privacy-policy', element: <PrivacyPolicyPage /> },
  
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/feed" replace /> },
      { path: '/signin', element: <AuthPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/feed', element: <FeedPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/friends', element: <FriendsPage /> },
          { path: '/chat', element: <ChatPage /> },
          { path: '/edit-profile', element: <EditProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: '/post-create', element: <PostCreatePage />},
          { path: '/profile/:userId', element: <OtherProfilePage /> },
          // { path: '/search', element: <SearchPage /> },
        ],
      },
    ],
  },
])