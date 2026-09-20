interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  tone?: 'accent' | 'selected' | 'ink' | 'white'
  className?: string
  label?: string
}

const sizes = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-[1.8px]',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[2.5px]',
  xl: 'w-12 h-12 border-[3px]',
}

const toneMap = {
  accent: 'border-amber-500/25 border-t-amber-500',
  selected: 'border-indigo-500/25 border-t-indigo-500',
  ink: 'border-ink-300 border-t-ink-600 dark:border-ink-600 dark:border-t-ink-300',
  white: 'border-white/25 border-t-white',
}

export function LoadingSpinner({ size = 'md', tone = 'accent', className = '', label }: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? 'Carregando'}
      className={[
        'inline-flex items-center gap-2',
        label ? '' : '',
        className,
      ].join(' ')}
    >
      <span
        className={[
          'inline-block rounded-full animate-spin shrink-0',
          'motion-reduce:animate-[spin_2s_linear_infinite]',
          sizes[size],
          toneMap[tone],
        ].join(' ')}
        style={{
          animation: 'spin 0.75s linear infinite',
        }}
      />
      {label && (
        <span className="text-sm font-medium text-text-secondary tracking-tight">
          {label}
        </span>
      )}
    </span>
  )
}
