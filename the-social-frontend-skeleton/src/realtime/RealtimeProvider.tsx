import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { HubConnection } from '@microsoft/signalr'
import { useAuth } from '../auth/AuthContext'
import React from 'react';
import { createChatConnection, startConnection } from '../api/chat.api'

type RealtimeContextValue = {
  connection: HubConnection | null
  isConnected: boolean
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connection: null,
  isConnected: false,
})

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const currentUserId = user?.id ?? null

  const connectionRef = useRef<HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!currentUserId) {
      const existing = connectionRef.current
      connectionRef.current = null

      if (existing) {
        void existing.stop()
      }

      setIsConnected(false)
      return
    }

    let disposed = false

    async function init() {
      if (!currentUserId) 
          return


      const connection = createChatConnection(currentUserId)
      connectionRef.current = connection

      connection.onclose(() => {
        setIsConnected(false)
      })

      connection.onreconnected(() => {
        setIsConnected(true)
      })

      try {
        await startConnection(connection)
        if (disposed) return
        setIsConnected(true)
      } catch (err) {
        console.error('Failed to start realtime connection', err)
        setIsConnected(false)
      }
    }

    void init()

    return () => {
      disposed = true
      const existing = connectionRef.current
      connectionRef.current = null

      if (existing) {
        void existing.stop()
      }

      setIsConnected(false)
    }
  }, [currentUserId])

  return (
    <RealtimeContext.Provider
      value={{
        connection: connectionRef.current,
        isConnected,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  return useContext(RealtimeContext)
}