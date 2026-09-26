import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Clock,
  User as UserIcon,
  Scissors,
  RefreshCw,
} from 'lucide-react'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useAgendamento } from '../features/agendamento/model/useAgendamento'
import { useAuth } from '../features/auth/model/useAuth'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { BottomNav } from '../shared/ui/BottomNav'
import type { BusinessHours } from '../entities/barbershop/types'
import type { Professional } from '../entities/professional/types'
import type { Service } from '../entities/service/types'

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarTelefone(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '')
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  }
  return telefone
}

function estaAbertoAgora(horarios: BusinessHours[]): boolean {
  const agora = new Date()
  const horarioDeHoje = horarios.find((h) => h.dayOfWeek === agora.getDay())
  if (!horarioDeHoje) return false
  const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
  return horaAtual >= horarioDeHoje.openTime.slice(0, 5) && horaAtual < horarioDeHoje.closeTime.slice(0, 5)
}

function getHorarioHoje(horarios: BusinessHours[]): string | null {
  const hoje = new Date().getDay()
  const h = horarios.find((x) => x.dayOfWeek === hoje)
  if (!h) return null
  return `${h.openTime.slice(0, 5)} - ${h.closeTime.slice(0, 5)}`
}

type TabId = 'servicos' | 'profissionais'

function ProfessionalAvatarCard({
  profissional,
  selecionado,
  onClick,
}: {
  profissional: Professional
  selecionado: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2.5 w-[96px] shrink-0 group"
    >
      <div
        className="w-20 h-20 rounded-full p-[3px] transition-all duration-200 group-hover:shadow-lg group-hover:shadow-[#6d5bd9]/25"
        style={{
          background: selecionado
            ? 'linear-gradient(135deg, #6d5bd9 0%, #8b7fe9 100%)'
            : 'linear-gradient(135deg, #e9e3ff 0%, #f4efff 100%)',
          boxShadow: selecionado ? '0 4px 12px -3px rgba(109,91,217,0.45)' : undefined,
        }}
      >
        <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
          {profissional.avatarUrl ? (
            <img
              src={profissional.avatarUrl}
              alt={`Foto de ${profissional.name}`}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <UserIcon
              size={28}
              className={selecionado ? 'text-[#6d5bd9]/70' : 'text-[#6d5bd9]/35'}
            />
          )}
        </div>
      </div>
      <span
        className="text-[15px] font-bold tracking-tight line-clamp-1"
        style={{ color: selecionado ? '#6d5bd9' : '#2b2638' }}
      >
        {profissional.name}
      </span>
    </button>
  )
}

function ServiceCard({
  servico,
  onAgendar,
}: {
  servico: Service
  onAgendar: () => void
}) {
  const precoFormatado = formatPrice(servico.price)
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#ebe7f5] transition-all duration-200 hover:border-[#d3c8ff] hover:shadow-[0_3px_12px_-4px_rgba(109,91,217,0.22)]"
      style={{ padding: '18px 20px', borderRadius: '18px' }}
    >
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <h4
          className="font-bold tracking-tight text-[#1a1722] leading-tight line-clamp-2"
          style={{ fontSize: '18px' }}
        >
          {servico.name}
        </h4>
        <p
          className="text-[14px] text-[#666172] font-medium leading-snug"
          style={{ color: '#666172' }}
        >
          Duração: {servico.durationMinutes} min • {precoFormatado}
        </p>
      </div>

      <button
        type="button"
        onClick={onAgendar}
        className="shrink-0 self-start sm:self-center inline-flex items-center justify-center text-white font-bold hover:bg-[#5d4bc9] active:scale-[0.985] transition-all duration-150 shadow-[0_3px_10px_-3px_rgba(109,91,217,0.45)]"
        style={{
          backgroundColor: '#6d5bd9',
          padding: '11px 23px',
          borderRadius: '999px',
          fontSize: '15px',
          minWidth: '110px',
        }}
      >
        Agendar
      </button>
    </div>
  )
}

