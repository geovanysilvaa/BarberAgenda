import { LoadingSpinner } from './LoadingSpinner'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  iconLeft?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  iconRight?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  iconLeft: IconLeft,
  iconRight: IconRight,
  children,
  className = '',
  type = 'button',
  fullWidth,
  disabled,
  ...props
}: ButtonProps) {
  const base = [
    'group relative isolate inline-flex items-center justify-center gap-2',
    'font-semibold tracking-tight whitespace-nowrap select-none',
    'rounded-xl border border-transparent',
    'transition-all duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
    'disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none',
    'focus-visible:ring-0',
    fullWidth ? 'w-full' : '',
  ].join(' ')

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: [
      'text-white',
      'bg-gradient-signature',
      'shadow-[0_10px_22px_-10px_rgba(222,111,5,0.45),0_1px_0_0_rgba(255,255,255,0.12)_inset]',
      'hover:-translate-y-[1px] hover:shadow-[0_14px_28px_-10px_rgba(222,111,5,0.55),0_1px_0_0_rgba(255,255,255,0.14)_inset]',
      'active:translate-y-[0px] active:shadow-[0_4px_14px_-6px_rgba(222,111,5,0.45)]',
      'before:absolute before:inset-0 before:rounded-xl before:bg-white/0 before:transition-colors before:pointer-events-none',
      'hover:before:bg-white/8',
    ].join(' '),

    secondary: [
      'text-ink-900 dark:text-ink-100',
      'bg-surface-elevated hover:bg-surface-muted dark:bg-surface-muted dark:hover:bg-surface-inset',
      'border border-border hover:border-border-strong dark:border-border dark:hover:border-border-strong',
      'shadow-sm',
      'hover:-translate-y-[1px]',
    ].join(' '),

    outline: [
      'bg-transparent border border-border hover:border-border-strong',
      'text-ink-700 hover:text-ink-900 dark:text-ink-200 dark:hover:text-ink-950',
      'hover:bg-surface-muted dark:hover:bg-surface-muted',
      'shadow-xs',
    ].join(' '),

    ghost: [
      'bg-transparent border-transparent',
      'text-ink-600 hover:text-ink-900 hover:bg-surface-muted',
      'dark:text-ink-300 dark:hover:text-ink-950 dark:hover:bg-surface-muted',
    ].join(' '),

    danger: [
      'text-white',
      'bg-gradient-to-b from-red-500 to-red-700 hover:to-red-600',
      'shadow-[0_10px_22px_-12px_rgba(185,28,28,0.55)]',
      'hover:-translate-y-[1px] hover:shadow-[0_14px_28px_-12px_rgba(185,28,28,0.70)]',
      'active:translate-y-[0px]',
    ].join(' '),
  }

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-3.5 py-2 text-[0.8rem] rounded-lg',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  const isDisabled = loading || disabled

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span className="opacity-85">Carregando…</span>
        </>
      ) : (
        <>
          {IconLeft && <IconLeft size={18} strokeWidth={2} className="-ml-0.5" />}
          <span>{children}</span>
          {IconRight && <IconRight size={18} strokeWidth={2} className="-mr-0.5" />}
        </>
      )}
    </button>
  )
}
