import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Scissors,
  CalendarX2,
  RefreshCw,
} from 'lucide-react'
import { useAgendamento } from '../features/agendamento/model/useAgendamento'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { StatusBadge } from '../shared/ui/StatusBadge'
import { ApiError } from '../shared/lib/api'
import { BottomNav } from '../shared/ui/BottomNav'
import type { Appointment } from '../entities/appointment/types'

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const

function formatoDataAmigavel(iso: string, hora: string): string {
  try {
    const [ano, mes, dia] = iso.split('-').map(Number)
    if (!ano || !mes || !dia) return `${iso} às ${hora}`

    const dataRef = new Date(ano, mes - 1, dia)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const data = dataRef.getTime()
    const hojeT = hoje.getTime()
    const amanhaT = amanha.getTime()

    const horaCurta = hora.slice(0, 5)
    const diaMes = `${dia} ${MESES_ABREV[mes - 1]}`

    if (data === hojeT) return `Hoje, ${diaMes} às ${horaCurta}`
    if (data === amanhaT) return `Amanhã, ${diaMes} às ${horaCurta}`
    return `${diaMes} às ${horaCurta}`
  } catch {
    return `${iso} às ${hora}`
  }
}

type TabId = 'proximos' | 'historico'

function classificarStatusVisual(ag: Appointment, hojeISO: string): 'confirmado' | 'pendente' {
  if (ag.status !== 'agendado') return ag.status === 'concluido' ? 'confirmado' : 'pendente'
  const [a, m, d] = ag.date.split('-').map(Number)
  const [ha, hm, hd] = hojeISO.split('-').map(Number)
  const dataAg = new Date(a, (m ?? 1) - 1, d ?? 1).getTime()
  const dataHoje = new Date(ha, (hm ?? 1) - 1, hd ?? 1).getTime()
  const diffDias = Math.round((dataAg - dataHoje) / (1000 * 60 * 60 * 24))
  return diffDias <= 2 ? 'confirmado' : 'pendente'
}

const labelStatusVisual: Record<'confirmado' | 'pendente', string> = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
}

