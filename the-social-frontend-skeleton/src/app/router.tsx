import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth } from '../auth/RequireAuth'
import { Layout } from '../components/Layout'
import { LoginPage } from '../pages/LoginPage'
import { ProfilePage } from '../pages/ProfilePage'
import { FriendsPage } from '../pages/FriendsPage'
import { ChatPage } from '../pages/ChatPage'
import { Navigate } from 'react-router-dom'
import { FeedPage } from '../pages/FeedPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      //{ path: '/', element: <ProfilePage /> }, // default route
      { path: '/', element: <Navigate to="/feed" replace /> },
      { path: '/login', element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/feed', element: <FeedPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/friends', element: <FriendsPage /> },
          { path: '/chat', element: <ChatPage /> },
        ],
      },
    ],
  },
])

