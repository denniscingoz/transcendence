import { useEffect, useRef, useState } from 'react'
import type { ChatMessageDto } from '../types/api'
import { BottomNav } from '../components/BottomNav'

type Conversation = {
  id: string
  name?: string
  avatar?: string
  lastMessage?: string
}

const DEV_USER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
const TARGET_USER_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const API_BASE_URL = 'http://localhost:5067'

export function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<ChatMessageDto[]>([])

  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/conversations/direct`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Dev-UserId': DEV_USER_ID,
          },
          body: JSON.stringify({ targetUserId: TARGET_USER_ID }),
        })

        const data = await res.json()
        const conversationId = data.data

        if (!conversationId) return

        setConversations([
          {
            id: conversationId,
            name: 'Test User',
            lastMessage: 'Last message...',
          },
        ])

        setActiveConversationId(conversationId)
      } catch (err) {
        console.error('ERROR conversations:', err)
      }
    }

    init()
  }, [])

  useEffect(() => {
    if (!activeConversationId) return

    const loadMessages = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/conversations/${activeConversationId}/messages`,
          {
            headers: {
              'X-Dev-UserId': DEV_USER_ID,
            },
          }
        )

        const data = await res.json()
        setMessages(data.data || [])
      } catch (err) {
        console.error('ERROR messages:', err)
      }
    }

    loadMessages()
  }, [activeConversationId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length])

  const onSend = () => {
    if (!text.trim() || !activeConversationId) return

    const newMsg: ChatMessageDto = {
      id: Date.now().toString(),
      fromUserId: 'me',
      content: text.trim(),
      sentAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMsg])
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        <aside className="w-full max-w-sm border-r border-gray-100 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full flex items-center gap-3 p-4 text-left ${
                  activeConversationId === conv.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <div className="font-semibold">{conv.name || conv.id}</div>
                  <div className="text-sm text-gray-500">{conv.lastMessage || ''}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-gray-200">
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {!activeConversationId ? (
              <div className="text-center text-gray-500">Select conversation</div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.fromUserId === 'me'

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-3 py-2 rounded ${
                        isMine ? 'bg-blue-500 text-white' : 'bg-white'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="p-3 bg-white flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Type a message"
            />
            <button onClick={onSend} className="px-4 bg-blue-500 text-white rounded">
              Send
            </button>
          </div>
        </main>
      </div>

      <BottomNav active="messages" />
    </div>
  )
}