import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Menu, User as UserIcon } from 'lucide-react'
import { useAuth } from '../features/auth/model/useAuth'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { Sidebar } from '../widgets/sidebar/Sidebar'
import { SidebarProvider, useSidebarState } from '../widgets/sidebar/SidebarContext'
import { ActiveBarbershopProvider } from '../features/barbershop/model/ActiveBarbershopContext'
import type { Role } from '../entities/usuario/types'
import { Logo } from '../shared/ui/Logo'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Role[]
}

/**
 * ===== MOBILE FAST =====
 * Header superior bar no mobile (hambúrguer + logo + avatar do usuário).
 * No desktop: layout normal, sidebar sempre ao lado.
 * No mobile: Sidebar é um DRAWER overlay com backdrop desfocado,
 * animação de slide usando transform (GPU 60fps) + bloqueio de scroll.
 */
function Shell({ children }: { children: ReactNode }) {
  const { isMobile, mobileOpen, openMobile, closeMobile } = useSidebarState()
  const { user } = useAuth()

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-surface text-ink-900 dark:text-ink-100">
      {/* Wrapper desktop: sidebar ao lado + conteúdo; mobile: col empilhado */}
      <div className={`w-full ${isMobile ? 'flex flex-col' : 'flex min-h-screen'}`}>

        {/* ========== Mobile: Header Top Bar com botão abrir menu (ABAIXO do drawer, z=30) ========== */}
        {isMobile && (
          <header
            className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 border-b"
            style={{
              background:
                'linear-gradient(180deg, rgba(251,252,253,0.97) 0%, rgba(244,246,249,0.94) 100%)',
              borderColor: 'var(--color-border)',
              backdropFilter: 'blur(12px) saturate(130%)',
              WebkitBackdropFilter: 'blur(12px) saturate(130%)',
              /* safe area do notch no iOS topo */
              paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
            }}
          >
            {/* Botão Hambúrguer — abrir drawer (48px WCAG) */}
            <button
              type="button"
              onClick={openMobile}
              aria-label="Abrir menu lateral"
              className="shrink-0 w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all duration-150 active:scale-95 select-none"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,162,106,0.18), rgba(237,193,78,0.16))',
                border: '1px solid rgba(217, 94, 30, 0.32)',
                color: 'var(--color-copper-600)',
                boxShadow: '0 4px 16px -6px rgba(217,94,30,0.48)',
              }}
            >
              <Menu size={22} strokeWidth={2.35} />
            </button>

            {/* Logo central — brand sempre visível */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Logo size="sm" />
                <span
                  className="font-black tracking-tight text-[0.95rem] sm:text-base truncate"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg,#354a74 0%,#263859 55%,#d95e1e 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Barber Agenda
                </span>
              </div>
            </div>

            {/* Avatar do usuário — direita (48px) */}
            <div
              className="shrink-0 w-12 h-12 rounded-[1rem] flex items-center justify-center overflow-hidden"
              style={{
                background: 'rgba(15,27,45,0.05)',
                border: '1px solid var(--color-border)',
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name ?? 'Usuário'}
                  className="w-full h-full object-cover rounded-[0.95rem]"
                  loading="lazy"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <span className="font-bold text-[0.8rem]" style={{ color: 'var(--color-navy-600)' }}>
                  {user?.name ? getInitials(user.name) : <UserIcon size={20} strokeWidth={2} style={{ color: 'var(--color-navy-600)' }} />}
                </span>
              )}
            </div>
          </header>
        )}

        {/* ========== Sidebar: Desktop inline / Mobile drawer overlay (z MAIOR que topbar) ========== */}
        {isMobile ? (
          <>
            {/* BACKDROP: cobre a tela, blur, clique fora fecha — z-40 ABAIXO do drawer z-50, ACIMA do topbar z-30 */}
            <div
              className={`fixed inset-0 z-40 transition-opacity duration-[220ms] ease-[cubic-bezier(0.2,1,0.3,1)] ${
                mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                background:
                  'radial-gradient(120% 80% at 50% 0%, rgba(15,27,45,0.50) 0%, rgba(5,9,18,0.76) 100%)',
                backdropFilter: 'blur(6px) saturate(130%)',
                WebkitBackdropFilter: 'blur(6px) saturate(130%)',
                /* garante que o backdrop cubra inclusive o topbar sticky */
                top: 0,
              }}
              onClick={closeMobile}
              onTouchEnd={(e) => {
                e.preventDefault()
                closeMobile()
              }}
              aria-hidden
            />
            {/* DRAWER: animação de slide da esquerda com GPU translate — z-50 (o mais alto) */}
            <div
              className={`fixed inset-y-0 left-0 z-50 transition-transform duration-[260ms] ease-[cubic-bezier(0.2,1,0.3,1)] will-change-transform ${
                mobileOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
              style={{
                WebkitTransform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                /* safe area iOS à esquerda (notch dinâmico) */
                paddingLeft: 'env(safe-area-inset-left)',
                maxWidth: '88vw',
                width: '320px',
              }}
              aria-modal="true"
              role="dialog"
              aria-label="Menu de navegação"
            >
              <Sidebar />
            </div>
          </>
        ) : (
          /* DESKTOP: sidebar ao lado */
          <Sidebar />
        )}

        {/* ========== Conteúdo da página ========== */}
        <main className="flex-1 min-w-0 w-full flex flex-col">
          <div className="flex-1 w-full flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
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

/**
 * RF017 (frontend) — protege rotas privadas e, opcionalmente, restringe
 * por perfil (cliente | profissional | owner), espelhando a autorização
 * já aplicada no backend (autorizar() em shared/middlewares/autenticar.ts).
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/" replace />
  }

  return (
    <ActiveBarbershopProvider>
      <SidebarProvider>
        <Shell>{children}</Shell>
      </SidebarProvider>
    </ActiveBarbershopProvider>
  )
}
