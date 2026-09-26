import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Scissors,
  Clock,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Ban,
  ChevronLeft,
  ChevronRight,
  CalendarX2,
} from 'lucide-react'
import { useAgendamento } from '../features/agendamento/model/useAgendamento'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { StatusBadge } from '../shared/ui/StatusBadge'
import { SuccessMessage } from '../shared/ui/SuccessMessage'
import { BottomNav } from '../shared/ui/BottomNav'
import { ApiError } from '../shared/lib/api'
import type { RawAppointment } from '../entities/appointment/types'

function hoje(): string {
  const d = new Date()
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function formatarDataCurta(dataStr: string): string {
  try {
    const [ano, mes, dia] = dataStr.split('-').map(Number)
    if (!ano || !mes || !dia) return dataStr
    const data = new Date(ano, mes - 1, dia)
    return data.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return dataStr
  }
}

function somarDias(dataStr: string, dias: number): string {
  try {
    const [ano, mes, dia] = dataStr.split('-').map(Number)
    const data = new Date(ano, mes - 1, dia)
    data.setDate(data.getDate() + dias)
    const nAno = data.getFullYear()
    const nMes = String(data.getMonth() + 1).padStart(2, '0')
    const nDia = String(data.getDate()).padStart(2, '0')
    return `${nAno}-${nMes}-${nDia}`
  } catch {
    return dataStr
  }
}

type StatusFiltro = 'todos' | 'agendado' | 'concluido' | 'cancelado'

export function ProfessionalSchedulePage() {
  const navigate = useNavigate()
  const {
    agendaProfissional,
    loading,
    error,
    listarAgendaProfissional,
    cancelarAgendamento,
    buscarMeuProfissional,
  } = useAgendamento()
  const { servicos, listarServicos } = useBarbeiro()
  const [date, setDate] = useState(hoje())
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('todos')
  const [agendamentoParaCancelar, setAgendamentoParaCancelar] = useState<RawAppointment | null>(null)
  const [cancelando, setCancelando] = useState(false)
  const [acaoErro, setAcaoErro] = useState<string | null>(null)
  const [cancelouOk, setCancelouOk] = useState<string | null>(null)

  useEffect(() => {
    listarAgendaProfissional()
    buscarMeuProfissional().then((prof) => {
      if (prof?.barbershopId) {
        listarServicos(prof.barbershopId)
      }
    })
  }, [listarAgendaProfissional, buscarMeuProfissional, listarServicos])

  const barbershopId = agendaProfissional[0]?.barbershopId
  useEffect(() => {
    if (barbershopId && servicos.length === 0) {
      listarServicos(barbershopId)
    }
  }, [barbershopId, servicos.length, listarServicos])

  const nomeServico = useMemo(() => {
    const mapa = new Map(servicos.map((s) => [s.id, s.name]))
    return (serviceId: string) => mapa.get(serviceId) ?? 'Serviço'
  }, [servicos])

  const duracaoServico = useMemo(() => {
    const mapa = new Map(servicos.map((s) => [s.id, s.durationMinutes]))
    return (serviceId: string) => mapa.get(serviceId)
  }, [servicos])

  const precoServico = useMemo(() => {
    const mapa = new Map(servicos.map((s) => [s.id, s.price]))
    return (serviceId: string) => {
      const preco = mapa.get(serviceId)
      if (preco == null) return null
      return (preco / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }
  }, [servicos])

  const agendaDoDia = useMemo(() => {
    return agendaProfissional.filter((a) => a.date === date)
  }, [agendaProfissional, date])

  const totalAgendados = useMemo(
    () => agendaDoDia.filter((a) => a.status === 'agendado').length,
    [agendaDoDia]
  )
  const totalConcluidos = useMemo(
    () => agendaDoDia.filter((a) => a.status === 'concluido').length,
    [agendaDoDia]
  )
  const totalCancelados = useMemo(
    () => agendaDoDia.filter((a) => a.status === 'cancelado').length,
    [agendaDoDia]
  )

  const agendaFiltrada = useMemo(() => {
    return [...agendaDoDia]
      .filter((a) => (statusFiltro === 'todos' ? true : a.status === statusFiltro))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [agendaDoDia, statusFiltro])

  async function handleConfirmarCancelar() {
    if (!agendamentoParaCancelar) return
    setCancelando(true)
    setAcaoErro(null)
    try {
      await cancelarAgendamento(agendamentoParaCancelar.id)
      await listarAgendaProfissional()
      setAgendamentoParaCancelar(null)
      setCancelouOk('Atendimento cancelado com sucesso!')
      setTimeout(() => setCancelouOk(null), 3500)
    } catch (err) {
      setAcaoErro(
        err instanceof ApiError ? err.message : 'Não foi possível cancelar o atendimento. Tente novamente.'
      )
    } finally {
      setCancelando(false)
    }
  }

  const ehHoje = date === hoje()

  const filtros: Array<{ id: StatusFiltro; label: string; total: number }> = [
    { id: 'todos', label: 'Todos', total: agendaDoDia.length },
    { id: 'agendado', label: 'Agendados', total: totalAgendados },
    { id: 'concluido', label: 'Concluídos', total: totalConcluidos },
    { id: 'cancelado', label: 'Cancelados', total: totalCancelados },
  ]

  return (
    <div className="min-h-screen bg-[#fef7ff]">
      <main className="max-w-[540px] mx-auto px-5 pt-10 pb-40 md:pb-8 md:pt-8 md:px-6 md:max-w-5xl flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#2b2238] hover:bg-[#efe8ff] transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={26} strokeWidth={1.9} />
          </button>
          <div className="flex-1">
            <h1 className="text-[30px] leading-[34px] font-extrabold text-[#2b2238] tracking-tight">
              Minha Agenda
            </h1>
          </div>
        </div>

        {/* CARD DE ACESSO RÁPIDO: INDISPONIBILIDADES */}
        <Link
          to="/professional/unavailability"
          className="w-full bg-white rounded-[22px] p-5 shadow-[0_1px_2px_rgba(18,17,51,0.04),0_8px_24px_-8px_rgba(109,91,217,0.12)] border border-[#efe8ff] hover:border-[#d6cdf8] transition-all active:scale-[0.995]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[18px] bg-[#efe8ff] text-[#6d5bd9] flex items-center justify-center shrink-0">
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

        {/* NAVEGADOR DE DATA */}
        <div className="bg-white rounded-[22px] p-4 shadow-[0_1px_2px_rgba(18,17,51,0.04),0_4px_12px_-6px_rgba(26,24,58,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-[#f7f4fb] rounded-full p-1">
              <button
                type="button"
                onClick={() => setDate((d) => somarDias(d, -1))}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#6b6478] hover:text-[#2b2238] hover:bg-white transition-colors"
                title="Dia anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setDate(hoje())}
                className={`px-3 h-9 rounded-full text-[14px] font-bold transition-all ${
                  ehHoje
                    ? 'bg-[#6d5bd9] text-white shadow-[0_2px_8px_rgba(109,91,217,0.25)]'
                    : 'text-[#6b6478] hover:text-[#2b2238] hover:bg-white'
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setDate((d) => somarDias(d, 1))}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#6b6478] hover:text-[#2b2238] hover:bg-white transition-colors"
                title="Próximo dia"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d5bd9] pointer-events-none">
                <Calendar size={18} strokeWidth={1.9} />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#f7f4fb] border-0 rounded-[14px] pl-10 pr-3 py-2.5 text-[15px] font-semibold text-[#2b2238] outline-none focus:ring-2 focus:ring-[#6d5bd9]/20 transition-all w-[150px]"
              />
            </div>
          </div>

          <div className="mt-4 text-[17px] font-bold text-[#2b2238] capitalize flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6d5bd9]"></span>
            <span>{formatarDataCurta(date)}</span>
          </div>

          {/* Métricas do dia */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="bg-[#f7f4fb] rounded-[16px] p-3 flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-[#6b6478] uppercase tracking-wider">
                Total
              </span>
              <span className="text-[19px] font-extrabold text-[#2b2238] leading-tight">
                {agendaDoDia.length}
              </span>
            </div>
            <div className="bg-[#fff3e0] rounded-[16px] p-3 flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-[#b5760c] uppercase tracking-wider">
                Marcados
              </span>
              <span className="text-[19px] font-extrabold text-[#c57e0a] leading-tight">
                {totalAgendados}
              </span>
            </div>
            <div className="bg-[#e4f7ea] rounded-[16px] p-3 flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-[#1f8e4e] uppercase tracking-wider">
                Feitos
              </span>
              <span className="text-[19px] font-extrabold text-[#1f8e4e] leading-tight">
                {totalConcluidos}
              </span>
            </div>
            <div className="bg-[#fde5e5] rounded-[16px] p-3 flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-[#c24848] uppercase tracking-wider">
                Fora
              </span>
              <span className="text-[19px] font-extrabold text-[#d95e5e] leading-tight">
                {totalCancelados}
              </span>
            </div>
          </div>
        </div>

        {/* FILTROS DE STATUS (Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {filtros.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFiltro(f.id)}
              className={`h-10 px-4 rounded-full text-[15px] font-bold whitespace-nowrap transition-all ${
                statusFiltro === f.id
                  ? 'bg-white text-[#6d5bd9] shadow-[0_1px_2px_rgba(18,17,51,0.04),0_4px_12px_-6px_rgba(109,91,217,0.25)] border border-[#d6cdf8]'
                  : 'bg-[#efe8ff] text-[#837c92] border border-transparent hover:text-[#6b6478]'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${statusFiltro === f.id ? 'text-[#6d5bd9]/80' : 'text-[#a9a1b8]'}`}>
                {f.total}
              </span>
            </button>
          ))}
        </div>

        {/* FEEDBACKS */}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {acaoErro && <ErrorMessage>{acaoErro}</ErrorMessage>}
        {cancelouOk && <SuccessMessage>{cancelouOk}</SuccessMessage>}

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" tone="ink" />
            <p className="text-[15px] text-[#6b6478]">Carregando seus atendimentos...</p>
          </div>
        )}

        {/* EMPTY STATE: DIA SEM ATENDIMENTOS */}
        {!loading && agendaDoDia.length === 0 && (
          <div className="bg-white rounded-[22px] p-10 text-center flex flex-col items-center justify-center gap-4 shadow-[0_1px_2px_rgba(18,17,51,0.04),0_4px_12px_-6px_rgba(26,24,58,0.08)]">
            <div className="w-16 h-16 rounded-[20px] bg-[#efe8ff] text-[#6d5bd9] flex items-center justify-center">
              <CalendarX2 size={30} strokeWidth={1.9} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[19px] font-extrabold text-[#2b2238]">
                Nenhum atendimento agendado
              </h3>
              <p className="text-[15px] text-[#6b6478] leading-relaxed max-w-xs mx-auto">
                Você não possui horários marcados para hoje. Aproveite para organizar sua
                indisponibilidade ou conferir outros dias.
              </p>
            </div>
            <Link
              to="/professional/unavailability"
              className="mt-2 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[#6d5bd9] text-white text-[16px] font-bold shadow-[0_2px_10px_rgba(109,91,217,0.28)]"
            >
              <Ban size={18} strokeWidth={2} />
              Bloquear Horário
            </Link>
          </div>
        )}

        {/* EMPTY STATE: SEM RESULTADOS NO FILTRO */}
        {!loading && agendaDoDia.length > 0 && agendaFiltrada.length === 0 && (
          <div className="text-center py-14">
            <p className="text-[16px] font-semibold text-[#6b6478]">
              Nenhum atendimento com status “{filtros.find((f) => f.id === statusFiltro)?.label}” neste dia.
            </p>
            <button
              type="button"
              onClick={() => setStatusFiltro('todos')}
              className="text-[#6d5bd9] font-bold text-[15px] hover:underline mt-2 inline-block"
            >
              Ver todos os atendimentos
            </button>
          </div>
        )}

        {/* LISTA DE ATENDIMENTOS */}
        {!loading && agendaFiltrada.length > 0 && (
          <div className="flex flex-col gap-3">
            {agendaFiltrada.map((agendamento) => {
              const duracao = duracaoServico(agendamento.serviceId)
              const preco = precoServico(agendamento.serviceId)

              return (
                <div
                  key={agendamento.id}
                  className="bg-white rounded-[22px] p-5 flex flex-col gap-4 shadow-[0_1px_2px_rgba(18,17,51,0.04),0_4px_12px_-6px_rgba(26,24,58,0.08)] border border-transparent hover:border-[#efe8ff] transition-all"
                >
                  {/* CIMA: horário + serviço + status */}
                  <div className="flex items-start gap-3">
                    <div className="bg-[#efe8ff] rounded-[18px] px-3.5 py-3 text-center shrink-0 min-w-[88px]">
                      <div className="flex items-center justify-center gap-1 text-[#6d5bd9] mb-0.5">
                        <Clock size={13} strokeWidth={2} />
                        <span className="text-[11px] font-bold uppercase tracking-wide">
                          Hora
                        </span>
                      </div>
                      <div className="font-extrabold text-[18px] text-[#2b2238] leading-none">
                        {agendamento.startTime.slice(0, 5)}
                      </div>
                      <div className="text-[12px] text-[#6b6478] mt-1 font-semibold">
                        até {agendamento.endTime.slice(0, 5)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-[12px] bg-[#f4efff] text-[#6d5bd9] flex items-center justify-center shrink-0 mt-0.5">
                          <Scissors size={15} strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-extrabold text-[18px] text-[#2b2238] leading-tight truncate">
                            {nomeServico(agendamento.serviceId)}
                          </h3>
                          {preco && (
                            <div className="text-[17px] font-extrabold text-[#1f8e4e] mt-0.5">
                              {preco}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#6b6478]">
                        {duracao && (
                          <span className="inline-flex items-center gap-1.5 font-semibold">
                            <Clock size={14} className="text-[#6d5bd9]" strokeWidth={2} />
                            {duracao} min
                          </span>
                        )}
                        <span className="font-semibold truncate text-[13px]">
                          ID: {agendamento.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BAIXO: status + ação */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#f2edfa]">
                    <StatusBadge status={agendamento.status} variant="solid" />

                    <div className="flex items-center gap-2">
                      {agendamento.status === 'agendado' && (
                        <button
                          type="button"
                          onClick={() => setAgendamentoParaCancelar(agendamento)}
                          className="h-11 px-4 rounded-full text-[14px] font-bold text-[#d95e5e] bg-white border border-[#f3c9c9] hover:bg-[#fff5f5] active:scale-[0.98] transition-all inline-flex items-center gap-1.5"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                          Cancelar
                        </button>
                      )}

                      {agendamento.status === 'concluido' && (
                        <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#1f8e4e]">
                          <CheckCircle2 size={17} strokeWidth={2} />
                          Realizado
                        </span>
                      )}

                      {agendamento.status === 'cancelado' && (
                        <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#d95e5e]">
                          <AlertTriangle size={17} strokeWidth={2} />
                          Cancelado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Bottom Nav (mobile only) */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* MODAL CONFIRMAR CANCELAMENTO */}
      {agendamentoParaCancelar && (
        <div className="fixed inset-0 z-50 bg-[#1a1130]/60 backdrop-blur-[2px] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-[#fef7ff] rounded-t-[28px] md:rounded-[28px] w-full md:max-w-md shadow-[0_20px_60px_rgba(26,17,48,0.35)] flex flex-col gap-5 animate-in slide-in-from-bottom duration-200 md:zoom-in-95 p-6 md:p-7">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[18px] bg-[#fde5e5] text-[#d95e5e] flex items-center justify-center shrink-0">
                <AlertTriangle size={24} strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[19px] font-extrabold text-[#2b2238]">
                  Cancelar Atendimento?
                </h3>
                <p className="text-[15px] text-[#6b6478] leading-relaxed">
                  Tem certeza que deseja cancelar{' '}
                  <strong className="text-[#2b2238]">
                    {nomeServico(agendamentoParaCancelar.serviceId)}
                  </strong>{' '}
                  às{' '}
                  <strong className="text-[#2b2238]">
                    {agendamentoParaCancelar.startTime.slice(0, 5)}
                  </strong>
                  ?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-stretch md:justify-end gap-2.5 pt-1 md:pt-2">
              <button
                type="button"
                onClick={() => setAgendamentoParaCancelar(null)}
                disabled={cancelando}
                className="flex-1 md:flex-none h-12 md:px-5 rounded-full bg-[#efe8ff] text-[#6b6478] font-bold text-[15px] hover:bg-[#e5ddf7] transition-colors"
              >
                Manter
              </button>
              <button
                type="button"
                disabled={cancelando}
                onClick={handleConfirmarCancelar}
                className="flex-1 md:flex-none h-12 md:px-6 rounded-full bg-[#d95e5e] text-white font-bold text-[15px] shadow-[0_2px_10px_rgba(217,94,94,0.28)] hover:bg-[#c24848] transition-colors inline-flex items-center justify-center gap-1.5"
              >
                {cancelando ? (
                  <>
                    <LoadingSpinner size="sm" tone="ink" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} strokeWidth={2} />
                    Cancelar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
