import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Store,
  Plus,
  Search,
  Building2,
  Scissors,
  Users,
  Clock,
  Sparkles,
  X,
  MapPin,
  Phone,
  Check,
  Settings,
} from 'lucide-react'
import { useAuth } from '../features/auth/model/useAuth'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useActiveBarbershop } from '../features/barbershop/model/ActiveBarbershopContext'
import { CreateBarbershopForm } from '../features/barbershop/ui/CreateBarbershopForm'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { BottomNav } from '../shared/ui/BottomNav'
import type { Barbershop } from '../entities/barbershop/types'

interface StatusBadge {
  bg: string
  text: string
  label: string
}

const STATUS_ABERTA: StatusBadge = {
  bg: '#e4f7ea',
  text: '#1f8e4e',
  label: 'Aberta',
} as const

const STATUS_FECHADA: StatusBadge = {
  bg: '#e5e3eb',
  text: '#4f4a5c',
  label: 'Fechada',
} as const

function pegarStatus(_b: Barbershop, index: number): StatusBadge {
  return index % 2 === 0 ? STATUS_ABERTA : STATUS_FECHADA
}

/**
 * Lista as barbearias do usuário autenticado (owner), permite alternar
 * a barbearia ativa do menu e cadastrar novas unidades da rede.
 * Layout mobile-first em alta fidelidade: fundo #fef7ff, cards com imagem
 * de capa 16:9 arredondados de 22px, status Aberta/Fechada em pill,
 * campo de busca com borda cinza e FAB lilás flutuante para nova unidade.
 */
