import { NavLink, useNavigate } from 'react-router-dom'
import {
  Store,
  Calendar,
  User,
  Pencil,
  Users,
  Scissors,
  Clock,
  RefreshCw,
  CalendarClock,
  Ban,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../features/auth/model/useAuth'
import { useActiveBarbershop } from '../../features/barbershop/model/ActiveBarbershopContext'
import { useSidebarState } from './SidebarContext'
import { Button } from '../../shared/ui/Button'
import { Logo } from '../../shared/ui/Logo'

interface SidebarLinkProps {
  to: string
  icon: LucideIcon
  label: string
  collapsed: boolean
  end?: boolean
}

function SidebarLink({ to, icon: Icon, label, collapsed, end }: SidebarLinkProps) {
  const { isMobile, closeMobile } = useSidebarState()
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      onClick={() => {
        if (isMobile) {
          // fecha drawer IMEDIATAMENTE após clique no mobile (no next tick pra não cancelar navegação)
          queueMicrotask(closeMobile)
        }
      }}
      className={({ isActive }) =>
        [
          'relative flex items-center gap-3 rounded-[1rem] font-semibold tracking-tight transition-all ease-elegant overflow-hidden group',
          /* MOBILE FAST: touch target MINIMO 44x44 (WCAG). No desktop fica normal. */
          isMobile
            ? 'min-h-[48px] px-4 py-3 text-[0.95rem] duration-[150ms] active:scale-[0.98]'
            : `px-3.5 py-2.5 text-sm duration-200 ${collapsed ? 'justify-center px-2.5 min-h-[44px]' : ''}`,
          isActive
            ? /* link ativo: cobre brilhante + sombra */
              'text-white shadow-[0_10px_26px_-10px_rgba(217,94,30,0.55)] '
              + 'bg-gradient-to-r from-[var(--color-copper-400)] via-[var(--color-copper-500)] to-[var(--color-gold-500)] '
              + 'before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0)_50%,rgba(0,0,0,0.10)_100%)] before:pointer-events-none '
              + 'after:absolute after:inset-y-0 after:w-[38%] after:-skew-x-12 after:translate-x-[-160%] after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)] after:transition-transform after:pointer-events-none '
              + `${isMobile ? 'after:duration-[600ms]' : 'after:duration-[1.1s] hover:after:translate-x-[320%]'} scale-[1.01]`
            : /* link inativo: navy bem mais claro + hover cobre */
              'text-white/88 hover:text-white '
              + 'bg-white/[0.04] hover:bg-[color-mix(in_oklab,var(--color-copper-400)_22%,white_10%)] '
              + 'border border-transparent hover:border-white/20 '
              + `${isMobile ? 'active:bg-[rgba(255,162,106,0.22)] active:border-white/25' : 'hover:shadow-[0_6px_20px_-8px_rgba(15,27,45,0.55)] hover:-translate-y-[1px]'}`,
        ].join(' ')
      }
    >
      <Icon
        size={isMobile ? 20 : 18}
        strokeWidth={isMobile ? 2.1 : 1.95}
        className="shrink-0 relative z-10 drop-shadow-[0_1px_0_rgba(0,0,0,0.18)]"
      />
      {!collapsed && <span className="truncate relative z-10">{label}</span>}
    </NavLink>
  )
}

