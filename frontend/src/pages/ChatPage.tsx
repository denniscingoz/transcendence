import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useRealtime } from '../realtime/RealtimeProvider'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '../components/BottomNav'
import { Modal } from '../components/Modal'
import { markConversationNotificationsAsRead } from '../api/notifications.api'
import { UnknownProfileAvatar } from '../components/icons/UnknownProfileAvatar'

import {
  createDirectConversation,
  getConversations,
  getMessages,
  joinConversation,
  markAsRead,
  markAsDelivered,
  sendMessage,
  searchUsers,
  deleteMessage,
  deleteConversation,
  type ChatMessageDto,
  type ConversationDto,
  type MessageAckDto,
  type MessageDeliveredDto,
  type MessageReadDto,
} from "../api/chat.api";

function publishUnreadCount(nextConversations: ConversationDto[]) {
  const unreadCount = nextConversations.reduce(
    (sum, item) => sum + (item.unreadCount ?? 0),
    0,
  );

  window.dispatchEvent(
    new CustomEvent("chat-unread-changed", { detail: unreadCount }),
  );
}

export function ChatPage() {
  const { user } = useAuth();
  const { connection, isConnected, onlineUserIds } = useRealtime();
  const { t } = useTranslation();
  const currentUserId = user?.id ?? null;

  const messagesRef = useRef<ChatMessageDto[]>([]);
  const activeConversationIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesRequestIdRef = useRef(0);
  const shouldScrollToBottomRef = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  
  const conversationsContainerRef = useRef<HTMLDivElement | null>(null);
  const conversationsOffsetRef = useRef(0);

  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingMessageIds, setDeletingMessageIds] = useState<string[]>([]);
  const [deletingConversationIds, setDeletingConversationIds] = useState<
    string[]
  >([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; username: string }[]
  >([]);

  const [messagesOffset, setMessagesOffset] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);

  const [conversationsOffset, setConversationsOffset] = useState(0);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [loadingMoreConversations, setLoadingMoreConversations] =
    useState(false);

  const [draftTargetUserId, setDraftTargetUserId] = useState<string | null>(
    null,
  );
  const [draftTargetUserName, setDraftTargetUserName] = useState<string | null>(
    null,
  );
  const [pendingDeleteMessageId, setPendingDeleteMessageId] = useState<
    string | null
  >(null);
  const [pendingDeleteConversationId, setPendingDeleteConversationId] =
    useState<string | null>(null);

  const [failedAvatarIds, setFailedAvatarIds] = useState<Set<string>>(new Set())

  const shouldShowDraft =
    draftTargetUserId &&
    !activeConversationId &&
    !conversations.some((c) => c.targetUserId === draftTargetUserId);

  const isDraftTargetOnline =
    draftTargetUserId !== null && onlineUserIds.includes(draftTargetUserId);

  async function loadConversations(reset = true, customLimit?: number) {
    if (!currentUserId) return [];

    const pageSize = 20;
    const offset = reset ? 0 : conversationsOffsetRef.current;
    const limit = customLimit ?? pageSize;

    setError(null);

    try {
      const data = await getConversations(currentUserId, offset, limit);

      if (reset) {
        setConversations(data);
        setConversationsOffset(data.length);
        conversationsOffsetRef.current = data.length;
        setHasMoreConversations(data.length === limit);
        publishUnreadCount(data);

        return data;
      }

      let nextConversations: ConversationDto[] = [];

      setConversations((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const uniqueNewItems = data.filter((item) => !existingIds.has(item.id));

        nextConversations = [...prev, ...uniqueNewItems];

        publishUnreadCount(nextConversations);

        return nextConversations;
      });

      setConversationsOffset((prev) => {
        const nextOffset = prev + data.length;
        conversationsOffsetRef.current = nextOffset;
        return nextOffset;
      });

      setHasMoreConversations(data.length === limit);

      return nextConversations;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load conversations",
      );
      return [];
    }
  }

  async function refreshLoadedConversations() {
    if (!currentUserId) return [];

    const pageSize = 20;
    const loadedCount = conversationsOffsetRef.current;
    const limit = Math.max(loadedCount, pageSize);

    return loadConversations(true, limit);
  }

  async function loadMoreConversations() {
    if (!currentUserId) return;
    if (loadingMoreConversations) return;
    if (!hasMoreConversations) return;

    setLoadingMoreConversations(true);

    try {
      await loadConversations(false);
    } finally {
      setLoadingMoreConversations(false);
    }
  }

  async function loadConversationMessages(conversationId: string) {
    if (!currentUserId) return;

    const requestId = ++messagesRequestIdRef.current;
    setLoadingMessages(true);
    setError(null);

    try {
      const limit = 20;
      const data = await getMessages(currentUserId, conversationId, 0, limit);

      if (requestId !== messagesRequestIdRef.current) return;
      if (activeConversationIdRef.current !== conversationId) return;

      shouldScrollToBottomRef.current = true;
      setMessages(data);
      setMessagesOffset(data.length);
      setHasMoreMessages(data.length === limit);
    } catch (err) {
      if (requestId !== messagesRequestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      if (requestId === messagesRequestIdRef.current) {
        setLoadingMessages(false);
      }
    }
  }

  async function loadOlderMessages() {
    if (!currentUserId) return;
    if (!activeConversationIdRef.current) return;
    if (loadingOlderMessages) return;
    if (!hasMoreMessages) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    const conversationId = activeConversationIdRef.current;
    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;

    setLoadingOlderMessages(true);

    try {
      const limit = 20;
      const olderMessages = await getMessages(
        currentUserId,
        conversationId,
        messagesOffset,
        limit,
      );

      if (activeConversationIdRef.current !== conversationId) return;

      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
        return;
      }

      setMessages((prev) => [...olderMessages, ...prev]);
      setMessagesOffset((prev) => prev + olderMessages.length);
      setHasMoreMessages(olderMessages.length === limit);

      requestAnimationFrame(() => {
        const newScrollHeight = container.scrollHeight;
        const delta = newScrollHeight - previousScrollHeight;
        container.scrollTop = previousScrollTop + delta;
      });
    } catch (err) {
      console.error("Failed to load older messages", err);
    } finally {
      setLoadingOlderMessages(false);
    }
  }

  async function openConversation(conversationId: string) {
    try {
      if (!connection) {
        throw new Error("Chat connection is not initialized");
      }

      setDraftTargetUserId(null);
      setDraftTargetUserName(null);

      activeConversationIdRef.current = conversationId;
      setActiveConversationId(conversationId);
      setMessages([]);
      setMessagesOffset(0);
      setHasMoreMessages(true);

      window.dispatchEvent(
        new CustomEvent("active-chat-changed", {
          detail: { conversationId },
        }),
      );

      await joinConversation(connection, conversationId);
      await loadConversationMessages(conversationId);

      if (!document.hidden) {
        await markAsRead(connection, conversationId);
        await markConversationNotificationsAsRead(conversationId);
        window.dispatchEvent(new CustomEvent("notifications-visual-refresh"));
        await refreshLoadedConversations();
        window.dispatchEvent(new CustomEvent("notifications-visual-refresh"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to open conversation",
      );
    }
  }

  async function handleSend() {
    if (!connection) return;
    if (!text.trim()) return;
    if (!currentUserId) return;
    if (isTargetUserDeleted) return;

    let conversationId = activeConversationId;

    try {
      setSending(true);
      setError(null);

      if (!conversationId) {
        if (!draftTargetUserId) return;

        const result = await createDirectConversation(
          currentUserId,
          draftTargetUserId,
        );
        conversationId = result.conversationId;
        activeConversationIdRef.current = conversationId;
        setActiveConversationId(conversationId);
        setDraftTargetUserId(null);
        setDraftTargetUserName(null);

        await joinConversation(connection, conversationId);
      }

      const trimmedText = text.trim();
      const clientMessageId = crypto.randomUUID();

      const optimisticMessage: ChatMessageDto = {
        messageId: clientMessageId,
        clientMessageId,
        conversationId,
        senderId: currentUserId,
        content: trimmedText,
        createdAt: new Date().toISOString(),
        isReadByUser: false,
        isReadByOthers: false,
        isDeleted: false,
        isDelivered: false,

      };

      shouldScrollToBottomRef.current = true;
      setMessages((prev) => [...prev, optimisticMessage]);
      setText("");

      await sendMessage(connection, {
        conversationId,
        clientMessageId,
        content: trimmedText,
      });

      await refreshLoadedConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function syncActiveConversationReadState() {
    if (!connection) return;

    const currentActiveConversationId = activeConversationIdRef.current;

    if (!currentActiveConversationId) return;
    if (document.hidden) return;

    try {
      await markAsRead(connection, currentActiveConversationId);

      setConversations((prev) => {
        const next = prev.map((item) =>
          item.id === currentActiveConversationId
            ? { ...item, unreadCount: 0 }
            : item,
        );
        publishUnreadCount(next);
        return next;
      });

      await refreshLoadedConversations();
      window.dispatchEvent(new CustomEvent("notifications-visual-refresh"));
    } catch (err) {
      console.error("Failed to sync read state", err);
    }
  }

  async function handleDeleteMessage(messageId: string) {
    setPendingDeleteMessageId(messageId);
  }

  async function confirmDeleteMessage() {
    if (!connection) return;
    const messageId = pendingDeleteMessageId;
    if (!messageId) return;
    if (!currentUserId) return;
    if (!activeConversationIdRef.current) return;
    if (deletingMessageIds.includes(messageId)) return;

    setPendingDeleteMessageId(null);
    setDeletingMessageIds((prev) => [...prev, messageId]);
    setError(null);

    try {
      setMessages((prev) =>
        prev.map((message) =>
          message.messageId === messageId
            ? {
                ...message,
                isDeleted: true,
                content: "🚫 This message was deleted",
              }
            : message,
        ),
      );

      await deleteMessage(connection, messageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete message");
      await loadConversationMessages(activeConversationIdRef.current);
    } finally {
      setDeletingMessageIds((prev) => prev.filter((id) => id !== messageId));
    }
  }

  function cancelDeleteMessage() {
    setPendingDeleteMessageId(null);
  }

  async function handleDeleteConversation(conversationId: string) {
    setPendingDeleteConversationId(conversationId);
  }

  async function confirmDeleteConversation() {
    const conversationId = pendingDeleteConversationId;
    if (!conversationId) return;
    if (!currentUserId) return;
    if (deletingConversationIds.includes(conversationId)) return;

    setPendingDeleteConversationId(null);
    const wasActive = activeConversationIdRef.current === conversationId;

    setDeletingConversationIds((prev) => [...prev, conversationId]);
    setError(null);

    try {
      setConversations((prev) => {
        const next = prev.filter((item) => item.id !== conversationId);
        publishUnreadCount(next);
        return next;
      });

      setConversationsOffset((prev) => {
        const nextOffset = Math.max(prev - 1, 0);
        conversationsOffsetRef.current = nextOffset;
        return nextOffset;
      });

      if (wasActive) {
        activeConversationIdRef.current = null;
        setActiveConversationId(null);
        setMessages([]);
        setMessagesOffset(0);
        setHasMoreMessages(true);

        window.dispatchEvent(
          new CustomEvent("active-chat-changed", {
            detail: { conversationId: null },
          }),
        );
      }

      await deleteConversation(currentUserId, conversationId);

      const freshConversations = await refreshLoadedConversations();

      if (wasActive && freshConversations.length > 0) {
        await openConversation(freshConversations[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete conversation",
      );
      await refreshLoadedConversations();
    } finally {
      setDeletingConversationIds((prev) =>
        prev.filter((id) => id !== conversationId),
      );
    }
  }

  function cancelDeleteConversation() {
    setPendingDeleteConversationId(null);
  }

  function openDraftConversation(targetUserId: string, username: string) {
    activeConversationIdRef.current = null;
    setActiveConversationId(null);

    setDraftTargetUserId(targetUserId);
    setDraftTargetUserName(username);

    setMessages([]);
    setMessagesOffset(0);
    setHasMoreMessages(false);

    setSearch("");
    setSearchResults([]);
  }

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container) return;

      if (container.scrollTop <= 80) {
        void loadOlderMessages();
      }
    }

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loadingOlderMessages, hasMoreMessages, messagesOffset, currentUserId]);

  useEffect(() => {
    const container = conversationsContainerRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container) return;

      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      if (distanceToBottom <= 80) {
        void loadMoreConversations();
      }
    }

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [
    conversationsOffset,
    hasMoreConversations,
    loadingMoreConversations,
    currentUserId,
  ]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    conversationsOffsetRef.current = conversationsOffset;
  }, [conversationsOffset]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (!document.hidden) {
        void syncActiveConversationReadState();
      }
    }

    function handleWindowFocus() {
      void syncActiveConversationReadState();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [connection]);

  useEffect(() => {
    if (!connection || !currentUserId) return;

    async function reloadConversations() {
      try {
        await refreshLoadedConversations();
      } catch (err) {
        console.error("Failed to reload conversations", err);
      }
    }

    const handleMessageReceived = (message: ChatMessageDto) => {
      const isActive =
        message.conversationId === activeConversationIdRef.current;
      const isMine = message.senderId === currentUserId;

      if (isMine) return;


      if (isActive) {
        shouldScrollToBottomRef.current = true;

        setMessages((prev) => {
          const exists = prev.some(
            (item) => item.messageId === message.messageId,
          );
          if (exists) return prev;
          return [...prev, message];
        });
      }

      if (isActive && !document.hidden) {
        void markAsRead(connection, message.conversationId)
          .then(async () => {
            await markConversationNotificationsAsRead(message.conversationId);
            await reloadConversations();
            window.dispatchEvent(
              new CustomEvent("notifications-visual-refresh"),
            );
          })
          .catch((err) =>
            console.error(
              "Failed to mark as read after receiving message",
              err,
            ),
          );
      } else {
        void reloadConversations();
      }
    };

    const handleMessageAck = (ack: MessageAckDto) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.clientMessageId === ack.clientMessageId
            ? {
                ...message,
                messageId: ack.messageId,
                createdAt: ack.createdAt,
              }
            : message,
        ),
      );
    };

    const handleMessageDelivered = (payload: MessageDeliveredDto) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.messageId === payload.messageId
            ? { ...message, isDelivered: true }
            : message,
        ),
      );
    };

    const handleMessageDeleted = (payload: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.messageId === payload.messageId
            ? {
                ...item,
                isDeleted: true,
                content: "🚫 This message was deleted",
              }
            : item,
        ),
      );

      void reloadConversations();
    };

    const handleConversationDeleted = (payload: { conversationId: string }) => {
      setConversations((prev) => {
        const next = prev.filter((item) => item.id !== payload.conversationId);
        publishUnreadCount(next);
        return next;
      });

      setConversationsOffset((prev) => {
        const nextOffset = Math.max(prev - 1, 0);
        conversationsOffsetRef.current = nextOffset;
        return nextOffset;
      });

      if (activeConversationIdRef.current === payload.conversationId) {
        activeConversationIdRef.current = null;
        setActiveConversationId(null);
        setMessages([]);
        setMessagesOffset(0);
        setHasMoreMessages(true);

        window.dispatchEvent(
          new CustomEvent("active-chat-changed", {
            detail: { conversationId: null },
          }),
        );
      }

      void reloadConversations();
    };

    const handleConversationsChanged = () => {
      void reloadConversations();
    };

    const handleMessageRead = (payload: MessageReadDto) => {
      setMessages((prev) => {
        const readMessage = prev.find(
          (item) => item.messageId === payload.messageId,
        );

        if (!readMessage) return prev;

        const readTime = new Date(readMessage.createdAt).getTime();

        return prev.map((item) => {
          const itemTime = new Date(item.createdAt).getTime();

          const shouldMarkAsRead =
            item.senderId === currentUserId &&
            item.conversationId === payload.conversationId &&
            itemTime <= readTime;

          return shouldMarkAsRead
            ? {
                ...item,
                isDelivered: true,
                isReadByOthers: true,
              }
            : item;
        });
      });
    };

    const handleReconnected = async () => {
      try {
        const currentActiveConversationId = activeConversationIdRef.current;

        if (currentActiveConversationId) {
          await joinConversation(connection, currentActiveConversationId);
          await loadConversationMessages(currentActiveConversationId);
        }

        await reloadConversations();
      } catch (err) {
        console.error("Failed after reconnect", err);
      }
    };

    connection.on("MessageReceived", handleMessageReceived);
    connection.on("MessageAck", handleMessageAck);
    connection.on("MessageDelivered", handleMessageDelivered);
    connection.on("ConversationsChanged", handleConversationsChanged);
    connection.on("MessageRead", handleMessageRead);
    connection.on("MessageDeleted", handleMessageDeleted);
    connection.on("ConversationDeleted", handleConversationDeleted);
    connection.onreconnected(handleReconnected);

    return () => {
      connection.off("MessageReceived", handleMessageReceived);
      connection.off("MessageAck", handleMessageAck);
      connection.off("MessageDelivered", handleMessageDelivered);
      connection.off("ConversationsChanged", handleConversationsChanged);
      connection.off("MessageRead", handleMessageRead);
      connection.off("MessageDeleted", handleMessageDeleted);
      connection.off("ConversationDeleted", handleConversationDeleted);
    };
  }, [connection, currentUserId]);

  useEffect(() => {
    if (!currentUserId || !connection || !isConnected) return;

    let isMounted = true;

    async function init() {
      if (!currentUserId) return;

      try {
        setError(null);

        const list = await loadConversations(true);
        if (!isMounted) return;

        if (list.length > 0) {
          await openConversation(list[0].id);
        } else {
          setActiveConversationId(null);
          activeConversationIdRef.current = null;
          setMessages([]);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(
          err instanceof Error ? err.message : "Failed to initialize chat",
        );
      }
    }

    void init();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, connection, isConnected]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const results = await searchUsers({
          query: search,
          take: 20,
          cursor: null,
        });

        setSearchResults(results);
      } catch (err) {
        console.error("Search failed", err);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) return;

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    shouldScrollToBottomRef.current = false;
  }, [messages]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent("active-chat-changed", {
          detail: { conversationId: null },
        }),
      );
    };
  }, []);

  useEffect(() => {
    if (!activeConversationId || loadingMessages) return;

    requestAnimationFrame(() => {
      const container = messagesContainerRef.current;

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, [activeConversationId, loadingMessages]);

  const activeConversation = conversations.find(
    (item) => item.id === activeConversationId,
  );
  const isTargetUserDeleted = activeConversation?.targetUserIsDeleted === true;
  const activeTitle = shouldShowDraft
    ? draftTargetUserName
    : (activeConversation?.targetUserName ?? t("chat.chats"));
  const activeAvatarSrc = activeConversation?.targetUserAvatarUrl
    ? `${import.meta.env.VITE_API_BASE_URL}${activeConversation.targetUserAvatarUrl}`
    : "https://media.moddb.com/cache/images/groups/1/37/36085/thumb_620x2000/Unknown_person.jpg";
  const isActiveUserOnline = shouldShowDraft
    ? isDraftTargetOnline
    : activeConversation
      ? onlineUserIds.includes(activeConversation.targetUserId)
      : false;

return (
  <div className="h-[calc(100dvh-136px)] overflow-hidden bg-white md:h-[calc(100dvh-170px)]">
    <div className="mx-auto flex h-full w-full max-w-8xl flex-col overflow-hidden md:px-4 md:py-6">
      <div className="panel flex min-h-0 flex-1 overflow-hidden rounded-none bg-gray-100 md:gap-4 md:rounded-2xl md:bg-transparent">
        <aside
          className={`min-h-0 w-full flex-col overflow-hidden bg-gray-200 md:flex md:w-[290px] md:flex-shrink-0 md:rounded-2xl md:bg-gray-300 md:p-3 ${
            activeConversationId || shouldShowDraft
              ? "hidden md:flex"
              : "flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3 md:border-b-0 md:px-0 md:py-0">
            <h2 className="text-lg font-bold text-text md:mb-2 md:text-base">
              {t("chat.chats")}
            </h2>
          </div>

          <div className="relative px-4 py-3 md:mb-2 md:px-0 md:py-0">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("chat.searchUsers")}
              className="input w-full rounded-full bg-white text-sm md:text-xs"
            />

            {searchResults.length > 0 && (
              <div className="absolute left-4 right-4 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg md:left-0 md:right-0 md:max-h-32">
                {searchResults.map((userItem) => (
                  <button
                    key={userItem.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();

                      const existingConversation = conversations.find(
                        (conversation) =>
                          conversation.targetUserId === userItem.id,
                      );

                      if (existingConversation) {
                        setSearch("");
                        void openConversation(existingConversation.id);
                        return;
                      }

                      openDraftConversation(userItem.id, userItem.username);
                      setSearch("");
                    }}
                    className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 md:px-2 md:py-1 md:text-xs"
                  >
                    <div className="font-medium text-gray-900">
                      {userItem.username}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500 md:mx-0">
              {error}
            </p>
          )}

          <div
            ref={conversationsContainerRef}
            className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 md:px-0 md:pr-1"
          >
            {shouldShowDraft && (
              <button
                type="button"
                className="mb-1 w-full rounded-xl border border-gray-500 bg-gray-400 p-3 text-left transition-all md:p-1.5"
              >
                <div className="flex items-center gap-3 md:gap-1.5">
                  <UnknownProfileAvatar
                    className="h-11 w-11 flex-shrink-0 rounded-full object-cover md:h-5 md:w-5"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900 md:text-xs">
                      {draftTargetUserName}
                    </div>

                    <div className="truncate text-sm text-gray-600 md:text-xs">
                      {t("chat.newChat")}
                    </div>
                  </div>

                  <span
                    className={`inline-block h-3 w-3 rounded-full ring-1 ring-gray-300 md:h-2.5 md:w-2.5 ${
                      isDraftTargetOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
              </button>
            )}

            {conversations.length === 0 && !draftTargetUserId ? (
              <p className="py-6 text-center text-sm text-gray-600 md:py-2 md:text-xs">
                {t("chat.selectConversation")}
              </p>
            ) : (
              <>
                {conversations.map((conversation) => {
                  const isOnline = onlineUserIds.includes(
                    conversation.targetUserId,
                  );

                  const isDeletingConversation =
                    deletingConversationIds.includes(conversation.id);

                  const avatarSrc = conversation.targetUserAvatarUrl
                    ? `${import.meta.env.VITE_API_BASE_URL}${conversation.targetUserAvatarUrl}`
                    : null;

                  const avatarFailed = failedAvatarIds.has(conversation.id);

                  return (
                    <div
                      key={conversation.id}
                      className={`group mb-1 flex w-full items-center rounded-xl transition-all md:rounded-lg ${
                        conversation.id === activeConversationId
                          ? "border border-gray-500 bg-gray-400"
                          : "bg-white hover:bg-gray-100 md:bg-gray-200"
                      } ${isDeletingConversation ? "opacity-50" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => void openConversation(conversation.id)}
                        className="min-w-0 flex-1 p-3 text-left md:p-1.5"
                      >
                        <div className="flex items-center gap-3 md:gap-1.5">
                          {avatarSrc && !avatarFailed ? (
                            <img
                              src={avatarSrc}
                              onError={() => {
                                setFailedAvatarIds((prev) => {
                                  const next = new Set(prev);
                                  next.add(conversation.id);
                                  return next;
                                });
                              }}
                              alt={conversation.targetUserName}
                              className="h-11 w-11 flex-shrink-0 rounded-full object-cover md:h-5 md:w-5"
                            />
                          ) : (
                            <UnknownProfileAvatar
                              className="h-11 w-11 flex-shrink-0 rounded-full object-cover md:h-5 md:w-5"
                            />
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-gray-900 md:text-xs">
                              {conversation.targetUserName}
                            </div>

                            <div className="truncate text-sm text-gray-600 md:text-xs">
                              {conversation.lastMessage ||
                                t("chat.noMessagesYet")}
                            </div>
                          </div>

                          <div className="flex flex-shrink-0 items-center gap-2 md:gap-1">
                            {conversation.unreadCount > 0 && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white md:h-4 md:min-w-4">
                                {conversation.unreadCount}
                              </span>
                            )}

                            <span
                              className={`inline-block h-3 w-3 rounded-full ring-1 ring-gray-300 md:h-2.5 md:w-2.5 ${
                                isOnline ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDeleteConversation(conversation.id);
                        }}
                        disabled={isDeletingConversation}
                        aria-label={t("chat.deleteConversation")}
                        title={t("chat.deleteConversation")}
                        className="mr-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-all hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 md:mr-1 md:h-6 md:w-6 md:opacity-0 md:group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                {loadingMoreConversations && (
                  <div className="py-3 text-center text-xs text-gray-500">
                    {t("common.loading")}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        <main
          className={`min-h-0 w-full flex-col overflow-hidden bg-gray-100 md:flex md:flex-1 md:rounded-2xl md:bg-gray-300 md:p-3 ${
            activeConversationId || shouldShowDraft
              ? "flex"
              : "hidden md:flex"
          }`}
        >
          <div className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 md:hidden">
            <button
              type="button"
              onClick={() => {
                activeConversationIdRef.current = null;
                setActiveConversationId(null);
                setDraftTargetUserId(null);
                setDraftTargetUserName(null);
                setMessages([]);
                setMessagesOffset(0);
                setHasMoreMessages(true);

                window.dispatchEvent(
                  new CustomEvent("active-chat-changed", {
                    detail: { conversationId: null },
                  }),
                );
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-700 hover:bg-gray-100"
              aria-label={t("chat.backToChats")}
            >
              ‹
            </button>

            {activeAvatarSrc ? (
              <img
                src={activeAvatarSrc}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                alt={activeTitle ?? t("chat.chats")}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <UnknownProfileAvatar className="h-10 w-10 rounded-full object-cover" />
            )}

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-gray-900">
                {activeTitle}
              </div>

              <div className="text-xs text-gray-500">
                {isActiveUserOnline ? t("chat.online") : t("chat.offline")}
              </div>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 space-y-1 overflow-y-auto bg-white p-3 md:mb-1.5 md:rounded-lg md:p-2"
          >
            {!activeConversationId && !shouldShowDraft && !loadingMessages && (
              <div className="py-6 text-center text-sm text-gray-500 md:py-2 md:text-xs">
                {t("chat.selectConversation")}
              </div>
            )}

            {shouldShowDraft && (
              <div className="py-3 text-center text-xs text-gray-500">
                {t("chat.newChatWith", { name: draftTargetUserName })}
              </div>
            )}

            {loadingMessages && (
              <div className="py-3 text-center text-xs text-gray-500">
                {t("chat.loadingMessages")}
              </div>
            )}

            {loadingOlderMessages && (
              <div className="py-3 text-center text-xs text-gray-500">
                {t("chat.loadingMessages")}
              </div>
            )}

            {!loadingMessages &&
              messages.map((message) => {
                const isMine = message.senderId === currentUserId;
                const isDeleting = deletingMessageIds.includes(
                  message.messageId,
                );
                const isDeleted = message.isDeleted;

                const messageBubbleClass = isMine
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-gray-200 text-gray-900 rounded-bl-sm";

                const messageDeletedClass = isDeleted
                  ? "opacity-70 italic"
                  : "";

                const messageMetaClass = isMine
                  ? "text-blue-100"
                  : "text-gray-600";

                return (
                  <div
                    key={message.messageId}
                    className={`group flex items-end gap-1 ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    {isMine && !isDeleted && (
                      <button
                        type="button"
                        onClick={() =>
                          void handleDeleteMessage(message.messageId)
                        }
                        disabled={isDeleting}
                        aria-label={t("chat.deleteMessage")}
                        title={t("chat.deleteMessage")}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 opacity-100 transition-all hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 md:h-6 md:w-6 md:opacity-0 md:group-hover:opacity-100"
                      >
                        ×
                      </button>
                    )}

                    <div
                      className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs shadow-sm md:max-w-xs md:rounded-lg ${messageBubbleClass} ${
                        isDeleting ? "opacity-50" : ""
                      } ${messageDeletedClass}`}
                    >
                      <div
                        className="whitespace-pre-wrap text-sm leading-snug"
                        style={{ overflowWrap: "anywhere" }}
                      >
                        {message.content}
                      </div>

                      <div className={`mt-1 text-[10px] ${messageMetaClass}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {isMine && (
                        <div className="mt-0.5 text-[10px] text-blue-100">
                          {message.isReadByOthers
                            ? t("chat.read")
                            : message.isDelivered
                              ? t("chat.delivered")
                              : t("chat.sent")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            <div ref={messagesEndRef} />
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-2 md:border-t-0 md:bg-transparent md:p-0">
            <div className="flex items-end gap-2 md:flex-col md:gap-4">
              <textarea
                value={text}
                maxLength={150}
                rows={1}
                disabled={isTargetUserDeleted}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("chat.placeholder")}
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-black md:w-full md:rounded-xl md:border-panel md:bg-white md:px-4 md:py-5 md:text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />

              <div className="flex items-center gap-2 md:w-full md:flex-col md:items-stretch">
                <p className="hidden text-sm text-gray-500 md:block">
                  {text.length}/150
                </p>

                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={sending || !text.trim() || !currentUserId || isTargetUserDeleted}
                  className="flex h-11 min-w-11 items-center justify-center rounded-full bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 md:ml-auto md:h-[40px] md:min-w-[140px] md:rounded-xl"
                >
                  <span className="md:hidden">➤</span>

                  <span className="hidden md:inline">
                    {sending ? t("common.loading") : t("chat.send")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="hidden md:block">
        <BottomNav active="messages" />
      </div>
    </div>

    {pendingDeleteMessageId && (
      <Modal title={t("chat.deleteMessage")} onClose={cancelDeleteMessage}>
        <p className="mb-6 text-gray-700">{t("chat.areYouSure")}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={cancelDeleteMessage}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-300"
          >
            {t("chat.cancel")}
          </button>

          <button
            type="button"
            onClick={() => void confirmDeleteMessage()}
            className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            {t("chat.delete")}
          </button>
        </div>
      </Modal>
    )}

    {pendingDeleteConversationId && (
      <Modal
        title={t("chat.deleteConversation")}
        onClose={cancelDeleteConversation}
      >
        <p className="mb-6 text-gray-700">{t("chat.areYouSure")}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={cancelDeleteConversation}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-300"
          >
            {t("chat.cancel")}
          </button>

          <button
            type="button"
            onClick={() => void confirmDeleteConversation()}
            className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            {t("chat.delete")}
          </button>
        </div>
      </Modal>
    )}
  </div>
);
}