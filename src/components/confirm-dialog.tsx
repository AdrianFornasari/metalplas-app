'use client'

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmTone?: 'default' | 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

function confirmButtonClasses(tone: Props['confirmTone']) {
  switch (tone) {
    case 'danger':
      return 'border-red-700 bg-red-600 text-white'
    case 'warning':
      return 'border-yellow-500 bg-yellow-300 text-gray-900'
    default:
      return 'border-gray-300 bg-white text-gray-900'
  }
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmTone = 'default',
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-300 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        <p className="mt-2 text-sm text-gray-700">{message}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl border px-4 py-3 font-semibold ${confirmButtonClasses(confirmTone)}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}