import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { HubConnection } from '@microsoft/signalr'
import React from 'react'
import { useAuth } from '../auth/AuthContext'
import { createChatConnection, startConnection } from '../api/chat.api'

type RealtimeContextValue = {
  connection: HubConnection | null
  isConnected: boolean
  onlineUserIds: string[]
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connection: null,
  isConnected: false,
  onlineUserIds: [],
})

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const currentUserId = user?.id ?? null

  const connectionRef = useRef<HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([])

  useEffect(() => {
    if (!currentUserId) {
      const existing = connectionRef.current
      connectionRef.current = null

      if (existing) {
        void existing.stop()
      }

      setIsConnected(false)
      setOnlineUserIds([])
      return
    }

    let disposed = false

    async function init() {
      if (!currentUserId) return
      if (connectionRef.current) return

      const connection = createChatConnection(currentUserId)
      connectionRef.current = connection

      connection.on('OnlineUsersSnapshot', (users: string[]) => {
        setOnlineUserIds(users)
      })

      connection.on('UserOnLine', (payload: { userId: string }) => {
        setOnlineUserIds(prev =>
          prev.includes(payload.userId) ? prev : [...prev, payload.userId]
        )
      })

      connection.on('UserOffLine', (payload: { userId: string }) => {
        setOnlineUserIds(prev => prev.filter(id => id !== payload.userId))
      })

      connection.onclose(() => {
        setIsConnected(false)
        setOnlineUserIds([])
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
      setOnlineUserIds([])
    }
  }, [currentUserId])

  return (
    <RealtimeContext.Provider
      value={{
        connection: connectionRef.current,
        isConnected,
        onlineUserIds,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  return useContext(RealtimeContext)
}