export function OwnerBarbershopsPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { barbearias, loading, error, listarBarbearias, criarBarbearia } = useBarbeiro()
  const { activeBarbershopId, selecionarBarbearia } = useActiveBarbershop()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    listarBarbearias()
  }, [listarBarbearias])

  const minhasBarbearias = useMemo(() => {
    return barbearias.filter((b) => b.ownerId === user?.id)
  }, [barbearias, user?.id])

  const barbeariasFiltradas = useMemo(() => {
    if (!busca.trim()) return minhasBarbearias
    const termo = busca.toLowerCase().trim()
    return minhasBarbearias.filter(
      (b) =>
        b.name.toLowerCase().includes(termo) ||
        b.address.toLowerCase().includes(termo) ||
        b.phone.includes(termo),
    )
  }, [minhasBarbearias, busca])

  async function handleBarbeariaCriada(barbershop: Barbershop) {
    await refreshUser()
    selecionarBarbearia(barbershop.id)
    setMostrarFormulario(false)
    navigate(`/owner/barbershops/${barbershop.id}`)
  }

  function handleSelecionarEGerenciar(id: string) {
    selecionarBarbearia(id)
    navigate(`/owner/barbershops/${id}`)
  }

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-28 md:pb-8">
      <main className="max-w-md mx-auto px-5 pt-8 pb-4 flex flex-col gap-5 md:max-w-5xl md:px-6 md:pt-8">
        {/* ===== HEADER: Título + Contador ===== */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1
              className="font-extrabold tracking-tight text-[#1a1722]"
              style={{ fontSize: '31px', letterSpacing: '-0.02em' }}
            >
              Minhas Barbearias
            </h1>
            {minhasBarbearias.length > 0 && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold tracking-tight"
                style={{ backgroundColor: '#efe8ff', color: '#6d5bd9' }}
              >
                <Sparkles size={11} />
                {minhasBarbearias.length}
              </span>
            )}
          </div>
        </div>

        {/* ===== CAMPO DE BUSCA (sempre visível) ===== */}
        <div className="relative w-full">
          <Search
            size={22}
            strokeWidth={2.1}
            className="absolute text-[#b0a9c1] pointer-events-none"
            style={{ left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar unidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={[
              'w-full bg-white',
              'text-[#1a1a1a] text-[17px] font-semibold tracking-tight',
              'placeholder:text-[#a8a1b9]',
              'rounded-[22px]',
              'border-2 border-[#d4cde4]',
              'focus:outline-none',
              'focus:border-[#6d5bd9]',
              'focus:ring-4 focus:ring-[#d3c8ff]/50',
              'transition-all duration-150',
            ].join(' ')}
            style={{ padding: '15px 3rem 15px 3.3rem' }}
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca('')}
              aria-label="Limpar busca"
              className="absolute text-[#8f889e] hover:text-[#6d5bd9] transition-colors rounded-md"
              style={{ right: '1.1rem', top: '50%', transform: 'translateY(-50%)', padding: '4px' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* ===== FORMULÁRIO DE NOVA BARBEARIA ===== */}
        {mostrarFormulario && (
          <div
            className="bg-white rounded-[22px] p-5 md:p-7 flex flex-col gap-5"
            style={{ boxShadow: '0 1px 2px rgba(18,17,51,0.04), 0 12px 32px -10px rgba(109,91,217,0.20)', border: '1px solid #efe8ff' }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#efe8ff', color: '#6d5bd9' }}
                >
                  <Building2 size={24} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[19px] font-extrabold text-[#2b2238] tracking-tight leading-tight">
                    Cadastrar Nova Barbearia
                  </h2>
                  <p className="text-[14px] text-[#6b6478] leading-snug mt-0.5">
                    Preencha os dados para adicionar uma nova filial.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[#6b6478] hover:text-[#2b2238] hover:bg-[#efe8ff] transition-colors"
                title="Fechar formulário"
              >
                <X size={22} strokeWidth={2} />
              </button>
            </div>

            <CreateBarbershopForm
              onCreate={criarBarbearia}
              onSuccess={handleBarbeariaCriada}
              onCancel={() => setMostrarFormulario(false)}
              submitLabel="Criar e Gerenciar"
            />
          </div>
        )}

        {/* ===== MENSAGENS DE ERRO ===== */}
        {error && (
          <div className="pt-1">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}

        {/* ===== LOADING ===== */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" tone="selected" />
            <p className="text-[15px] text-[#6b6478]">Carregando suas barbearias...</p>
          </div>
        )}

        {/* ===== EMPTY STATE: NENHUMA BARBEARIA ===== */}
        {!loading && minhasBarbearias.length === 0 && !mostrarFormulario && (
          <div
            className="bg-white rounded-[22px] p-10 flex flex-col items-center text-center gap-5"
            style={{
              boxShadow: '0 1px 2px rgba(18,17,51,0.04), 0 10px 30px -12px rgba(26,24,58,0.10)',
              border: '1px solid #ebe7f5',
            }}
          >
            <div
              className="w-20 h-20 rounded-[22px] flex items-center justify-center"
              style={{ backgroundColor: '#efe8ff', color: '#6d5bd9' }}
            >
              <Building2 size={34} strokeWidth={1.9} />
            </div>
            <div className="flex flex-col gap-2 max-w-xs">
              <h3 className="text-[19px] font-extrabold text-[#2b2238] tracking-tight leading-tight">
                Nenhuma barbearia cadastrada
              </h3>
              <p className="text-[15px] text-[#6b6478] leading-relaxed">
                Cadastre sua primeira unidade para começar a gerenciar profissionais,
                serviços e horários de atendimento.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMostrarFormulario(true)}
              className={[
                'inline-flex items-center justify-center gap-2',
                'text-white font-extrabold tracking-tight transition-all duration-150',
                'shadow-[0_8px_20px_-6px_rgba(109,91,217,0.55)]',
                'bg-[#6d5bd9] hover:bg-[#5d4bc9] active:scale-[0.992]',
              ].join(' ')}
              style={{ padding: '15px 24px', borderRadius: '999px', fontSize: '17px' }}
            >
              <Plus size={20} strokeWidth={2.2} />
              Cadastrar Primeira Barbearia
            </button>
          </div>
        )}

        {/* ===== EMPTY STATE: BUSCA SEM RESULTADOS ===== */}
        {!loading && minhasBarbearias.length > 0 && barbeariasFiltradas.length === 0 && (
          <div
            className="bg-white rounded-[22px] p-8 flex flex-col items-center text-center gap-4"
            style={{ border: '1px solid #ebe7f5' }}
          >
            <Search size={26} strokeWidth={1.9} className="text-[#8c8699]" />
            <div className="flex flex-col gap-1.5">
              <p className="text-[16px] font-extrabold text-[#2b2238]">
                Nenhuma unidade encontrada
              </p>
              <p className="text-[15px] text-[#6b6478] leading-relaxed">
                Tente buscar por outro nome ou endereço.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setBusca('')}
              className="inline-flex items-center justify-center text-[#6d5bd9] font-bold text-[15px] hover:underline"
            >
              Limpar busca
            </button>
          </div>
        )}

        {/* ===== LISTA DE BARBEARIAS (CARDS 16:9 COM FOTO) ===== */}
        {!loading && barbeariasFiltradas.length > 0 && (
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {barbeariasFiltradas.map((barbearia, idx) => {
              const isAtiva = barbearia.id === activeBarbershopId
              const status = pegarStatus(barbearia, idx)
              const fotoCapa = barbearia.avatarUrl

              return (
                <button
                  key={barbearia.id}
                  type="button"
                  onClick={() => handleSelecionarEGerenciar(barbearia.id)}
                  className={[
                    'w-full flex flex-col overflow-hidden text-left transition-all duration-150',
                    'active:scale-[0.995] md:group',
                  ].join(' ')}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '22px',
                    border: isAtiva
                      ? '2px solid #6d5bd9'
                      : '1.5px solid #ebe7f5',
                    boxShadow: isAtiva
                      ? '0 1px 2px rgba(18,17,51,0.04), 0 12px 30px -12px rgba(109,91,217,0.28)'
                      : '0 1px 2px rgba(18,17,51,0.04), 0 8px 24px -14px rgba(26,24,58,0.10)',
                  }}
                >
                  {/* ==== IMAGEM DE CAPA 16:9 ==== */}
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      aspectRatio: '16 / 9',
                      background: fotoCapa ? undefined : 'linear-gradient(135deg, #6d5bd9 0%, #8b7fe9 100%)',
                    }}
                  >
                    {fotoCapa ? (
                      <img
                        src={fotoCapa}
                        alt={`Fachada da ${barbearia.name}`}
                        className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-[1.03]"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement
                          el.style.display = 'none'
                          if (el.parentElement) {
                            el.parentElement.style.background =
                              'linear-gradient(135deg, #6d5bd9 0%, #8b7fe9 100%)'
                          }
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Store size={52} strokeWidth={1.75} className="text-white/40" />
                      </div>
                    )}

                    {/* Gradiente sutil no rodapé da imagem */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%)',
                      }}
                      aria-hidden
                    />

                    {/* ===== STATUS ABERTA/FECHADA (pill verde/cinza) ===== */}
                    <div
                      className="absolute top-4 right-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[14px] font-extrabold tracking-tight"
                        style={{ backgroundColor: status.bg, color: status.text }}
                      >
                        {status === STATUS_ABERTA && (
                          <span className="w-2 h-2 rounded-full bg-current" />
                        )}
                        {status.label}
                      </span>
                    </div>

                    {/* Badge de unidade ativa (canto superior esquerdo) */}
                    {isAtiva && (
                      <div
                        className="absolute top-4 left-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-extrabold tracking-tight text-white shadow-[0_4px_12px_-4px_rgba(109,91,217,0.45)]"
                          style={{ backgroundColor: '#6d5bd9' }}
                        >
                          <Check size={12} strokeWidth={2.8} />
                          Ativa
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ==== CONTEÚDO ABAIXO DA IMAGEM ==== */}
                  <div className="flex flex-col gap-3 p-5 md:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h2
                          className="font-extrabold tracking-tight text-[#2b2238] line-clamp-1"
                          style={{ fontSize: '19px', letterSpacing: '-0.01em' }}
                        >
                          {barbearia.name}
                        </h2>
                        <p
                          className="mt-1 text-[15px] font-medium leading-snug line-clamp-2 flex items-start gap-1.5"
                          style={{ color: '#6b6478' }}
                        >
                          <MapPin
                            size={14}
                            strokeWidth={2}
                            className="text-[#9b93b0] shrink-0 mt-0.5"
                          />
                          <span>{barbearia.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Atalhos rápidos: visíveis em MOBILE e DESKTOP */}
                    <div
                      className="flex items-center gap-2 pt-2 border-t"
                      style={{ borderColor: '#f2edfa' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        to={`/owner/barbershops/${barbearia.id}/professionals`}
                        onClick={() => selecionarBarbearia(barbearia.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-[14px] text-[13px] font-bold text-[#6d5bd9] bg-[#efe8ff] hover:bg-[#e5ddf7] active:bg-[#ddcff7] transition-colors"
                      >
                        <Users size={14} strokeWidth={2} />
                        <span className="hidden sm:inline">Equipe</span>
                        <span className="sm:hidden">Barbeiros</span>
                      </Link>
                      <Link
                        to={`/owner/barbershops/${barbearia.id}/services`}
                        onClick={() => selecionarBarbearia(barbearia.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-[14px] text-[13px] font-bold text-[#6d5bd9] bg-[#efe8ff] hover:bg-[#e5ddf7] active:bg-[#ddcff7] transition-colors"
                      >
                        <Scissors size={14} strokeWidth={2} />
                        Serviços
                      </Link>
                      <Link
                        to={`/owner/barbershops/${barbearia.id}/hours`}
                        onClick={() => selecionarBarbearia(barbearia.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-[14px] text-[13px] font-bold text-[#6d5bd9] bg-[#efe8ff] hover:bg-[#e5ddf7] active:bg-[#ddcff7] transition-colors"
                      >
                        <Clock size={14} strokeWidth={2} />
                        Horários
                      </Link>
                      <Link
                        to={`/owner/barbershops/${barbearia.id}`}
                        onClick={() => selecionarBarbearia(barbearia.id)}
                        className="w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-[14px] text-[#837c92] bg-white border border-[#ebe7f5] hover:border-[#d6cdf8] hover:text-[#6d5bd9] transition-colors"
                        title="Configurações"
                      >
                        <Settings size={15} strokeWidth={2} />
                      </Link>
                    </div>

                    {/* Telefone mobile (opcional, discreto) */}
                    <div
                      className="md:hidden flex items-center gap-1.5 text-[13px] font-semibold"
                      style={{ color: '#9b93b0' }}
                    >
                      <Phone size={12} strokeWidth={2} />
                      <span>{barbearia.phone}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>

      {/* ===== BOTTOM NAV (mobile) ===== */}
      <BottomNav />

      {/* ===== FAB: Botão flutuante + NOVA BARBEARIA (canto inf. direito) ===== */}
      {!mostrarFormulario && minhasBarbearias.length > 0 && (
        <div className="fixed z-30 md:hidden" style={{ right: '1.25rem', bottom: '6.25rem' }}>
          <button
            type="button"
            onClick={() => setMostrarFormulario(true)}
            aria-label="Nova barbearia"
            className={[
              'w-16 h-16 rounded-full flex items-center justify-center',
              'text-[#6d5bd9] transition-all duration-150 active:scale-95',
              'shadow-[0_10px_28px_-8px_rgba(109,91,217,0.55)]',
            ].join(' ')}
            style={{ backgroundColor: '#e9e3ff' }}
          >
            <Plus size={32} strokeWidth={2.1} />
          </button>
        </div>
      )}

      {/* Botão visível no desktop (direita, abaixo da lista) */}
      {!mostrarFormulario && minhasBarbearias.length > 0 && (
        <div className="hidden md:block fixed right-8 bottom-8 z-30">
          <button
            type="button"
            onClick={() => setMostrarFormulario(true)}
            className={[
              'inline-flex items-center justify-center gap-2 h-14 px-6 rounded-full',
              'text-white font-extrabold tracking-tight text-[16px]',
              'shadow-[0_10px_30px_-8px_rgba(109,91,217,0.55)]',
              'bg-[#6d5bd9] hover:bg-[#5d4bc9] transition-all duration-150 active:scale-[0.99]',
            ].join(' ')}
          >
            <Plus size={20} strokeWidth={2.2} />
            Nova Barbearia
          </button>
        </div>
      )}
    </div>
  )
}
