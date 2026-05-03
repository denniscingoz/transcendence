import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { getStoredToken } from '../auth/AuthContext'

const baseUrl = import.meta.env.VITE_SIGNALR_BASE_URL || import.meta.env.VITE_API_BASE_URL
const chatHubPath = import.meta.env.VITE_SIGNALR_CHAT_HUB || '/hubs/chat'
const presenceHubPath = import.meta.env.VITE_SIGNALR_PRESENCE_HUB || '/hubs/presence'

function buildConnection(hubPath: string): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(`${baseUrl}${hubPath}`, {
      accessTokenFactory: () => getStoredToken() ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build()
}

let chatConnection: HubConnection | null = null
let presenceConnection: HubConnection | null = null

export function getChatConnection() {
  if (!chatConnection) chatConnection = buildConnection(chatHubPath)
  return chatConnection
}

export function getPresenceConnection() {
  if (!presenceConnection) presenceConnection = buildConnection(presenceHubPath)
  return presenceConnection
}

export async function startConnection(conn: HubConnection) {
  if (conn.state === 'Connected' || conn.state === 'Connecting') return
  await conn.start()
}

export async function stopConnection(conn: HubConnection) {
  if (conn.state === 'Disconnected') return
  await conn.stop()
}

