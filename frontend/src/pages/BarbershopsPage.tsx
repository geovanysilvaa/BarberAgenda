import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Scissors,
  MapPin,
  Star,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  X,
  RefreshCw,
  User as UserIcon,
  CalendarClock,
  Ban,
  ChevronRight,
  Store,
} from 'lucide-react'
import { useAuth } from '../features/auth/model/useAuth'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useAgendamento } from '../features/agendamento/model/useAgendamento'
import { BottomNav } from '../shared/ui/BottomNav'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import type { Appointment } from '../entities/appointment/types'
import type { Barbershop } from '../entities/barbershop/types'

const CATEGORIAS_ACESSO_RAPIDO = [
  { id: 'cabelo', label: 'Cabelo' },
  { id: 'barba', label: 'Barba' },
  { id: 'combo', label: 'Combo' },
  { id: 'sobrancelha', label: 'Sobrancelha' },
] as const

const AVALIACOES_FAKE: Record<string, string> = {
  default: '4,9',
}
const DISTANCIAS_FAKE = ['1,2 km', '2,4 km', '3,1 km', '4,7 km', '5,5 km', '6,0 km']

function formatarData(dataIso: string): string {
  const data = new Date(dataIso + 'T00:00:00')
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)
  const diffDias = Math.round((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

  const diaMes = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '')
    .replace(/^(\w{3}) (\d+)$/i, (_, mes, dia) => {
      const mesCap = mes.charAt(0).toUpperCase() + mes.slice(1)
      return `${dia} ${mesCap}`
    })

  if (diffDias === 0) return `Hoje, ${diaMes}`
  if (diffDias === 1) return `Amanhã, ${diaMes}`
  return diaMes
}

function pegarPrimeiroNome(nomeCompleto: string): string {
  return nomeCompleto.trim().split(/\s+/)[0]
}

function getProximosAgendamentos(agendamentos: Appointment[]): Appointment[] {
  const agora = new Date()
  return agendamentos
    .filter((a) => a.status === 'agendado')
    .filter((a) => {
      const dataHora = new Date(`${a.date}T${a.startTime}`)
      return dataHora >= agora
    })
    .sort((a, b) => {
      const aData = new Date(`${a.date}T${a.startTime}`)
      const bData = new Date(`${b.date}T${b.startTime}`)
      return aData.getTime() - bData.getTime()
    })
    .slice(0, 2)
}

function getAvaliacao(_b: Barbershop, index: number): string {
  const notas = ['4,9', '4,8', '4,7', '5,0', '4,6', '4,9']
  return notas[index % notas.length] ?? AVALIACOES_FAKE.default
}

function getDistancia(index: number): string {
  return DISTANCIAS_FAKE[index % DISTANCIAS_FAKE.length]
}

