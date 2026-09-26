import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, CalendarCheck, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  pathOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/barbershops', label: 'Início', Icon: Home, pathOnly: true },
  { to: '/barbershops?tab=buscar', label: 'Buscar', Icon: Search },
  { to: '/appointments', label: 'Agendas', Icon: CalendarCheck, pathOnly: true },
  { to: '/profile', label: 'Perfil', Icon: User, pathOnly: true },
]

export function BottomNav() {
  const { pathname, search } = useLocation()
  const currentFull = `${pathname}${search}`

  function computeActive(item: NavItem): boolean {
    if (!item.pathOnly) return currentFull === item.to
    if (item.label === 'Início') return pathname === '/barbershops' && !search.includes('tab=buscar')
    return pathname === item.to
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        backgroundColor: '#f5f1fc',
        borderTop: '1px solid #ebe7f5',
        boxShadow: '0 -3px 18px -8px rgba(109, 91, 217, 0.18)',
      }}
    >
      <ul className="grid grid-cols-4 max-w-md mx-auto px-1 pt-3 pb-5">
        {NAV_ITEMS.map(({ to, label, Icon }, idx) => {
          const isActive = computeActive({ to, label, Icon, pathOnly: idx !== 1 })
          return (
            <li
              key={to}
              className={[
                'relative',
                idx < NAV_ITEMS.length - 1
                  ? 'after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-6 after:w-px after:bg-[#ded7ee]/70'
                  : '',
              ].join(' ')}
            >
              <NavLink
                to={to}
                className="flex flex-col items-center justify-center gap-1.5 h-14 select-none"
              >
                {/* Cápsula OVAL sobre o ícone — igual ao selecionado da lupa */}
                <div
                  className={[
                    'flex items-center justify-center transition-all duration-150',
                    isActive
                      ? 'w-14 h-10 rounded-[20px] bg-[#e9e3ff] shadow-[0_1px_4px_rgba(109,91,217,0.18)]'
                      : '',
                  ].join(' ')}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.4 : 2.1}
                    className={isActive ? 'text-[#6d5bd9]' : 'text-[#332f3d]'}
                  />
                </div>
                <span
                  className={[
                    'text-[12px] leading-none tracking-tight mt-0.5',
                    isActive
                      ? 'text-[#6d5bd9] font-bold'
                      : 'text-[#332f3d] font-medium',
                  ].join(' ')}
                >
                  {label}
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
