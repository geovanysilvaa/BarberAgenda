import type { ComponentType, SVGProps } from 'react'
import { Check, Clock, XCircle, Flame, AlertTriangle, Info } from 'lucide-react'

export type AppointmentStatus = 'agendado' | 'concluido' | 'cancelado'
export type BadgeTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'amber'
  | 'indigo'
  | 'neutral'
  | AppointmentStatus

export interface StatusBadgeProps {
  status?: AppointmentStatus
  tone?: BadgeTone
  label?: React.ReactNode
  icon?: ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>
  size?: 'sm' | 'md' | 'lg'
  className?: string
  withDot?: boolean
}

const toneStyles: Record<NonNullable<BadgeTone>, string> = {
  success:
    'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/35',
  warning:
    'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-500/25 dark:border-amber-500/35',
  danger:
    'bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-500/25 dark:border-red-500/35',
  info:
    'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border-indigo-500/25 dark:border-indigo-500/35',
  amber:
    'bg-gold-500/10 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300 border-gold-500/25 dark:border-gold-500/35',
  indigo:
    'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border-indigo-500/25 dark:border-indigo-500/35',
  neutral:
    'bg-ink-100 text-ink-600 dark:bg-ink-700/40 dark:text-ink-200 border-ink-200/60 dark:border-ink-600/50',
  agendado:
    'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border-indigo-500/25 dark:border-indigo-500/35',
  concluido:
    'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/35',
  cancelado:
    'bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-500/25 dark:border-red-500/35',
}

const statusIcon: Record<AppointmentStatus, ComponentType<any>> = {
  agendado: Clock,
  concluido: Check,
  cancelado: XCircle,
}

const statusLabel: Record<AppointmentStatus, string> = {
  agendado: 'Agendado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

const toneIconDefault: Partial<Record<BadgeTone, ComponentType<any>>> = {
  success: Check,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  amber: Flame,
  indigo: Info,
}

const sizeMap = {
  sm: 'px-2.5 py-0.5 text-[0.68rem] gap-1',
  md: 'px-3 py-1 text-[0.75rem] gap-1.5',
  lg: 'px-3.5 py-1.5 text-[0.82rem] gap-2',
}

export function StatusBadge({
  status,
  tone,
  label,
  icon: Icon,
  size = 'md',
  className = '',
  withDot,
}: StatusBadgeProps) {
  const finalTone: NonNullable<BadgeTone> = tone ?? status ?? 'neutral'
  const finalLabel = label ?? (status ? statusLabel[status] : undefined)
  const FinalIcon = Icon ?? (status ? statusIcon[status] : toneIconDefault[finalTone])
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 15 : 13
  const stroke = size === 'sm' ? 2.4 : 2.2

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border font-semibold shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_1px_2px_rgba(16,19,26,0.04)]',
        'whitespace-nowrap tracking-tight select-none transition-all',
        toneStyles[finalTone],
        sizeMap[size],
        className,
      ].join(' ')}
    >
      {withDot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping ${
            finalTone === 'success' || finalTone === 'concluido' ? 'bg-emerald-400' :
            finalTone === 'danger' || finalTone === 'cancelado' ? 'bg-red-400' :
            finalTone === 'amber' || finalTone === 'warning' ? 'bg-amber-400' : 'bg-indigo-400'
          }`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            finalTone === 'success' || finalTone === 'concluido' ? 'bg-emerald-500' :
            finalTone === 'danger' || finalTone === 'cancelado' ? 'bg-red-500' :
            finalTone === 'amber' || finalTone === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
          }`} />
        </span>
      )}
      {FinalIcon && <FinalIcon size={iconSize} strokeWidth={stroke} className="shrink-0" />}
      {finalLabel !== undefined && <span>{finalLabel}</span>}
    </span>
  )
}
