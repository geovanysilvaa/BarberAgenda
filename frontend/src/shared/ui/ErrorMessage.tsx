import { AlertCircle } from 'lucide-react'

export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-error/10 border border-error/30 text-error text-sm rounded-xl px-4 py-3 flex items-center gap-2.5">
      <AlertCircle size={18} className="shrink-0 text-error" />
      <div className="font-medium">{children}</div>
    </div>
  )
}
