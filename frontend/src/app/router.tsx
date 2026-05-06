import { useEffect } from 'react'
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { RequireAuth } from '../auth/RequireAuth'
import { useAuth } from '../auth/AuthContext'
import { Layout } from '../components/Layout'
import { RealtimeProvider } from '../realtime/RealtimeProvider'

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
import { TermsOfServicePage } from '../pages/TermsOfServicePage'
// import { PostDetailPage } from '../pages/PostDetailPage'
// import { SearchPage } from '../pages/SearchPage'

/*
  This component runs whenever the route path changes.

  Example:
  /feed -> /profile/123
  /profile -> /settings

  When that happens, it scrolls the browser window back to the top.
*/
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

/*
  RouterRoot is the top-level wrapper for all routes.

  <ScrollToTop /> handles resetting the scroll position.
  <Outlet /> means: render the matched child route here.

  So when the route is /feed, Outlet renders FeedPage.
  When the route is /signin, Outlet renders AuthPage.
*/
function RouterRoot() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}

/*
  This handles the root URL: /

  If the user is logged in:
  / -> /feed

  If the user is not logged in:
  / -> /signin

  replace means the redirect does not create an extra browser history entry.
*/
function RootRedirect() {
  const { isAuthenticated } = useAuth()

  return <Navigate to={isAuthenticated ? '/feed' : '/signin'} replace />
}

/*
  createBrowserRouter creates the routing structure of the app.

  Think of this as a tree:

  RouterRoot
    ├── /
    ├── /signin
    ├── /terms-service
    ├── /privacy-policy
    └── RequireAuth
          └── RealtimeProvider + Layout
                ├── /feed
                ├── /profile
                ├── /friends
                ├── /chat
                └── etc.

  Each object with "path" is a route.
  Each "element" is the component rendered for that route.
  Each "children" array means nested routes.
*/
export const router = createBrowserRouter([
  {
    /*
      This route has no path, so it does not represent a URL itself.

      It only wraps all routes below it.
      This is why ScrollToTop can affect every page.
    */
    element: <RouterRoot />,

    children: [
      /*
        Public root route.
        This route immediately redirects depending on auth state.
      */
      { path: '/', element: <RootRedirect /> },

      /*
        Public routes.

        These pages do not require login.
      */
      { path: '/signin', element: <AuthPage /> },
      { path: '/terms-service', element: <TermsOfServicePage /> },
      { path: '/privacy-policy', element: <PrivacyPolicyPage /> },

      /*
        Protected route wrapper.

        RequireAuth should contain an <Outlet /> inside it.
        It checks whether the user is authenticated.

        If yes, it renders its child routes.
        If no, it redirects to /signin.
      */
      {
        element: <RequireAuth />,

        children: [
          /*
            Authenticated app wrapper.

            RealtimeProvider is available only inside logged-in pages.
            Layout is also only used for logged-in pages.

            Layout should contain an <Outlet /> inside it.
            That Outlet renders FeedPage, ProfilePage, ChatPage, etc.
          */
          {
            element: (
              <RealtimeProvider>
                <Layout />
              </RealtimeProvider>
            ),

            children: [
              /*
                Logged-in app pages.
              */
              { path: '/feed', element: <FeedPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '/friends', element: <FriendsPage /> },
              { path: '/chat', element: <ChatPage /> },
              { path: '/edit-profile', element: <EditProfilePage /> },
              { path: '/settings', element: <SettingsPage /> },
              { path: '/post-create', element: <PostCreatePage /> },

              /*
                Dynamic route.

                Example:
                /profile/abc123

                The ":userId" part is a route parameter.
                OtherProfilePage can read it with useParams().
              */
              { path: '/profile/:userId', element: <OtherProfilePage /> },
            ],
          },
        ],
      },
    ],
  },
])