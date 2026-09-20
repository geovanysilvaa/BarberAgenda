interface AvatarProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  ring?: boolean
  tone?: 'signature' | 'indigo' | 'ink' | 'emerald'
  status?: 'online' | 'offline' | 'busy'
}

const sizes = {
  xs:   { box: 'w-6 h-6 text-[0.62rem]', status: 'w-1.5 h-1.5 -bottom-px -right-px ring-1' },
  sm:   { box: 'w-8 h-8 text-xs',       status: 'w-2 h-2 -bottom-0 -right-0 ring-2' },
  md:   { box: 'w-11 h-11 text-sm',      status: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5 ring-2' },
  lg:   { box: 'w-14 h-14 text-base',    status: 'w-3 h-3 -bottom-0.5 -right-0.5 ring-2' },
  xl:   { box: 'w-20 h-20 text-2xl',     status: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5 ring-2' },
  '2xl':{ box: 'w-28 h-28 sm:w-32 sm:h-32 text-3xl sm:text-4xl', status: 'w-4.5 h-4.5 -bottom-1 -right-1 ring-[3px]' },
}

const toneMap: Record<NonNullable<AvatarProps['tone']>, string> = {
  signature: 'from-amber-500 via-amber-400 to-gold-600 text-white ring-white/80 dark:ring-ink-900',
  indigo:    'from-indigo-500 via-indigo-400 to-indigo-700 text-white ring-white/80 dark:ring-ink-900',
  ink:       'from-ink-600 via-ink-500 to-ink-800 text-white ring-white/80 dark:ring-ink-900',
  emerald:   'from-emerald-500 via-emerald-400 to-emerald-700 text-white ring-white/80 dark:ring-ink-900',
}

const statusTone = {
  online: 'bg-emerald-500 border-emerald-500/80 ring-surface',
  busy:   'bg-amber-500 border-amber-500/80 ring-surface',
  offline:'bg-ink-400 dark:bg-ink-600 ring-surface',
}

function getInitials(name: string): string {
  if (!name?.trim()) return '•'
  const parts = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  return parts || '•'
}

function hashStringColor(name: string): NonNullable<AvatarProps['tone']> {
  if (!name) return 'signature'
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  const options: NonNullable<AvatarProps['tone']>[] = ['signature', 'indigo', 'ink', 'emerald']
  return options[Math.abs(hash) % options.length]
}

export function Avatar({
  src,
  name,
  size = 'md',
  className = '',
  ring = true,
  tone,
  status,
}: AvatarProps) {
  const selectedTone = tone ?? hashStringColor(name)
  const { box, status: statusClasses } = sizes[size]
  const ringClass = ring ? 'ring-2 ring-offset-2 ring-offset-surface ring-white/70 dark:ring-offset-ink-900 dark:ring-border-strong' : ''

  if (src) {
    return (
      <span className={`relative inline-flex shrink-0 ${box} ${className}`}>
        <img
          src={src}
          alt={name}
          loading="lazy"
          className={`w-full h-full rounded-full object-cover ${ringClass}`}
          onError={(e) => {
            const t = e.currentTarget
            t.style.display = 'none'
            t.parentElement?.querySelector('.avatar-fallback')?.classList.remove('hidden')
          }}
        />
        {!src && (
          <span
            className={`avatar-fallback absolute inset-0 w-full h-full rounded-full bg-gradient-to-br flex items-center justify-center font-semibold tracking-[0.08em] ${toneMap[selectedTone]} ${ringClass}`}
          >
            {getInitials(name)}
          </span>
        )}
        {status && (
          <span
            className={`absolute rounded-full border ring-offset-surface ${statusClasses} ${statusTone[status]}`}
            aria-hidden
          />
        )}
      </span>
    )
  }

  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      <span
        className={`${box} rounded-full bg-gradient-to-br flex items-center justify-center font-semibold tracking-[0.08em] shadow-[0_2px_8px_-3px_rgba(16,19,26,0.18)] ${toneMap[selectedTone]} ${ringClass}`}
        aria-label={name}
      >
        {getInitials(name)}
      </span>
      {status && (
        <span
          className={`absolute rounded-full border ${statusClasses} ${statusTone[status]}`}
          aria-hidden
        />
      )}
    </span>
  )
}
