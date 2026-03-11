import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth } from '../auth/RequireAuth'
import { Layout } from '../components/Layout'
import { LoginPage } from '../pages/LoginPage'
import { ProfilePage } from '../pages/ProfilePage'
import { FriendsPage } from '../pages/FriendsPage'
import { ChatPage } from '../pages/ChatPage'
import { FeedPage } from '../pages/FeedPage'
import { SearchPage } from '../pages/SearchPage'

export const router = createBrowserRouter([
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
          { path: '/search', element: <SearchPage /> },
        ],
      },
    ],
  },
])