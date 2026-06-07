import { X, AlertTriangle } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  isDangerous?: boolean
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  isDangerous = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onCancel}
      />

      {/* Dialog Content */}
      <div className="relative bg-white border border-slate-200/80 rounded-3xl max-w-md w-full p-6 shadow-xl z-10 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          disabled={loading}
        >
          <X size={16} />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex gap-4 items-start">
          <div className={`p-3 rounded-2xl flex-shrink-0 border ${
            isDangerous 
              ? 'bg-rose-50 border-rose-100 text-rose-600' 
              : 'bg-indigo-50 border-indigo-100 text-indigo-650'
          }`}>
            <AlertTriangle size={20} />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-550 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-sm ${
              isDangerous
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                : 'bg-indigo-600 hover:bg-indigo-750 shadow-indigo-100'
            }`}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