export function BarbershopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    barbearia,
    profissionais,
    servicos,
    horarios,
    loading,
    error,
    buscarBarbearia,
    listarProfissionais,
    listarServicos,
    listarHorarios,
  } = useBarbeiro()
  const { buscarMeuProfissional } = useAgendamento()
  const { user } = useAuth()

  const [tab, setTab] = useState<TabId>('servicos')
  const [meuProfissionalId, setMeuProfissionalId] = useState<string | null>(null)
  const [profissionalSelecionadoId, setProfissionalSelecionadoId] = useState<string | null>(null)

  const ehProfissional = !!user?.roles.includes('profissional')

  useEffect(() => {
    if (!id) return
    buscarBarbearia(id)
    listarProfissionais(id)
    listarServicos(id)
    listarHorarios(id)
  }, [id, buscarBarbearia, listarProfissionais, listarServicos, listarHorarios])

  useEffect(() => {
    if (!id || !ehProfissional) return
    buscarMeuProfissional().then((meuProfissional) => {
      if (meuProfissional?.barbershopId === id) {
        setMeuProfissionalId(meuProfissional.id)
      }
    })
  }, [id, ehProfissional, buscarMeuProfissional])

  const profissionaisSelecionaveis = useMemo(
    () => profissionais.filter((p) => p.id !== meuProfissionalId),
    [profissionais, meuProfissionalId],
  )

  useEffect(() => {
    if (profissionaisSelecionaveis.length > 0 && !profissionalSelecionadoId) {
      setProfissionalSelecionadoId(profissionaisSelecionaveis[0].id)
    }
  }, [profissionaisSelecionaveis, profissionalSelecionadoId])

  const aberto = estaAbertoAgora(horarios)
  const horarioHoje = getHorarioHoje(horarios)

  function handleAgendar(servico: Service) {
    const profissionalParaUsar =
      profissionalSelecionadoId ??
      (profissionaisSelecionaveis.length === 1 ? profissionaisSelecionaveis[0].id : undefined)
    const params = new URLSearchParams()
    params.set('barbershopId', id ?? '')
    params.set('serviceId', servico.id)
    if (profissionalParaUsar) params.set('professionalId', profissionalParaUsar)
    navigate(`/appointments/new?${params.toString()}`)
  }

  function handleVoltar() {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-28 md:pb-8">
      {/* Header simples (barra superior) */}
      <header
        className="bg-[#fef7ff] sticky top-0 z-30 border-b border-[#ece8f5]/50"
      >
        <div className="max-w-md mx-auto px-5 h-16 flex items-center gap-3">
          <button
            type="button"
            onClick={handleVoltar}
            aria-label="Voltar"
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e9e3ff] active:bg-[#d3c8ff] transition-colors"
          >
            <ArrowLeft size={24} strokeWidth={2.2} className="text-[#1a1722]" />
          </button>
          <h1
            className="flex-1 min-w-0 font-bold tracking-tight text-[#1a1722] truncate"
            style={{ fontSize: '21px', letterSpacing: '-0.01em' }}
          >
            {barbearia?.name ?? 'Barbearia'}
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto flex flex-col">
        {/* Loading */}
        {loading && !barbearia && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 px-5">
            <LoadingSpinner size="lg" tone="selected" />
            <p className="text-sm text-[#6b6778]">Carregando informações da barbearia...</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="px-5 pt-5 flex flex-col gap-3">
            <ErrorMessage>{error}</ErrorMessage>
            <div className="flex">
              <button
                type="button"
                onClick={() => id && buscarBarbearia(id).then(() => listarProfissionais(id)).then(() => listarServicos(id)).then(() => listarHorarios(id))}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#6d5bd9] bg-[#e9e3ff] rounded-xl hover:bg-[#d3c8ff] transition-colors"
              >
                <RefreshCw size={14} />
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {barbearia && (
          <>
            {/* FOTO DE CAPA */}
            <div
              className="relative w-full bg-gradient-to-br from-[#6d5bd9]/12 via-white to-[#efe8ff]"
              style={{ aspectRatio: '16 / 9' }}
            >
              {barbearia.avatarUrl ? (
                <img
                  src={barbearia.avatarUrl}
                  alt={`Fachada da ${barbearia.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Scissors size={56} strokeWidth={1.7} className="text-[#6d5bd9]/35" />
                </div>
              )}
            </div>

            {/* INFO BARBEARIA (abaixo da foto) */}
            <section
              className="bg-[#efe8ff] flex flex-col gap-2.5"
              style={{ padding: '17px 20px 20px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}
            >
              <div className="flex items-start justify-between gap-4">
                <h2
                  className="font-extrabold tracking-tight text-[#1a1722] leading-tight line-clamp-1"
                  style={{ fontSize: '2rem', letterSpacing: '-0.025em' }}
                >
                  {barbearia.name}
                </h2>
                <div className="flex items-center gap-1.5 shrink-0 pt-1">
                  <Star size={17} className="text-[#eab308] fill-[#eab308]" />
                  <span
                    className="font-bold tracking-tight text-[#2b2638]"
                    style={{ fontSize: '18px' }}
                  >
                    4,9
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[15px] text-[#44404f] font-medium leading-snug flex-wrap">
                <MapPin size={16} strokeWidth={2} className="text-[#6f6880] shrink-0" />
                <span className="min-w-0 truncate">{barbearia.address}</span>
                <span className="text-[#6f6880]">•</span>
                <Phone size={16} strokeWidth={2} className="text-[#6f6880] shrink-0" />
                <span className="shrink-0">{formatarTelefone(barbearia.phone)}</span>
              </div>

              <div className="flex items-center gap-2 text-[15px] font-bold tracking-tight pt-0.5">
                <span className="text-[#6d5bd9]">
                  {aberto ? 'Aberto hoje' : 'Fechado hoje'}
                </span>
                {horarioHoje && (
                  <>
                    <span className="text-[#6d5bd9]">•</span>
                    <span className="text-[#6d5bd9]">{horarioHoje}</span>
                  </>
                )}
                <Clock
                  size={15}
                  strokeWidth={2.2}
                  className="text-[#6d5bd9] shrink-0 ml-0.5"
                />
              </div>
            </section>

            {/* TABS (Serviços / Profissionais) */}
            <section className="px-5 pt-6 flex flex-col gap-5">
              <div
                className="flex items-center gap-2 flex-wrap"
                role="tablist"
                aria-label="Informações da barbearia"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'servicos'}
                  onClick={() => setTab('servicos')}
                  className={[
                    'inline-flex items-center justify-center',
                    'rounded-full transition-all duration-150',
                    'font-bold tracking-tight',
                    tab === 'servicos'
                      ? 'bg-[#e9e3ff] text-[#6d5bd9] shadow-[0_1px_3px_rgba(109,91,217,0.15)]'
                      : 'bg-[#ece8f5] text-[#5b5669] hover:bg-[#e4def0]',
                  ].join(' ')}
                  style={{ padding: '10px 24px', fontSize: '17px' }}
                >
                  Serviços
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'profissionais'}
                  onClick={() => setTab('profissionais')}
                  className={[
                    'inline-flex items-center justify-center',
                    'rounded-full transition-all duration-150',
                    'font-bold tracking-tight',
                    tab === 'profissionais'
                      ? 'bg-[#e9e3ff] text-[#6d5bd9] shadow-[0_1px_3px_rgba(109,91,217,0.15)]'
                      : 'bg-[#ece8f5] text-[#5b5669] hover:bg-[#e4def0]',
                  ].join(' ')}
                  style={{ padding: '10px 24px', fontSize: '17px' }}
                >
                  Profissionais
                </button>
              </div>

              {/* Profissionais disponíveis */}
              <section className="flex flex-col gap-3.5 -mx-5 px-5">
                <h3
                  className="font-bold tracking-tight text-[#1a1722]"
                  style={{ fontSize: '1.3rem' }}
                >
                  Profissionais disponíveis
                </h3>

                {profissionaisSelecionaveis.length === 0 ? (
                  <div
                    className="bg-white border border-[#ebe7f5] p-5 flex flex-col items-center text-center gap-2.5"
                    style={{ borderRadius: '18px' }}
                  >
                    <UserIcon size={24} strokeWidth={1.8} className="text-[#8c8699]" />
                    <p className="font-bold text-[#4a4657] text-[15px]">
                      Nenhum profissional cadastrado
                    </p>
                  </div>
                ) : (
                  <div
                    className="flex gap-7 overflow-x-auto pb-4 -mx-5 px-5"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {profissionaisSelecionaveis.map((p) => (
                      <ProfessionalAvatarCard
                        key={p.id}
                        profissional={p}
                        selecionado={p.id === profissionalSelecionadoId}
                        onClick={() => setProfissionalSelecionadoId(p.id)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Serviços em Destaque */}
              <section className="flex flex-col gap-3.5 pb-2 mb-2">
                <h3
                  className="font-bold tracking-tight text-[#1a1722]"
                  style={{ fontSize: '1.3rem' }}
                >
                  Serviços em Destaque
                </h3>

                {tab === 'profissionais' && servicos.length === 0 ? (
                  <div
                    className="bg-white border border-[#ebe7f5] p-5 flex flex-col items-center text-center gap-2.5"
                    style={{ borderRadius: '18px' }}
                  >
                    <Scissors size={24} strokeWidth={1.8} className="text-[#8c8699]" />
                    <p className="font-bold text-[#4a4657] text-[15px]">
                      Nenhum serviço cadastrado
                    </p>
                  </div>
                ) : servicos.length === 0 ? (
                  <div
                    className="bg-white border border-[#ebe7f5] p-5 flex flex-col items-center text-center gap-2.5"
                    style={{ borderRadius: '18px' }}
                  >
                    <Scissors size={24} strokeWidth={1.8} className="text-[#8c8699]" />
                    <p className="font-bold text-[#4a4657] text-[15px]">
                      Nenhum serviço cadastrado
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    {servicos.map((s) => (
                      <ServiceCard
                        key={s.id}
                        servico={s}
                        onAgendar={() => handleAgendar(s)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
