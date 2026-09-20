import type { CSSProperties, ElementType } from 'react'

type CardVariant = 'default' | 'elevated' | 'outlined' | 'ghost' | 'interactive'
type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl'
type CardRadius = 'md' | 'lg' | 'xl' | '2xl' | '3xl'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
  as?: ElementType
  variant?: CardVariant
  padding?: CardPadding
  radius?: CardRadius
  onClick?: () => void
  hoverable?: boolean
  id?: string
  role?: React.AriaRole
  ariaLabel?: string
}

const paddingMap: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-7',
  xl: 'p-9',
}

const radiusMap: Record<CardRadius, string> = {
  md: 'rounded-[1.05rem]',
  lg: 'rounded-[1.4rem]',
  xl: 'rounded-[1.75rem]',
  '2xl': 'rounded-[2rem]',
  '3xl': 'rounded-[2.5rem]',
}

const variantMap: Record<CardVariant, string> = {
  default: [
    'bg-surface border border-border edge-shine',
    'shadow-[0_3px_14px_-6px_rgba(15,27,45,0.10),0_1px_3px_-1px_rgba(15,27,45,0.05)]',
  ].join(' '),

  elevated: [
    'bg-surface border border-border-subtle edge-shine',
    'shadow-[0_16px_44px_-20px_rgba(15,27,45,0.22),0_8px_18px_-12px_rgba(15,27,45,0.12)]',
  ].join(' '),

  outlined: [
    'bg-transparent border border-border dark:border-border',
    'hover:border-[color-mix(in_oklab,var(--color-copper-400)_30%,var(--color-border-strong))]',
    'transition-colors duration-200 ease-elegant',
  ].join(' '),

  ghost: 'bg-surface-muted/70 border border-transparent',

  interactive: [
    'bg-surface border border-border cursor-pointer group edge-shine will-change-transform relative overflow-hidden',
    'shadow-[0_3px_14px_-6px_rgba(15,27,45,0.10),0_1px_3px_-1px_rgba(15,27,45,0.05)]',
    'transition-all duration-[280ms] ease-[cubic-bezier(0.2,1,0.3,1)]',
    'hover:-translate-y-[3px] hover:rotate-[0.08deg] hover:shadow-[0_24px_52px_-20px_rgba(15,27,45,0.25),0_14px_26px_-16px_rgba(15,27,45,0.15)]',
    'hover:border-[color-mix(in_oklab,var(--color-copper-400)_35%,var(--color-border-strong))]',
    'active:translate-y-[0px] active:rotate-[0deg] active:shadow-[0_10px_26px_-14px_rgba(15,27,45,0.20)]',
    /* overlay brilho cobre hover */
    'after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:opacity-0 after:transition-opacity after:duration-300',
    'after:bg-[radial-gradient(500px_200px_at_50%_-20%,color-mix(in_oklab,var(--color-copper-300)_22%,transparent),transparent_60%)]',
    'group-hover:after:opacity-100',
  ].join(' '),
}

export function Card({
  children,
  className = '',
  style,
  as = 'div',
  variant = 'default',
  padding = 'md',
  radius = 'lg',
  onClick,
  hoverable,
  id,
  role,
  ariaLabel,
}: CardProps) {
  const Component: ElementType = as
  const isInteractive = Boolean(onClick || hoverable) || variant === 'interactive'
  const variantFinal = variant === 'default' && isInteractive ? 'interactive' : variant

  return (
    <Component
      id={id}
      role={role ?? (isInteractive && Component === 'div' ? ('button' as const) : undefined)}
      aria-label={ariaLabel}
      tabIndex={isInteractive && Component === 'div' ? 0 : undefined}
      onClick={onClick}
      style={style}
      className={[
        variantMap[variantFinal],
        paddingMap[padding],
        radiusMap[radius],
        isInteractive ? 'group' : '',
        className,
      ].join(' ')}
    >
      {children}
    </Component>
  )
}
