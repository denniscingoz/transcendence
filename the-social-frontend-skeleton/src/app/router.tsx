import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth } from '../auth/RequireAuth'
import { Layout } from '../components/Layout'
import { LoginPage } from '../pages/LoginPage'
import { ProfilePage } from '../pages/ProfilePage'
import { FriendsPage } from '../pages/FriendsPage'
import { ChatPage } from '../pages/ChatPage'
import { FeedPage } from '../pages/FeedPage'
import { EditProfilePage } from '../pages/EditProfilePage'
import { SettingsPage } from '../pages/SettingsPage'
import { PostDetailPage} from '../pages/PostDetailPage'
//import { SearchPage } from '../pages/SearchPage'

export const router = createBrowserRouter([
  
  { path: '/login', element: <LoginPage /> },
  
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/feed" replace /> },
      { path: '/login', element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/feed', element: <FeedPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/friends', element: <FriendsPage /> },
          { path: '/chat', element: <ChatPage /> },
          { path: '/edit-profile', element: <EditProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
          //{ path: '/posts/:postId', element: <PostDetailPage /> },
          {/*{ path: '/search', element: <SearchPage /> },*/}
        ],
      },
    ],
  },
])