import { Modal } from './Modal'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-text-secondary mb-5">{description}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs rounded-md bg-surface-2 text-text-primary hover:bg-surface-3"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={
            danger
              ? 'px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-500'
              : 'px-3 py-1.5 text-xs rounded-md bg-btn-bg text-btn-fg hover:bg-accent-strong'
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
