import { RouterProvider } from 'react-router-dom'
import { router } from './router'

// Main app component
// React Router decides which page should be displayed based on the current URL
export function App() {
  return <RouterProvider router={router} />
}
