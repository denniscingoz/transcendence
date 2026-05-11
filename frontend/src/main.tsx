import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import { AppProviders } from './app/providers'
import './index.css' //global styling

// Stops Chrome from restoring the old scroll position after refresh.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

// Starts mock API handlers only in development when VITE_USE_MOCKS is true.
async function enableMocks() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

// Gets the root HTML element where React will render the app.
const rootEl = document.getElementById('root')!

// Creates the React root.
const root = ReactDOM.createRoot(rootEl)

// Waits for mocks if needed, then renders the app.
enableMocks().then(() => {
  root.render(
    <React.StrictMode>
      {/* Provides global app setup such as auth, query, i18n, etc. */}
      <AppProviders>
        {/* Main app component, usually including the router. */}
        <App />
      </AppProviders>
    </React.StrictMode>
  )
})