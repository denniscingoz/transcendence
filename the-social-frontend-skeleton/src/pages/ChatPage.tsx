import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getChatConnection, startConnection } from '../realtime/signalr'
import type { ChatMessageDto } from '../types/api'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'

// Mock conversations for demo
const mockConversations = [
  {
    id: 'u-leonard',
    name: 'Leonard Boom',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    lastMessage: "Hiiii sorry that I went m i a! I've been...",
    isActive: true,
  },
  {
    id: 'u-dennis',
    name: 'Dennis the menace',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    lastMessage: "Hello man let's do this again, next m...",
    isActive: false,
  },
  {
    id: 'u-joy',
    name: 'Joyprokash Sardar',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    lastMessage: 'I have wanted to always contact with...',
    isActive: false,
  },
]

const mockMessages: ChatMessageDto[] = [
  {
    id: '1',
    fromUserId: 'u-leonard',
    content: "Hiiii sorry that I went m i a! I've been sick, got better and sick again and then there was Christmas and new years",
    sentAt: new Date().toISOString(),
  },
]

export function ChatPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [activeUserId, setActiveUserId] = useState('u-leonard')
  const [text, setText] = useState('')
  const [localMessages, setLocalMessages] = useState<ChatMessageDto[]>(mockMessages)
  const listRef = useRef<HTMLDivElement | null>(null)
  const canChat = Boolean(activeUserId)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [localMessages.length])

  const onSend = async () => {
    if (!text.trim() || !activeUserId) return
    
    const newMsg: ChatMessageDto = {
      id: Date.now().toString(),
      fromUserId: 'u-me',
      content: text.trim(),
      sentAt: new Date().toISOString(),
    }
    setLocalMessages((prev) => [...prev, newMsg])
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Left sidebar - Conversations */}
        <aside className="w-full max-w-sm border-r border-gray-100 flex flex-col">
          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="SEARCH"
                className="w-full bg-gray-100 rounded-full px-4 py-3 pr-10 text-sm 
                           placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-200"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {mockConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveUserId(conv.id)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                  activeUserId === conv.id 
                    ? 'bg-gray-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <img
                  src={conv.avatar}
                  alt={conv.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{conv.name}</div>
                  <div className="text-sm text-gray-500 truncate">{conv.lastMessage}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Right side - Chat area */}
        <main className="flex-1 flex flex-col bg-gray-300">
          {/* Messages */}
          <div 
            ref={listRef} 
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {!canChat ? (
              <div className="text-center text-gray-500 py-12">
                Select a conversation to start chatting
              </div>
            ) : (
              localMessages.map((msg) => {
                const isMine = msg.fromUserId === 'u-me'
                const conv = mockConversations.find((c) => c.id === msg.fromUserId)
                
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMine && conv && (
                      <img
                        src={conv.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                        isMine
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Message input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="MESSAGE..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!canChat}
                className="flex-1 bg-gray-100 rounded-full px-5 py-3 outline-none
                           placeholder:text-gray-400 focus:ring-2 focus:ring-gray-200
                           disabled:opacity-50"
              />
            </div>
          </div>
        </main>
      </div>

      <BottomNav active="messages" />
    </div>
  )
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  )
}