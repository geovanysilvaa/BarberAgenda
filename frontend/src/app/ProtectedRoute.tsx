import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../features/auth/model/useAuth'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { Sidebar } from '../widgets/sidebar/Sidebar'
import { SidebarProvider, useSidebarState } from '../widgets/sidebar/SidebarContext'
import { ActiveBarbershopProvider } from '../features/barbershop/model/ActiveBarbershopContext'
import type { Role } from '../entities/usuario/types'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Role[]
}

/**
 * Layout Shell para rotas autenticadas.
 * - Desktop (≥ 768px): Sidebar fixa ao lado + conteúdo.
 * - Mobile (< 768px): nenhum menu lateral nem header de navegação;
 *   a navegação é feita via BottomNav (renderizado dentro de cada página)
 *   e logout fica disponível em Meu Perfil.
 */
function Shell({ children }: { children: ReactNode }) {
  const { isMobile } = useSidebarState()

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-surface text-ink-900 dark:text-ink-100">
      <div className={`w-full ${isMobile ? 'flex flex-col' : 'flex min-h-screen'}`}>
        {/* DESKTOP apenas: Sidebar inline ao lado (oculta no mobile) */}
        {!isMobile && <Sidebar />}

        {/* Conteúdo da página */}
        <main className="flex-1 min-w-0 w-full flex flex-col">
          <div className="flex-1 w-full flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
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
