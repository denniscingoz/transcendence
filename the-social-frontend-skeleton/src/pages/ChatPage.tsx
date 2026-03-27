import { useEffect, useRef, useState } from 'react'
import type { ChatMessageDto } from '../types/api'
import { Header } from '../components/Header'
import { BottomNav } from '../components/BottomNav'

<<<<<<< HEAD
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
=======
// 👉 тип conversation (минимальный)
type Conversation = {
  id: string
  name?: string
  avatar?: string
  lastMessage?: string
}

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<ChatMessageDto[]>([])

  const listRef = useRef<HTMLDivElement | null>(null)

  // ✅ загрузка conversations
useEffect(() => {
  const init = async () => {
    const targetUserId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
>>>>>>> f537e23 (-)

    // 1. создать conversation
    const res = await fetch("http://localhost:5067/conversations/direct", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dev-UserId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
      },
      body: JSON.stringify({ targetUserId })
    })

    const data = await res.json()
    const conversationId = data.data

    console.log("conversationId:", conversationId)

    setConversations([
  {
    id: conversationId,
    name: "Test User",
    lastMessage: "Last message..."
  }
])

setActiveConversationId(conversationId)

    // 2. загрузить сообщения
    const msgRes = await fetch(
      `http://localhost:5067/conversations/${conversationId}/messages`,
      {
        headers: {
          "X-Dev-UserId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
        }
      }
    )

    const msgData = await msgRes.json()

    setMessages(msgData.data || [])
  }

  init()
}, [])

  // ✅ загрузка сообщений
  useEffect(() => {
<<<<<<< HEAD
=======
    if (!activeConversationId) return

    fetch(`http://localhost:5067/conversations/${activeConversationId}/messages`)
      .then(res => res.json())
      .then(data => {
        console.log("MESSAGES:", data)
        setMessages(data.data || [])
      })
      .catch(err => console.error("ERROR messages:", err))
  }, [activeConversationId])

  // ✅ автоскролл
  useEffect(() => {
>>>>>>> f537e23 (-)
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [localMessages.length])

<<<<<<< HEAD
  const onSend = async () => {
    if (!text.trim() || !activeUserId) return
    
    const newMsg: ChatMessageDto = {
      id: Date.now().toString(),
      fromUserId: 'u-me',
      content: text.trim(),
      sentAt: new Date().toISOString(),
    }
    setLocalMessages((prev) => [...prev, newMsg])
=======
  // ❗ пока локальная отправка (потом заменим на backend)
  const onSend = () => {
    if (!text.trim() || !activeConversationId) return

    const newMsg: ChatMessageDto = {
      id: Date.now().toString(),
      fromUserId: 'me',
      content: text.trim(),
      sentAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, newMsg])
>>>>>>> f537e23 (-)
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
<<<<<<< HEAD
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
=======
        
        {/* LEFT - conversations */}
        <aside className="w-full max-w-sm border-r border-gray-100 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full flex items-center gap-3 p-4 text-left ${
                  activeConversationId === conv.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <div className="font-semibold">
                    {conv.name || conv.id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {conv.lastMessage || ''}
                  </div>
>>>>>>> f537e23 (-)
                </div>
              </button>
            ))}
          </div>
        </aside>

<<<<<<< HEAD
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
=======
        {/* RIGHT - messages */}
        <main className="flex-1 flex flex-col bg-gray-200">
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {!activeConversationId ? (
              <div className="text-center text-gray-500">
                Select conversation
              </div>
            ) : (
              messages.map(msg => {
                const isMine = msg.fromUserId === 'me'

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`px-3 py-2 rounded ${
                      isMine ? 'bg-blue-500 text-white' : 'bg-white'
                    }`}>
>>>>>>> f537e23 (-)
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}
          </div>

<<<<<<< HEAD
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
=======
          {/* INPUT */}
          <div className="p-3 bg-white flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
            />
            <button onClick={onSend} className="px-4 bg-blue-500 text-white rounded">
              Send
            </button>
>>>>>>> f537e23 (-)
          </div>
        </main>
      </div>

      <BottomNav active="messages" />
    </div>
  )
<<<<<<< HEAD
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  )
=======
>>>>>>> f537e23 (-)
}