function SectionLabel({ children, collapsed }: { children: string; collapsed: boolean }) {
  if (collapsed)
    return (
      <div className="h-px mx-2 my-3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    )
  return (
    <div className="flex items-center gap-2 px-3 pt-5 pb-2">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-white/40" />
      <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-white/70 drop-shadow-[0_1px_0_rgba(0,0,0,0.3)]">
        {children}
      </p>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/20 to-white/30" />
    </div>
  )
}

/**
 * Sidebar global das telas autenticadas (renderizada por ProtectedRoute).
 * Retrátil (ver SidebarContext) e diferenciada por papel:
 * - Todo mundo: Painel, Barbearias, Meus agendamentos, Meu perfil.
 * - Owner: só "Minhas barbearias" até ele selecionar uma (ver
 *   ActiveBarbershopContext); depois disso, viram atalhos diretos da
 *   barbearia ativa (editar, profissionais, serviços, horários).
 * - Profissional: Minha agenda/Indisponibilidade aparecem direto, sem
 *   seleção — ele só tem uma barbearia por regra de negócio. Fica no
 *   mesmo grupo "Sua barbearia" do owner, não numa seção separada.
 */
export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { activeBarbershopId } = useActiveBarbershop()
  const {
    collapsed,
    toggleCollapsed,
    isMobile,
    closeMobile,
  } = useSidebarState()
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const ehOwner = !!user?.roles.includes('owner')
  const ehProfissional = !!user?.roles.includes('profissional')

  /* === MOBILE FAST: no mobile a SIDEBAR fica DENTRO do wrapper fixed do ProtectedRoute (já tem translate, z-index, etc). ===
     * Então aqui só definimos largura 100% (herda do wrapper drawer).
     * No desktop: sidebar inline com largura variável collapsed/expandida.
     */
  const sidebarWidth = isMobile
    ? 'w-full'
    : collapsed
      ? 'w-16'
      : 'w-64'

  return (
    <aside
      id="app-sidebar"
      className={`${sidebarWidth} shrink-0 min-h-screen h-screen flex flex-col relative overflow-hidden ${
        isMobile
          ? /* mobile: o wrapper (ProtectedRoute) já é fixed z-50 com animação. Aqui só aplicamos sombra interna e ocupamos 100%. */
            'shadow-[12px_0_44px_-10px_rgba(0,0,0,0.58)]'
          : /* desktop: transição largura + sombra suave */
            'transition-all duration-[300ms] ease-[cubic-bezier(0.2,1,0.3,1)] shadow-[4px_0_22px_-8px_rgba(15,27,45,0.35)]'
      }`}
      style={{
        background:
          'linear-gradient(180deg, #2b3f6a 0%, #354a74 28%, #263859 62%, #1e2f50 100%)',
        /* safe area de iPhone notch à esquerda (no drawer em landscape) + bottom no botão logout */
        paddingLeft: isMobile ? 'env(safe-area-inset-left)' : undefined,
        /* iOS scroll suave no conteúdo da sidebar */
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Blobs de brilho de cobre quente — CLARAM o fundo e dão vida */}
      <div
        className="absolute top-0 right-0 w-60 h-60 rounded-full blur-[70px] opacity-70 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ffa26a 0%, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="absolute bottom-10 -left-10 w-56 h-56 rounded-full blur-[70px] opacity-45 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #edc14e 0%, transparent 70%)' }}
        aria-hidden
      />
      {/* Linha vertical brilhante na borda direita */}
      <div
        className="absolute inset-y-0 right-0 w-px pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255, 162, 106, 0.45) 45%, rgba(237, 193, 78, 0.3) 75%, transparent 100%)',
        }}
        aria-hidden
      />
      {/* Textura de pontos sutil */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.14) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
        aria-hidden
      />

      {/* ===== Header: Botão X (mobile) vs Toggle Collapse (desktop) ===== */}
      <div
        className={`relative z-10 py-4 flex items-center border-b ${
          collapsed && !isMobile
            ? 'flex-col gap-3 px-0 py-5'
            : 'justify-between px-4 sm:px-5'
        }`}
        style={{ borderColor: 'rgba(255,255,255,0.18)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Logo size="sm" />
          {(!collapsed || isMobile) && (
            <span className="font-black text-lg tracking-tight text-white truncate drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]">
              <span
                className="font-extrabold"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg,#ffc79e 0%,#ffa26a 40%,#edc14e 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Barber
              </span>{' '}
              <span style={{ color: 'rgba(255,255,255,0.95)' }}>Agenda</span>
            </span>
          )}
        </div>

        {isMobile ? (
          /* MOBILE: Botão X FECHAR — target 48px, bold, fácil de alcançar */
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Fechar menu"
            className="w-11 h-11 rounded-[0.95rem] flex items-center justify-center transition-all duration-150 border active:scale-95"
            style={{
              color: '#ffffff',
              background: 'rgba(255, 162, 106, 0.22)',
              borderColor: 'rgba(255, 162, 106, 0.5)',
              boxShadow: '0 4px 14px -6px rgba(217,94,30,0.45)',
            }}
          >
            <X size={22} strokeWidth={2.25} />
          </button>
        ) : (
          /* DESKTOP: Toggle collapse ícones/expandido */
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="w-9 h-9 shrink-0 rounded-[0.85rem] flex items-center justify-center transition-all duration-200 border"
            style={{
              color: 'rgba(255,255,255,0.75)',
              background: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(255,255,255,0.16)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 162, 106, 0.18)'
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.borderColor = 'rgba(255, 162, 106, 0.45)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'
            }}
          >
            <ToggleIcon size={16} strokeWidth={1.9} />
          </button>
        )}
      </div>

      <nav
        className={`relative z-10 flex-1 flex flex-col gap-1 px-3 overflow-y-auto ${
          isMobile ? 'py-4' : 'py-5'
        }`}
        style={{
          /* safe area bottom no mobile */
          paddingBottom: isMobile ? 'max(1.25rem, env(safe-area-inset-bottom))' : undefined,
          WebkitOverflowScrolling: 'touch', /* iOS scroll nativo com inércia */
        }}
      >
        <SidebarLink to="/barbershops" icon={Store} label="Barbearias" collapsed={collapsed} />
        <SidebarLink to="/appointments" icon={Calendar} label="Meus agendamentos" collapsed={collapsed} end />
        <SidebarLink to="/profile" icon={User} label="Meu perfil" collapsed={collapsed} />

        {(ehOwner || ehProfissional) && (
          <>
            <SectionLabel collapsed={collapsed}>Sua barbearia</SectionLabel>

            {ehOwner &&
              (activeBarbershopId ? (
                <>
                  <SidebarLink
                    to={`/owner/barbershops/${activeBarbershopId}`}
                    icon={Pencil}
                    label="Editar barbearia"
                    collapsed={collapsed}
                    end
                  />
                  <SidebarLink
                    to={`/owner/barbershops/${activeBarbershopId}/professionals`}
                    icon={Users}
                    label="Profissionais"
                    collapsed={collapsed}
                  />
                  <SidebarLink
                    to={`/owner/barbershops/${activeBarbershopId}/services`}
                    icon={Scissors}
                    label="Serviços"
                    collapsed={collapsed}
                  />
                  <SidebarLink
                    to={`/owner/barbershops/${activeBarbershopId}/hours`}
                    icon={Clock}
                    label="Horários"
                    collapsed={collapsed}
                  />
                  <SidebarLink
                    to="/owner/barbershops"
                    icon={RefreshCw}
                    label="Trocar barbearia"
                    collapsed={collapsed}
                    end
                  />
                </>
              ) : (
                <SidebarLink to="/owner/barbershops" icon={Store} label="Minhas barbearias" collapsed={collapsed} />
              ))}

            {ehProfissional && (
              <>
                <SidebarLink
                  to="/professional/schedule"
                  icon={CalendarClock}
                  label="Minha agenda"
                  collapsed={collapsed}
                />
                <SidebarLink
                  to="/professional/unavailability"
                  icon={Ban}
                  label="Indisponibilidade"
                  collapsed={collapsed}
                />
              </>
            )}
          </>
        )}
      </nav>

      <div
        className={`relative z-10 px-3 border-t ${
          collapsed && !isMobile ? 'flex justify-center' : ''
        }`}
        style={{
          borderColor: 'rgba(255,255,255,0.18)',
          paddingTop: isMobile ? '1rem' : '1.25rem',
          paddingBottom: isMobile
            ? 'max(1rem, env(safe-area-inset-bottom))'
            : '1.25rem',
        }}
      >
        {/* Linha brilhante acima do logout */}
        <div
          className="absolute top-0 inset-x-6 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255, 162, 106, 0.5), transparent)',
          }}
          aria-hidden
        />

        {isMobile ? (
          /* MOBILE: botão de logout SEMPRE visível expandido (não depende de collapsed) */
          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            className="w-full justify-center !min-h-[50px] !bg-white/[0.05] !text-white/90 hover:!text-white !border-white/18 hover:!border-[rgba(255,162,106,0.55)] hover:!bg-[rgba(255,162,106,0.18)] hover:!shadow-[0_8px_22px_-10px_rgba(217,94,30,0.55)] active:scale-[0.99]"
          >
            <LogOut size={20} strokeWidth={2.1} />
            Sair da conta
          </Button>
        ) : collapsed ? (
          /* DESKTOP COLLAPSED: ícone circular */
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            className="w-11 h-11 rounded-[1rem] flex items-center justify-center transition-all duration-300 relative overflow-hidden group border"
            style={{
              color: '#ffa26a',
              borderColor: 'rgba(255, 162, 106, 0.55)',
              background: 'rgba(255, 162, 106, 0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg,#f57e3c 0%,#d95e1e 55%,#c38312 100%)'
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.boxShadow =
                '0 10px 26px -10px rgba(217, 94, 30, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 162, 106, 0.08)'
              e.currentTarget.style.color = '#ffa26a'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <LogOut size={19} strokeWidth={2} className="relative z-10" />
          </button>
        ) : (
          /* DESKTOP EXPANDIDO: Botão normal */
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-center !bg-white/[0.05] !text-white/85 hover:!text-white !border-white/18 hover:!border-[rgba(255,162,106,0.5)] hover:!bg-[rgba(255,162,106,0.15)] hover:!shadow-[0_8px_22px_-10px_rgba(217,94,30,0.5)]"
          >
            <LogOut size={16} strokeWidth={1.95} />
            Sair
          </Button>
        )}
      </div>
    </aside>
  )
}