export function AppointmentsPage() {
  const navigate = useNavigate()
  const { agendamentos, loading, error, listarMeusAgendamentos, cancelarAgendamento } =
    useAgendamento()
  const { barbearias, listarBarbearias } = useBarbeiro()
  const [acaoErro, setAcaoErro] = useState<string | null>(null)
  const [cancelando, setCancelando] = useState(false)
  const [tab, setTab] = useState<TabId>('proximos')

  const hojeISO = useMemo(() => new Date().toISOString().slice(0, 10), [])

  useEffect(() => {
    listarMeusAgendamentos()
    listarBarbearias()
  }, [listarMeusAgendamentos, listarBarbearias])

  const mapaBarbearias = useMemo(() => {
    const m = new Map<string, string>()
    barbearias.forEach((b) => m.set(b.id, b.name))
    return m
  }, [barbearias])

  function nomeBarbearia(ag: Appointment): string {
    if (ag.barbershop?.name) return ag.barbershop.name
    if (ag.barbershopId && mapaBarbearias.has(ag.barbershopId)) {
      return mapaBarbearias.get(ag.barbershopId) as string
    }
    return 'Barbearia'
  }

  const agendamentosPorTab = useMemo(() => {
    const hojeT = new Date(
      Number(hojeISO.slice(0, 4)),
      Number(hojeISO.slice(5, 7)) - 1,
      Number(hojeISO.slice(8, 10)),
    ).getTime()

    return agendamentos
      .slice()
      .sort((a, b) => {
        const ka = `${a.date} ${a.startTime}`
        const kb = `${b.date} ${b.startTime}`
        return ka.localeCompare(kb)
      })
      .filter((ag) => {
        const [a, m, d] = ag.date.split('-').map(Number)
        const t = new Date(a, (m ?? 1) - 1, d ?? 1).getTime()
        const futuroOuHoje = t >= hojeT
        const ativo = ag.status === 'agendado'
        if (tab === 'proximos') return ativo && futuroOuHoje
        return !(ativo && futuroOuHoje)
      })
  }, [agendamentos, tab, hojeISO])

  async function handleCancelar(ag: Appointment) {
    setCancelando(true)
    setAcaoErro(null)
    try {
      await cancelarAgendamento(ag.id)
      await listarMeusAgendamentos()
    } catch (err) {
      setAcaoErro(
        err instanceof ApiError ? err.message : 'Não foi possível cancelar. Tente novamente.',
      )
    } finally {
      setCancelando(false)
    }
  }

  function handleReagendar(ag: Appointment) {
    const params = new URLSearchParams()
    if (ag.barbershopId) params.set('barbershopId', ag.barbershopId)
    else if (ag.barbershop?.id) params.set('barbershopId', ag.barbershop.id)
    params.set('professionalId', ag.professional.id)
    params.set('serviceId', ag.service.id)
    navigate(`/appointments/new?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-40 md:pb-8">
      <main className="max-w-md mx-auto px-5 pt-8 pb-4 flex flex-col gap-6">
        <h1
          className="font-extrabold tracking-tight text-[#1a1722]"
          style={{ fontSize: '31px', letterSpacing: '-0.02em' }}
        >
          Meus Agendamentos
        </h1>

        <div
          className="grid grid-cols-2 items-center"
          style={{ padding: '5px', borderRadius: '999px', background: '#efe8ff' }}
          role="tablist"
          aria-label="Agendamentos"
        >
          <button
            role="tab"
            aria-selected={tab === 'proximos'}
            type="button"
            onClick={() => setTab('proximos')}
            className={[
              'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150',
              tab === 'proximos'
                ? 'bg-white text-[#6d5bd9] shadow-[0_1px_3px_rgba(109,91,217,0.15)]'
                : 'text-[#837c92] hover:text-[#5b5669]',
            ].join(' ')}
            style={{
              padding: '11px 14px',
              borderRadius: '999px',
              fontSize: '17px',
            }}
          >
            Próximos
          </button>
          <button
            role="tab"
            aria-selected={tab === 'historico'}
            type="button"
            onClick={() => setTab('historico')}
            className={[
              'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150',
              tab === 'historico'
                ? 'bg-white text-[#6d5bd9] shadow-[0_1px_3px_rgba(109,91,217,0.15)]'
                : 'text-[#837c92] hover:text-[#5b5669]',
            ].join(' ')}
            style={{
              padding: '11px 14px',
              borderRadius: '999px',
              fontSize: '17px',
            }}
          >
            Histórico
          </button>
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {acaoErro && <ErrorMessage>{acaoErro}</ErrorMessage>}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" tone="selected" />
            <p className="text-sm text-[#6b6778]">Carregando seus agendamentos...</p>
          </div>
        )}

        {!loading && agendamentosPorTab.length === 0 && (
          <div
            className="bg-white border border-[#ebe7f5] p-8 flex flex-col items-center text-center gap-4"
            style={{ borderRadius: '22px' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: '#f4efff' }}
            >
              <CalendarX2 size={30} strokeWidth={1.9} className="text-[#6d5bd9]/70" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-bold text-[#1a1722]" style={{ fontSize: '18px' }}>
                Nenhum agendamento
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#6b6478', maxWidth: '280px' }}
              >
                {tab === 'proximos'
                  ? 'Você não tem horários marcados para os próximos dias.'
                  : 'Ainda não há agendamentos passados no histórico.'}
              </p>
            </div>
            {tab === 'proximos' && (
              <button
                type="button"
                onClick={() => navigate('/barbershops')}
                className="mt-2 inline-flex items-center justify-center gap-2 text-white font-bold transition-all duration-150 active:scale-[0.992] shadow-[0_6px_16px_-6px_rgba(109,91,217,0.5)]"
                style={{
                  padding: '12px 22px',
                  borderRadius: '999px',
                  backgroundColor: '#6d5bd9',
                  fontSize: '15px',
                }}
              >
                <Scissors size={17} />
                Explorar barbearias
              </button>
            )}
          </div>
        )}

        {!loading && agendamentosPorTab.length > 0 && (
          <div className="flex flex-col gap-5">
            {agendamentosPorTab.map((ag) => {
              const statusVisual = classificarStatusVisual(ag, hojeISO)
              const ehAtivo = ag.status === 'agendado'
              const exibirAcoes = tab === 'proximos'

              return (
                <article
                  key={ag.id}
                  className="bg-white border border-[#ebe7f5] flex flex-col gap-3.5"
                  style={{
                    padding: '20px 22px 22px',
                    borderRadius: '22px',
                    boxShadow: '0 1px 3px rgba(26,23,34,0.04)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2
                      className="font-extrabold tracking-tight text-[#1a1722] leading-tight truncate min-w-0"
                      style={{ fontSize: '21px', letterSpacing: '-0.01em' }}
                    >
                      {nomeBarbearia(ag)}
                    </h2>
                    <StatusBadge
                      tone={statusVisual}
                      variant="solid"
                      size="md"
                      label={labelStatusVisual[statusVisual]}
                      icon={undefined}
                      className="shrink-0"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p
                      className="text-[15px] leading-snug"
                      style={{ color: '#6b6478' }}
                    >
                      Serviço:{' '}
                      <span className="text-[#2f2a3e] font-medium">{ag.service.name}</span>
                    </p>
                    <p
                      className="text-[15px] leading-snug"
                      style={{ color: '#6b6478' }}
                    >
                      Profissional:{' '}
                      <span className="text-[#2f2a3e] font-medium">{ag.professional.name}</span>
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-2 pt-0.5"
                    style={{ color: '#6d5bd9' }}
                  >
                    <CalendarDays
                      size={20}
                      strokeWidth={2.2}
                      className="shrink-0"
                      style={{ transform: 'translateY(-1px)' }}
                    />
                    <span
                      className="font-bold tracking-tight"
                      style={{ fontSize: '17px' }}
                    >
                      {formatoDataAmigavel(ag.date, ag.startTime)}
                    </span>
                  </div>

                  {exibirAcoes && ehAtivo && (
                    <div
                      className="grid grid-cols-2 gap-3.5 pt-3 mt-1"
                    >
                      <button
                        type="button"
                        onClick={() => handleReagendar(ag)}
                        disabled={cancelando}
                        className={[
                          'inline-flex items-center justify-center',
                          'rounded-[999px] font-bold tracking-tight transition-all duration-150',
                          'bg-white text-[#6d5bd9] border-2 border-[#6d5bd9]',
                          'hover:bg-[#f4efff] active:scale-[0.98] disabled:opacity-60',
                        ].join(' ')}
                        style={{
                          padding: '11px 14px',
                          fontSize: '17px',
                        }}
                      >
                        Reagendar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelar(ag)}
                        disabled={cancelando}
                        className={[
                          'inline-flex items-center justify-center',
                          'rounded-[999px] font-bold tracking-tight transition-all duration-150',
                          'bg-white text-[#c94e4e] border-2 border-[#d95e5e]',
                          'hover:bg-[#fff2f2] active:scale-[0.98] disabled:opacity-60',
                        ].join(' ')}
                        style={{
                          padding: '11px 14px',
                          fontSize: '17px',
                        }}
                      >
                        {cancelando ? (
                          <span className="inline-flex items-center gap-2">
                            <RefreshCw size={16} className="animate-spin" />
                            Cancelando
                          </span>
                        ) : (
                          'Cancelar'
                        )}
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
