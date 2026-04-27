import { Modal } from '../Modal'
import type { UiNotification } from '../Header'

type NotificationsModalProps = {
  onClose: () => void
  notifications: UiNotification[]
  onAcceptFriendRequest: (requesterId: string) => Promise<void>
  onDeclineFriendRequest: (requesterId: string) => Promise<void>
}

export function NotificationsModal({
  onClose,
  notifications,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
}: NotificationsModalProps) {
  return (
    <Modal title="NOTIFICATION" onClose={onClose}>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-gray-500">No notifications</div>
        ) : (
          notifications.map(item => (
            <div key={item.id} className="card flex items-center gap-4 p-4">
              
              {/* Photo of the Nofitication Sender */}
              <img
                className="h-12 w-12 rounded-full border object-cover"
                src={
                  item.avatarUrl
                    ? `${import.meta.env.VITE_API_BASE_URL}${item.avatarUrl}`
                    : 'https://placehold.co/96x96'
                }
                alt=""
              />

                
              <div className="min-w-0 flex-1">
               <div className="font-normal truncate">
                {item.text}
                </div>

                {item.createdAt && (
                  <div className="mt-1 text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                )}

                {item.kind === 'friend_request' && item.actionUserId && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await onAcceptFriendRequest(item.actionUserId!)
                      }}
                      className="rounded-full bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await onDeclineFriendRequest(item.actionUserId!)
                      }}
                      className="rounded-full bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}