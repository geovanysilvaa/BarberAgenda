import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'sidebarCollapsed'
const MOBILE_BREAKPOINT = 768

interface SidebarContextValue {
  /* desktop: ícones só / expandido */
  collapsed: boolean
  toggleCollapsed: () => void

  /* mobile: drawer overlay aberto / fechado */
  isMobile: boolean
  mobileOpen: boolean
  openMobile: () => void
  closeMobile: () => void
  toggleMobile: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return isMobile
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  )
  const [mobileOpen, setMobileOpen] = useState<boolean>(false)

  /* persiste só desktop collapsed — mobile é sempre a mesma coisa */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed))
  }, [collapsed])

  /* ao mudar pra desktop, garante que o drawer não fica aberto fantasma */
  useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile])

  /* trava o scroll do body quando o drawer mobile está aberto */
  useEffect(() => {
    if (!isMobile) return
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen, isMobile])

  /* fecha drawer mobile ao apertar ESC (acessibilidade) */
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const value: SidebarContextValue = {
    collapsed,
    toggleCollapsed: () => setCollapsed((v) => !v),

    isMobile,
    mobileOpen,
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
    toggleMobile: () => setMobileOpen((v) => !v),
  }

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebarState() {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    throw new Error('useSidebarState deve ser usado dentro de um SidebarProvider.')
  }
  return ctx
}
