import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../auth/AuthContext'
import '../i18n/i18n'

// Provides global app services - API caching, authentication state, and translations.

const queryClient = new QueryClient({ //global query manager
  defaultOptions: {                   //rules for all queries
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,   //Do NOT automatically refetch when browser tab regains focus
    },
  },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}