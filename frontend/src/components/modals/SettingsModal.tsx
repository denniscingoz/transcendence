import { Modal } from '../Modal'

export function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="SETTINGS" onClose={onClose}>
      <div className="space-y-4">
        <div className="card p-4 flex items-center justify-between">
          <div>2 factor authentication</div>
          <button className="btn-primary">Activate</button>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>Log out from the account</div>
          <button className="btn-ghost">Log-out</button>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>Delete account</div>
          <button className="btn rounded-full px-6 py-3 bg-red-500 text-white">Delete</button>
        </div>
      </div>
    </Modal>
  )
}