function BarbershopListItemCard({
  barbearia,
  avaliacao,
  distancia,
}: {
  barbearia: Barbershop
  avaliacao: string
  distancia: string
}) {
  return (
    <Link
      to={`/barbershops/${barbearia.id}`}
      className="group w-full flex flex-col transition-all duration-150 active:scale-[0.995]"
    >
      <div
        className="flex flex-col bg-[#efe8ff] overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-[#6d5bd9]/18"
        style={{ borderRadius: '22px', border: '1px solid #e6defb' }}
      >
        {/* Imagem (topo com rounded apenas no topo) */}
        <div
          className="relative w-full bg-gradient-to-br from-[#6d5bd9]/15 via-[#efe8ff] to-white"
          style={{ aspectRatio: '16 / 9', borderTopLeftRadius: '22px', borderTopRightRadius: '22px' }}
        >
          {barbearia.avatarUrl ? (
            <img
              src={barbearia.avatarUrl}
              alt={`Fachada da ${barbearia.name}`}
              className="w-full h-full object-cover"
              style={{ borderTopLeftRadius: '22px', borderTopRightRadius: '22px' }}
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Scissors size={44} strokeWidth={1.7} className="text-[#6d5bd9]/40" />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col gap-2" style={{ padding: '15px 18px 17px' }}>
          <h3
            className="font-bold tracking-tight text-[#1a1722] line-clamp-1 group-hover:text-[#6d5bd9] transition-colors"
            style={{ fontSize: '19px' }}
          >
            {barbearia.name}
          </h3>
          <p className="text-[14px] text-[#666172] leading-snug line-clamp-1" style={{ color: '#666172' }}>
            {barbearia.address}
          </p>
          <div className="flex items-center justify-between gap-3 mt-1.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <Star size={15} className="text-[#eab308] fill-[#eab308]" />
              <span className="text-[15px] font-bold text-[#2b2638]">{avaliacao}</span>
            </div>
            <span className="text-[15px] font-bold text-[#6d5bd9] tracking-tight shrink-0">
              {distancia}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function BarbershopsPage() {
  const [searchParams] = useSearchParams()
  const ehTelaBusca = searchParams.get('tab') === 'buscar'

  const { user } = useAuth()
  const { barbearias, loading: loadingBarbearias, error: erroBarbearias, listarBarbearias } = useBarbeiro()
  const { agendamentos, loading: loadingAgendamentos, listarMeusAgendamentos } = useAgendamento()
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>('cabelo')

  useEffect(() => {
    listarBarbearias()
    listarMeusAgendamentos()
  }, [listarBarbearias, listarMeusAgendamentos])

  const destaques = useMemo(() => barbearias.slice(0, 5), [barbearias])

  const proximosAgendamentos = useMemo(
    () => getProximosAgendamentos(agendamentos),
    [agendamentos],
  )

  const barbeariasFiltradas = useMemo(() => {
    if (!busca.trim()) return barbearias
    const termo = busca.toLowerCase().trim()
    return barbearias.filter(
      (b) =>
        b.name.toLowerCase().includes(termo) ||
        b.address.toLowerCase().includes(termo) ||
        b.phone.includes(termo),
    )
  }, [barbearias, busca])

  const estaCarregando = loadingBarbearias || loadingAgendamentos
  const primeiroNome = user ? pegarPrimeiroNome(user.name) : 'Usuário'

  // =========================================================================
  // VIEW 1: LISTA DE BARBEARIAS (tab=buscar)
  // =========================================================================
  if (ehTelaBusca) {
    return (
      <div className="min-h-screen bg-[#fef7ff] pb-28 md:pb-8">
        <main className="max-w-md mx-auto px-5 pt-6 pb-4 flex flex-col gap-5">
          {/* Título */}
          <h1
            className="font-bold tracking-tight text-[#1a1722]"
            style={{ fontSize: '2rem', letterSpacing: '-0.02em' }}
          >
            Barbearias
          </h1>

          {/* Campo de busca (contornado, cinza) */}
          <div className="relative w-full">
            <Search
              size={22}
              strokeWidth={2.1}
              className="absolute text-[#6d5bd9] pointer-events-none"
              style={{ left: '1.1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Buscar por nome, endereço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="
                w-full
                bg-white
                text-[#1a1a1a] text-[15px]
                placeholder:text-[#8f889e]
                rounded-[26px]
                border-2 border-[#d4cde4]
                focus:outline-none
                focus:border-[#6d5bd9]
                focus:ring-4
                focus:ring-[#d3c8ff]/50
                transition-all duration-150
              "
              style={{ padding: '14px 3rem 14px 3.3rem' }}
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                aria-label="Limpar busca"
                className="absolute text-[#8f889e] hover:text-[#6d5bd9] transition-colors rounded-md"
                style={{ right: '1rem', top: '50%', transform: 'translateY(-50%)', padding: '4px' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Erro */}
          {erroBarbearias && (
            <div className="flex flex-col gap-3">
              <ErrorMessage>{erroBarbearias}</ErrorMessage>
              <div className="flex">
                <button
                  type="button"
                  onClick={listarBarbearias}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#6d5bd9] bg-[#e9e3ff] rounded-xl hover:bg-[#d3c8ff] transition-colors"
                >
                  <RefreshCw size={14} />
                  Tentar novamente
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {estaCarregando && barbearias.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <LoadingSpinner size="lg" tone="selected" />
              <p className="text-sm text-[#6b6778]">Carregando barbearias...</p>
            </div>
          )}

          {/* Nenhum resultado */}
          {!estaCarregando && !erroBarbearias && barbeariasFiltradas.length === 0 && (
            <div className="bg-white border border-[#ebe7f5] p-6 flex flex-col items-center text-center gap-3" style={{ borderRadius: '22px' }}>
              <Search size={26} strokeWidth={1.75} className="text-[#8c8699]" />
              <div>
                <p className="font-bold text-[#4a4657] text-[15px]">
                  {busca.trim() ? `Nada encontrado para "${busca}"` : 'Nenhuma barbearia por aqui'}
                </p>
                <p className="text-sm text-[#6b6778] mt-1">
                  {busca.trim()
                    ? 'Tente buscar por outro nome, bairro ou rua.'
                    : 'Tente novamente mais tarde, novas parceiras chegando em breve!'}
                </p>
              </div>
            </div>
          )}

          {/* Lista */}
          {!estaCarregando && !erroBarbearias && barbeariasFiltradas.length > 0 && (
            <div className="flex flex-col gap-4 -mx-5 px-5 pb-1">
              {barbeariasFiltradas.map((b, idx) => (
                <BarbershopListItemCard
                  key={b.id}
                  barbearia={b}
                  avaliacao={getAvaliacao(b, idx)}
                  distancia={getDistancia(idx)}
                />
              ))}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: DASHBOARD (padrão, igual a home pós-login)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#fef7ff] pb-28 md:pb-8">
      {/* Header Roxo */}
      <header
        className="bg-[#7862e0] px-5 pt-6 pb-8"
        style={{ borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}
      >
        <div className="max-w-md mx-auto flex flex-col gap-5">
          {/* Saudação + Avatar */}
          <div className="flex items-start justify-between gap-4 pt-2">
            <div className="min-w-0 flex flex-col gap-1.5">
              <p className="text-[#e2dbff] text-[16px] font-medium">
                Olá, {primeiroNome}!
              </p>
              <h1 className="text-white font-bold tracking-tight leading-tight"
                  style={{ fontSize: '2.05rem', letterSpacing: '-0.02em' }}>
                Escolha o seu estilo
              </h1>
            </div>

            <Link
              to="/profile"
              className="shrink-0 w-14 h-14 rounded-full bg-white p-[2.5px] hover:opacity-90 transition-opacity shadow-[0_4px_14px_-6px_rgba(0,0,0,0.25)]"
            >
              <div className="w-full h-full rounded-full bg-[#dcd3ff] flex items-center justify-center overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`Foto de ${user.name}`}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <UserIcon size={24} className="text-[#7862e0]" />
                )}
              </div>
            </Link>
          </div>

          {/* Barra de Busca */}
          <div className="relative mt-1">
            <Search
              size={22}
              strokeWidth={2.1}
              className="absolute text-[#7b748a] pointer-events-none"
              style={{ left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Buscar barbearia, serviços ou profissionais..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="
                w-full
                bg-white
                text-[#1a1a1a] text-[16px]
                placeholder:text-[#8f889e]
                rounded-[30px]
                border-none
                focus:outline-none
                focus:ring-4
                focus:ring-[#c5b6ff]/50
              "
              style={{ padding: '14px 3rem 14px 3.4rem' }}
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                aria-label="Limpar busca"
                className="absolute text-[#8f889e] hover:text-[#7862e0] transition-colors rounded-md"
                style={{ right: '1.1rem', top: '50%', transform: 'translateY(-50%)', padding: '4px' }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-md mx-auto mt-5 px-5 flex flex-col gap-8">
        {/* Ferramentas do Profissional/Owner (aparece apenas para esses roles) */}
        {(user?.roles.includes('profissional') || user?.roles.includes('owner')) && (
          <section className="flex flex-col gap-3 -mt-1">
            <h3
              className="font-bold tracking-tight text-[#6d5bd9] px-1"
              style={{ fontSize: '15px', letterSpacing: '0.02em' }}
            >
              MINHAS FERRAMENTAS
            </h3>

            {user?.roles.includes('profissional') && (
              <>
                <Link
                  to="/professional/schedule"
                  className="w-full bg-white rounded-[22px] p-5 shadow-[0_1px_2px_rgba(18,17,51,0.04),0_8px_24px_-8px_rgba(109,91,217,0.12)] border border-[#efe8ff] hover:border-[#d6cdf8] transition-all active:scale-[0.995]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] bg-[#efe8ff] text-[#6d5bd9] flex items-center justify-center shrink-0">
                      <CalendarClock size={24} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[19px] font-bold text-[#2b2238] leading-tight">
                        Minha Agenda
                      </div>
                      <div className="text-[15px] text-[#6b6478] mt-0.5 truncate">
                        Veja e gerencie seus atendimentos do dia
                      </div>
                    </div>
                    <ChevronRight size={22} strokeWidth={1.9} className="text-[#c8c1d6] shrink-0" />
                  </div>
                </Link>

                <Link
                  to="/professional/unavailability"
                  className="w-full bg-white rounded-[22px] p-5 shadow-[0_1px_2px_rgba(18,17,51,0.04),0_8px_24px_-8px_rgba(109,91,217,0.12)] border border-[#efe8ff] hover:border-[#d6cdf8] transition-all active:scale-[0.995]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] bg-[#f4efff] text-[#6d5bd9] flex items-center justify-center shrink-0">
                      <Ban size={24} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[19px] font-bold text-[#2b2238] leading-tight">
                        Indisponibilidades
                      </div>
                      <div className="text-[15px] text-[#6b6478] mt-0.5 truncate">
                        Bloqueie horários de almoço, folgas e afazeres
                      </div>
                    </div>
                    <ChevronRight size={22} strokeWidth={1.9} className="text-[#c8c1d6] shrink-0" />
                  </div>
                </Link>
              </>
            )}

            {user?.roles.includes('owner') && (
              <Link
                to="/owner/barbershops"
                className="w-full bg-white rounded-[22px] p-5 shadow-[0_1px_2px_rgba(18,17,51,0.04),0_8px_24px_-8px_rgba(109,91,217,0.12)] border border-[#efe8ff] hover:border-[#d6cdf8] transition-all active:scale-[0.995]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[18px] bg-[#fff3e0] text-[#c57e0a] flex items-center justify-center shrink-0">
                    <Store size={24} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[19px] font-bold text-[#2b2238] leading-tight">
                      Minhas Barbearias
                    </div>
                    <div className="text-[15px] text-[#6b6478] mt-0.5 truncate">
                      Gerencie suas barbearias, equipes e serviços
                    </div>
                  </div>
                  <ChevronRight size={22} strokeWidth={1.9} className="text-[#c8c1d6] shrink-0" />
                </div>
              </Link>
            )}
          </section>
        )}

        {/* Acesso Rápido */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[#1e1c24] font-bold tracking-tight" style={{ fontSize: '1.35rem' }}>
            Acesso rápido
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIAS_ACESSO_RAPIDO.map((cat) => {
              const ativa = categoriaAtiva === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaAtiva(ativa ? null : cat.id)}
                  aria-pressed={ativa}
                  className={[
                    'inline-flex items-center gap-2',
                    'rounded-full transition-all duration-150',
                    'text-[15px] font-semibold tracking-tight',
                    ativa
                      ? 'bg-[#e9e3ff] text-[#6d5bd9] shadow-[0_1px_2px_rgba(109,91,217,0.12)]'
                      : 'bg-white text-[#3f3b4b] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#ece8f5]',
                  ].join(' ')}
                  style={{ padding: '9px 17px 9px 14px' }}
                >
                  <Scissors
                    size={17}
                    strokeWidth={2.1}
                  />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* Erro ao carregar */}
        {erroBarbearias && (
          <div className="flex flex-col gap-3">
            <ErrorMessage>{erroBarbearias}</ErrorMessage>
            <div className="flex">
              <button
                type="button"
                onClick={listarBarbearias}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#6d5bd9] bg-[#e9e3ff] rounded-xl hover:bg-[#d3c8ff] transition-colors"
              >
                <RefreshCw size={14} />
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Loading inicial */}
        {estaCarregando && barbearias.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <LoadingSpinner size="lg" tone="selected" />
            <p className="text-sm text-[#6b6778]">Carregando sua página inicial...</p>
          </div>
        )}

        {/* Destaques da semana */}
        {!estaCarregando && !erroBarbearias && destaques.length > 0 && (
          <section className="flex flex-col gap-3 -mx-5 px-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[#1e1c24] font-bold tracking-tight" style={{ fontSize: '1.35rem' }}>
                Destaques da semana
              </h2>
              <Link
                to="/barbershops?tab=buscar"
                className="text-[#6d5bd9] text-[15px] font-bold hover:underline shrink-0"
              >
                Ver tudo
              </Link>
            </div>

            <div
              className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {destaques.map((b) => (
                <Link
                  key={b.id}
                  to={`/barbershops/${b.id}`}
                  className="shrink-0 w-[232px] group"
                >
                  <div
                    className="flex flex-col bg-[#e9e3ff] overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-[#6d5bd9]/20"
                    style={{ borderRadius: '22px' }}
                  >
                    <div
                      className="relative w-full bg-gradient-to-br from-[#6d5bd9]/20 via-[#e9e3ff] to-white"
                      style={{ aspectRatio: '16 / 11', borderTopLeftRadius: '22px', borderTopRightRadius: '22px' }}
                    >
                      {b.avatarUrl ? (
                        <img
                          src={b.avatarUrl}
                          alt={`Fachada da ${b.name}`}
                          className="w-full h-full object-cover"
                          style={{ borderTopLeftRadius: '22px', borderTopRightRadius: '22px' }}
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Scissors size={40} strokeWidth={1.75} className="text-[#6d5bd9]/45" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5" style={{ padding: '14px 16px 16px' }}>
                      <h3
                        className="font-bold tracking-tight text-[#2b2638] line-clamp-1 group-hover:text-[#6d5bd9] transition-colors"
                        style={{ fontSize: '17px' }}
                      >
                        {b.name}
                      </h3>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="min-w-0 flex items-center gap-1.5 text-[#686175] text-[14px] font-medium shrink-0">
                          <MapPin size={13} strokeWidth={2} className="shrink-0 text-[#8a829b]" />
                          <span className="truncate">{b.address.split(',')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star size={14} className="text-[#eab308] fill-[#eab308]" />
                          <span className="text-[15px] font-bold text-[#2b2638]">4,9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Próximos agendamentos */}
        {!estaCarregando && proximosAgendamentos.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[#1e1c24] font-bold tracking-tight" style={{ fontSize: '1.35rem' }}>
              Próximos agendamentos
            </h2>
            <div className="flex flex-col gap-3.5">
              {proximosAgendamentos.map((ag) => {
                const dataFormatada = formatarData(ag.date)
                return (
                  <div
                    key={ag.id}
                    className="
                      bg-[#ebe6ff]
                      border-2 border-[#d3c8ff]
                      flex flex-col gap-3.5
                    "
                    style={{ borderRadius: '20px', padding: '18px 18px 18px 18px' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className="font-bold tracking-tight text-[#5a4c99] leading-tight"
                        style={{ fontSize: '18px' }}
                      >
                        Barbearia Don Corleone
                      </h3>
                      <span
                        className="inline-flex items-center gap-1.5 shrink-0 text-white font-bold"
                        style={{
                          padding: '7px 14px',
                          borderRadius: '999px',
                          fontSize: '13px',
                          backgroundColor: '#2f7d32',
                        }}
                      >
                        <CheckCircle2 size={14} strokeWidth={2.6} />
                        Confirmado
                      </span>
                    </div>

                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-2 text-[#4b4277] text-[15px] font-semibold">
                        <CalendarIcon size={18} strokeWidth={2.1} className="text-[#6d5bd9]" />
                        {dataFormatada}
                      </div>
                      <div className="flex items-center gap-2 text-[#4b4277] text-[15px] font-semibold">
                        <Clock size={18} strokeWidth={2.1} className="text-[#6d5bd9]" />
                        {ag.startTime}
                      </div>
                    </div>

                    <p className="text-[14px] text-[#6f6783] leading-snug">
                      Profissional: <span className="font-semibold text-[#554d75]">{ag.professional.name}</span>{' '}
                      <span className="text-[#554d75]">({ag.service.name})</span>
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Sem agendamentos próximos */}
        {!estaCarregando &&
          !loadingAgendamentos &&
          barbearias.length > 0 &&
          proximosAgendamentos.length === 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-[#1e1c24] font-bold tracking-tight" style={{ fontSize: '1.35rem' }}>
                Próximos agendamentos
              </h2>
              <div
                className="border-2 border-dashed border-[#d3c8ff] bg-white/70 p-5 flex flex-col items-center text-center gap-2.5"
                style={{ borderRadius: '20px' }}
              >
                <CalendarIcon size={28} strokeWidth={1.8} className="text-[#6d5bd9]/50" />
                <div>
                  <p className="font-bold text-[#4a4657] text-[15px]">
                    Nenhum agendamento próximo
                  </p>
                  <p className="text-sm text-[#6b6778] mt-1">
                    Escolha uma barbearia em destaque e marque seu horário.
                  </p>
                </div>
                <Link
                  to="/barbershops?tab=buscar"
                  className="inline-flex items-center gap-1.5 mt-1 text-white text-sm font-bold hover:bg-[#5d4bc9] transition-colors"
                  style={{ padding: '9px 16px', borderRadius: '14px', backgroundColor: '#6d5bd9' }}
                >
                  <Scissors size={15} />
                  Agendar agora
                </Link>
              </div>
            </section>
          )}

        {/* Resultados da busca (dashboard inline) */}
        {busca.trim() && !erroBarbearias && (
          <section className="flex flex-col gap-3 pb-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[#1e1c24] font-bold tracking-tight" style={{ fontSize: '1.35rem' }}>
                Resultados
              </h2>
              <span className="text-xs font-bold text-[#6b6778] bg-white px-3 py-1 rounded-full border border-[#ebe7f5]">
                {barbeariasFiltradas.length} {barbeariasFiltradas.length === 1 ? 'encontrada' : 'encontradas'}
              </span>
            </div>

            {barbeariasFiltradas.length === 0 ? (
              <div className="bg-white border border-[#ebe7f5] p-6 flex flex-col items-center text-center gap-3" style={{ borderRadius: '20px' }}>
                <Search size={26} strokeWidth={1.75} className="text-[#8c8699]" />
                <div>
                  <p className="font-bold text-[#4a4657] text-[15px]">
                    Nada encontrado para "{busca}"
                  </p>
                  <p className="text-sm text-[#6b6778] mt-1">
                    Tente buscar por outro nome, bairro ou serviço.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {barbeariasFiltradas.map((b) => (
                  <Link
                    key={b.id}
                    to={`/barbershops/${b.id}`}
                    className="group bg-white border border-[#ebe7f5] p-4 flex gap-3.5 items-start hover:border-[#d3c8ff] hover:shadow-sm transition-all duration-150"
                    style={{ borderRadius: '18px' }}
                  >
                    <div
                      className="w-14 h-14 bg-[#e9e3ff] flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ borderRadius: '14px' }}
                    >
                      {b.avatarUrl ? (
                        <img
                          src={b.avatarUrl}
                          alt={`Fachada da ${b.name}`}
                          className="w-full h-full object-cover"
                          style={{ borderRadius: '14px' }}
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <Scissors size={22} strokeWidth={2} className="text-[#6d5bd9]/70" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <h3 className="font-bold text-[16px] text-[#1e1c24] line-clamp-1 group-hover:text-[#6d5bd9] transition-colors">
                        {b.name}
                      </h3>
                      <p className="text-sm text-[#6b6778] line-clamp-1 flex items-start gap-1.5">
                        <MapPin size={13} strokeWidth={2} className="mt-0.5 shrink-0 text-[#8c8699]" />
                        {b.address}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Navegação inferior (mobile) */}
      <BottomNav />
    </div>
  )
}
