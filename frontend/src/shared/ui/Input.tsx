import { useState } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  icon?: LucideIcon
  iconRight?: LucideIcon
  onIconRightClick?: () => void
  leadingAddon?: React.ReactNode
  trailingAddon?: React.ReactNode
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  iconRight: IconRight,
  onIconRightClick,
  leadingAddon,
  trailingAddon,
  loading,
  type,
  size = 'md',
  className = '',
  id,
  ...props
}: InputProps) {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const ehSenha = type === 'password'
  const tipoReal = ehSenha && mostrarSenha ? 'text' : type

  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  const sizeClasses = {
    sm: 'py-1.5 text-xs rounded-lg',
    md: 'py-2.5 text-sm rounded-xl',
    lg: 'py-3.5 text-base rounded-xl',
  }[size]

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18
  const iconPaddingX = size === 'sm' ? 'pl-9 pr-3' : size === 'lg' ? 'pl-12 pr-5' : 'pl-11 pr-4'
  const noIconPaddingX = size === 'sm' ? 'px-3' : size === 'lg' ? 'px-5' : 'px-4'
  const addonHeight = size === 'sm' ? 'h-7' : size === 'lg' ? 'h-12' : 'h-10'

  const baseInput = [
    'w-full block',
    'bg-surface text-text placeholder:text-text-muted/70',
    'border transition-all duration-[160ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
    'placeholder:truncate',
    'disabled:bg-surface-muted disabled:text-text-secondary/80 disabled:cursor-not-allowed',
    'read-only:bg-surface-muted',
    'focus:outline-none',
  ].join(' ')

  const stateInput = error
    ? 'border-red-400/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
    : 'border-border hover:border-border-strong focus:border-selected focus:ring-4 focus:ring-selected/18'

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[0.82rem] font-semibold text-ink-700 dark:text-ink-200 tracking-tight pl-0.5 select-none"
        >
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <div
        className={[
          'relative flex items-center w-full group',
          loading ? 'opacity-80 pointer-events-none' : '',
        ].join(' ')}
      >
        {leadingAddon && (
          <div
            className={`flex items-center justify-center shrink-0 ${addonHeight} px-3.5 rounded-l-xl border border-r-0 border-border bg-surface-muted text-text-secondary text-sm font-medium`}
          >
            {leadingAddon}
          </div>
        )}

        {!leadingAddon && Icon && (
          <div
            className={`absolute ${size === 'sm' ? 'left-2.5' : size === 'lg' ? 'left-4' : 'left-3.5'} top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none transition-colors group-focus-within:text-selected`}
          >
            <Icon size={iconSize} strokeWidth={1.9} />
          </div>
        )}

        <input
          id={inputId}
          type={tipoReal}
          className={[
            baseInput,
            stateInput,
            sizeClasses,
            leadingAddon ? 'rounded-l-none rounded-r-xl' : '',
            trailingAddon ? 'rounded-r-none rounded-l-xl' : '',
            leadingAddon
              ? 'px-3'
              : Icon
                ? iconPaddingX
                : noIconPaddingX,
            ehSenha || trailingAddon || loading ? (size === 'sm' ? 'pr-9' : size === 'lg' ? 'pr-14' : 'pr-12') : '',
            className,
          ].join(' ')}
          {...props}
        />

        {loading && !trailingAddon && !ehSenha && (
          <div className={`absolute ${size === 'sm' ? 'right-2.5' : size === 'lg' ? 'right-4' : 'right-3.5'} top-1/2 -translate-y-1/2`}>
            <LoadingSpinner size="sm" />
          </div>
        )}

        {IconRight && !ehSenha && (
          <button
            type="button"
            onClick={onIconRightClick}
            tabIndex={-1}
            aria-hidden={!onIconRightClick}
            className={`absolute ${size === 'sm' ? 'right-2.5' : size === 'lg' ? 'right-4' : 'right-3.5'} top-1/2 -translate-y-1/2 text-text-secondary hover:text-selected transition-colors p-1 -m-1 rounded-md ${onIconRightClick ? '' : 'pointer-events-none'}`}
          >
            <IconRight size={iconSize} strokeWidth={1.9} />
          </button>
        )}

        {ehSenha && (
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            tabIndex={-1}
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            className={`absolute ${size === 'sm' ? 'right-2.5' : size === 'lg' ? 'right-4' : 'right-3.5'} top-1/2 -translate-y-1/2 text-text-secondary hover:text-selected transition-colors p-1 -m-1 rounded-md`}
          >
            {mostrarSenha ? <EyeOff size={iconSize} strokeWidth={1.9} /> : <Eye size={iconSize} strokeWidth={1.9} />}
          </button>
        )}

        {trailingAddon && (
          <div
            className={`flex items-center justify-center shrink-0 ${addonHeight} px-3.5 rounded-r-xl border border-l-0 border-border bg-surface-muted text-text-secondary text-sm font-medium`}
          >
            {trailingAddon}
          </div>
        )}
      </div>

      <div className="min-h-[1.1rem] pl-0.5">
        {error && (
          <span className="text-[0.75rem] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-[0.75rem] text-text-muted leading-relaxed">{helperText}</span>
        )}
      </div>
    </div>
  )
}
