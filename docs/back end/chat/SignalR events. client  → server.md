
SendMessage(SendMessageCommandDto)
  - Sends a message to an existing conversation.

JoinConversation(conversationId: Guid)
  - Subscribes the current connection to a conversation channel.
  - Should be called when the chat screen is opened.

LeaveConversation(conversationId: Guid)
  - Unsubscribes the connection from the conversation channel.
  - Should be called when the chat screen is closed or switched.

