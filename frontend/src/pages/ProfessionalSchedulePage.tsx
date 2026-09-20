import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Calendar,
  Scissors,
  Clock,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Ban,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CalendarX2,
} from 'lucide-react'
import { useAgendamento } from '../features/agendamento/model/useAgendamento'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { Card } from '../shared/ui/Card'
import { Button } from '../shared/ui/Button'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { StatusBadge } from '../shared/ui/StatusBadge'
import { ApiError } from '../shared/lib/api'
import type { RawAppointment } from '../entities/appointment/types'

function hoje(): string {
  const d = new Date()
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function formatarDataExtenso(dataStr: string): string {
  try {
    const [ano, mes, dia] = dataStr.split('-').map(Number)
    if (!ano || !mes || !dia) return dataStr
    const data = new Date(ano, mes - 1, dia)
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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

  useEffect(() => {
    listarAgendaProfissional()
    buscarMeuProfissional().then((prof) => {
      if (prof?.barbershopId) {
        listarServicos(prof.barbershopId)
      }
    })
  }, [listarAgendaProfissional, buscarMeuProfissional, listarServicos])

  // Fallback caso venha da agenda
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
    } catch (err) {
      setAcaoErro(
        err instanceof ApiError ? err.message : 'Não foi possível cancelar o atendimento. Tente novamente.'
      )
    } finally {
      setCancelando(false)
    }
  }

  const ehHoje = date === hoje()

  return (
    <div className="min-h-screen bg-primary">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        {/* Header / Hero */}
        <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20 shadow-xs">
              <CalendarDays size={28} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  Minha Agenda
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-selected/10 text-selected border border-selected/30">
                  <Sparkles size={12} />
                  Área do Profissional
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                Consulte seus atendimentos programados, horários de atendimento e status em tempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/professional/unavailability">
              <Button variant="secondary" size="sm" className="gap-2 shadow-2xs">
                <Ban size={16} />
                Gerenciar Indisponibilidade
              </Button>
            </Link>
          </div>
        </div>

        {/* Navegador de Data & Controles Rápidos */}
        <Card className="rounded-2xl p-4 sm:p-6 flex flex-col gap-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Seletor de Data */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setDate((d) => somarDias(d, -1))}
                  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-zinc-100 transition-colors"
                  title="Dia anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setDate(hoje())}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    ehHoje
                      ? 'bg-selected text-white shadow-2xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-zinc-100'
                  }`}
                >
                  Hoje
                </button>

                <button
                  type="button"
                  onClick={() => setDate((d) => somarDias(d, 1))}
                  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-zinc-100 transition-colors"
                  title="Próximo dia"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Input Date Nativo com Estilo */}
              <div className="relative flex items-center">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
                  <Calendar size={16} />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary font-medium outline-none focus:border-selected focus:ring-2 focus:ring-selected/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Texto Descritivo da Data */}
            <div className="text-sm font-semibold text-text-primary capitalize flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-selected"></span>
              <span>{formatarDataExtenso(date)}</span>
            </div>
          </div>

          {/* Cards de Métricas / Resumo do Dia */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
            <div className="bg-white border border-border rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-2xs font-semibold text-text-secondary uppercase tracking-wider">
                Total do Dia
              </span>
              <span className="text-xl font-bold text-text-primary">{agendaDoDia.length}</span>
            </div>

            <div className="bg-white border border-border rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-2xs font-semibold text-amber-700 uppercase tracking-wider">
                Agendados
              </span>
              <span className="text-xl font-bold text-amber-600">{totalAgendados}</span>
            </div>

            <div className="bg-white border border-border rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-2xs font-semibold text-emerald-700 uppercase tracking-wider">
                Concluídos
              </span>
              <span className="text-xl font-bold text-emerald-600">{totalConcluidos}</span>
            </div>

            <div className="bg-white border border-border rounded-xl p-3.5 flex flex-col gap-1">
              <span className="text-2xs font-semibold text-red-700 uppercase tracking-wider">
                Cancelados
              </span>
              <span className="text-xl font-bold text-red-600">{totalCancelados}</span>
            </div>
          </div>

          {/* Filtros de Status (Tabs) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2">
            <button
              type="button"
              onClick={() => setStatusFiltro('todos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFiltro === 'todos'
                  ? 'bg-selected text-white shadow-2xs'
                  : 'bg-white border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              Todos ({agendaDoDia.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('agendado')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFiltro === 'agendado'
                  ? 'bg-selected text-white shadow-2xs'
                  : 'bg-white border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              Agendados ({totalAgendados})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('concluido')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFiltro === 'concluido'
                  ? 'bg-selected text-white shadow-2xs'
                  : 'bg-white border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              Concluídos ({totalConcluidos})
            </button>
            <button
              type="button"
              onClick={() => setStatusFiltro('cancelado')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFiltro === 'cancelado'
                  ? 'bg-selected text-white shadow-2xs'
                  : 'bg-white border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              Cancelados ({totalCancelados})
            </button>
          </div>
        </Card>

        {/* Feedback de Erro */}
        {error && (
          <div className="max-w-xl">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}
        {acaoErro && (
          <div className="max-w-xl">
            <ErrorMessage>{acaoErro}</ErrorMessage>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-text-secondary">Carregando seus agendamentos...</p>
          </div>
        )}

        {/* Empty State: Nenhum agendamento no dia */}
        {!loading && agendaDoDia.length === 0 && (
          <Card className="rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center">
              <CalendarX2 size={32} />
            </div>
            <div className="max-w-md flex flex-col gap-1">
              <h3 className="text-lg font-bold text-text-primary">Nenhum atendimento agendado</h3>
              <p className="text-sm text-text-secondary">
                Você não possui horários marcados para {formatarDataExtenso(date)}. Aproveite para organizar seus atendimentos ou ajustar sua indisponibilidade.
              </p>
            </div>
            <Link to="/professional/unavailability" className="mt-2">
              <Button variant="secondary" size="sm" className="gap-2">
                <Ban size={16} />
                Configurar Indisponibilidade
              </Button>
            </Link>
          </Card>
        )}

        {/* Empty State: Filtro sem resultados */}
        {!loading && agendaDoDia.length > 0 && agendaFiltrada.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            <p className="text-base font-medium">Nenhum atendimento com status "{statusFiltro}" neste dia.</p>
            <button
              type="button"
              onClick={() => setStatusFiltro('todos')}
              className="text-selected font-semibold text-sm hover:underline mt-2 inline-block"
            >
              Ver todos os atendimentos do dia
            </button>
          </div>
        )}

        {/* Lista de Agendamentos */}
        {!loading && agendaFiltrada.length > 0 && (
          <div className="flex flex-col gap-4">
            {agendaFiltrada.map((agendamento) => {
              const duracao = duracaoServico(agendamento.serviceId)
              const preco = precoServico(agendamento.serviceId)

              return (
                <div
                  key={agendamento.id}
                  className="bg-secondary border border-border rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {/* Horário */}
                    <div className="bg-white border border-border rounded-2xl px-4 py-3 text-center shrink-0 shadow-2xs">
                      <div className="flex items-center justify-center gap-1 text-selected mb-0.5">
                        <Clock size={14} />
                        <span className="text-xs font-semibold">Horário</span>
                      </div>
                      <span className="font-bold text-base text-text-primary tracking-tight">
                        {agendamento.startTime.slice(0, 5)}
                      </span>
                      <span className="text-2xs text-text-secondary block">
                        até {agendamento.endTime.slice(0, 5)}
                      </span>
                    </div>

                    {/* Dados do Atendimento */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-selected/10 text-selected flex items-center justify-center shrink-0">
                          <Scissors size={15} />
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-text-primary tracking-tight truncate">
                          {nomeServico(agendamento.serviceId)}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                        {duracao && (
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-selected" />
                            <span>Duração: {duracao} min</span>
                          </span>
                        )}
                        {preco && (
                          <span className="font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            {preco}
                          </span>
                        )}
                        <span className="text-2xs text-text-secondary/80">
                          ID: {agendamento.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status e Ações */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/80">
                    <StatusBadge status={agendamento.status} />

                    {agendamento.status === 'agendado' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setAgendamentoParaCancelar(agendamento)}
                        className="gap-1.5 text-xs py-1.5 shadow-2xs"
                      >
                        <Trash2 size={14} />
                        Cancelar
                      </Button>
                    )}

                    {agendamento.status === 'concluido' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 size={14} />
                        Realizado
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Confirmação de Cancelamento */}
        {agendamentoParaCancelar && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0 border border-red-500/20">
                  <AlertTriangle size={24} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-text-primary">Cancelar Atendimento</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Tem certeza que deseja cancelar o agendamento de{' '}
                    <strong className="text-text-primary">
                      {nomeServico(agendamentoParaCancelar.serviceId)}
                    </strong>{' '}
                    às{' '}
                    <strong className="text-text-primary">
                      {agendamentoParaCancelar.startTime.slice(0, 5)}
                    </strong>{' '}
                    do dia {formatarDataExtenso(agendamentoParaCancelar.date)}?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAgendamentoParaCancelar(null)}
                  disabled={cancelando}
                  className="px-4 py-2 text-sm"
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  loading={cancelando}
                  onClick={handleConfirmarCancelar}
                  className="px-5 py-2 text-sm"
                >
                  <Trash2 size={16} />
                  Confirmar Cancelamento
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

