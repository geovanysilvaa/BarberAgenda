import { CheckCircle2 } from 'lucide-react'

export function SuccessMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-success/10 border border-success/30 text-success text-sm rounded-xl px-4 py-3 flex items-center gap-2.5">
      <CheckCircle2 size={18} className="shrink-0 text-success" />
      <div className="font-medium">{children}</div>
    </div>
  )
}
