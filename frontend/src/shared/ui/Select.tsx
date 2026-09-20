import type { LucideIcon } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  icon?: LucideIcon
}

export function Select({ label, error, icon: Icon, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
            <Icon size={18} strokeWidth={1.75} />
          </div>
        )}
        <select
          className={`
            w-full bg-white border rounded-xl py-2.5 text-text-primary text-sm
            outline-none transition-all cursor-pointer
            focus:border-selected focus:ring-2 focus:ring-selected/20
            ${Icon ? 'pl-10 pr-8' : 'px-4 pr-8'}
            ${error ? 'border-error' : 'border-border hover:border-zinc-300'}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
      </div>
      {error && <span className="text-error text-xs font-medium">{error}</span>}
    </div>
  )
}
