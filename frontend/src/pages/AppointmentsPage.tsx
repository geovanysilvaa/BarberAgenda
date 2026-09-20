import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  CalendarClock,
  Scissors,
  Clock,
  AlertTriangle,
  CalendarX2,
  FilterX,
  Plus,
  Trash2,
  User,
  CheckCircle2,
} from 'lucide-react'
import { useAgendamento } from '../features/agendamento/model/useAgendamento'
import { useFiltroAgendamentos } from '../features/agendamento/model/useFiltroAgendamentos'
import {
  FiltroAgendamentos,
  filtrosPadrao,
  type FiltroAgendamentosValues,
} from '../features/agendamento/ui/FiltroAgendamentos'
import { Card } from '../shared/ui/Card'
import { Button } from '../shared/ui/Button'
import { Input } from '../shared/ui/Input'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { StatusBadge } from '../shared/ui/StatusBadge'
import { ApiError } from '../shared/lib/api'
import type { Appointment } from '../entities/appointment/types'

function formatarDataPtBr(dataStr: string): string {
  try {
    const [ano, mes, dia] = dataStr.split('-').map(Number)
    if (!ano || !mes || !dia) return dataStr
    const data = new Date(ano, mes - 1, dia)
    return data.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dataStr
  }
}

export function AppointmentsPage() {
  const { agendamentos, loading, error, listarMeusAgendamentos, cancelarAgendamento, reagendarAgendamento } =
    useAgendamento()
  const [reagendandoId, setReagendandoId] = useState<string | null>(null)
  const [novaData, setNovaData] = useState('')
  const [novoHorario, setNovoHorario] = useState('')
  const [acaoErro, setAcaoErro] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltroAgendamentosValues>(filtrosPadrao)
  const [salvandoReagendamento, setSalvandoReagendamento] = useState(false)
  const [agendamentoParaCancelar, setAgendamentoParaCancelar] = useState<Appointment | null>(null)
  const [cancelando, setCancelando] = useState(false)

  const { agendamentosFiltrados, profissionais } = useFiltroAgendamentos(agendamentos, filtros)

  useEffect(() => {
    listarMeusAgendamentos()
  }, [listarMeusAgendamentos])

  async function handleConfirmarCancelar() {
    if (!agendamentoParaCancelar) return

    setCancelando(true)
    setAcaoErro(null)
    try {
      await cancelarAgendamento(agendamentoParaCancelar.id)
      setAgendamentoParaCancelar(null)
      await listarMeusAgendamentos()
    } catch (err) {
      setAcaoErro(err instanceof ApiError ? err.message : 'Não foi possível cancelar o agendamento. Tente novamente.')
    } finally {
      setCancelando(false)
    }
  }

  function iniciarReagendamento(agendamento: Appointment) {
    setReagendandoId(agendamento.id)
    setNovaData(agendamento.date)
    setNovoHorario(agendamento.startTime)
    setAcaoErro(null)
  }

  async function handleReagendar(id: string) {
    setSalvandoReagendamento(true)
    setAcaoErro(null)
    try {
      await reagendarAgendamento(id, { date: novaData, time: novoHorario })
      setReagendandoId(null)
      await listarMeusAgendamentos()
    } catch (err) {
      setAcaoErro(err instanceof ApiError ? err.message : 'Não foi possível reagendar. Tente novamente.')
    } finally {
      setSalvandoReagendamento(false)
    }
  }

  // Estatísticas rápidas
  const totalAgendados = agendamentos.filter((a) => a.status === 'agendado').length
  const totalConcluidos = agendamentos.filter((a) => a.status === 'concluido').length
  const totalCancelados = agendamentos.filter((a) => a.status === 'cancelado').length

  return (
    <div className="min-h-screen bg-primary">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                <CalendarDays size={22} strokeWidth={2} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Meus Agendamentos
              </h1>
            </div>
            <p className="text-sm text-text-secondary mt-1 ml-0 sm:ml-13">
              Consulte seus horários marcados, reagende ou cancele quando precisar.
            </p>
          </div>

          <Link to="/barbershops">
            <Button size="md" className="shadow-sm">
              <Plus size={18} />
              Novo agendamento
            </Button>
          </Link>
        </div>

        {/* Barra de Estatísticas Rápidas */}
        {!loading && agendamentos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-secondary border border-border p-4 rounded-2xl flex flex-col gap-1 shadow-2xs">
              <span className="text-xs text-text-secondary font-medium">Total de agendamentos</span>
              <span className="text-2xl font-bold text-text-primary">{agendamentos.length}</span>
            </div>

            <div className="bg-secondary border border-border p-4 rounded-2xl flex flex-col gap-1 shadow-2xs">
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Próximos horários
              </span>
              <span className="text-2xl font-bold text-emerald-700">{totalAgendados}</span>
            </div>

            <div className="bg-secondary border border-border p-4 rounded-2xl flex flex-col gap-1 shadow-2xs">
              <span className="text-xs text-text-secondary font-medium">Concluídos</span>
              <span className="text-2xl font-bold text-text-secondary">{totalConcluidos}</span>
            </div>

            <div className="bg-secondary border border-border p-4 rounded-2xl flex flex-col gap-1 shadow-2xs">
              <span className="text-xs text-red-600 font-medium">Cancelados</span>
              <span className="text-2xl font-bold text-red-600">{totalCancelados}</span>
            </div>
          </div>
        )}

        {/* Mensagens de erro globais */}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {acaoErro && <ErrorMessage>{acaoErro}</ErrorMessage>}

        {/* Filtros */}
        {!loading && !error && agendamentos.length > 0 && (
          <FiltroAgendamentos profissionais={profissionais} onChange={setFiltros} />
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-text-secondary">Carregando seus agendamentos...</p>
          </div>
        )}

        {/* Nenhum agendamento cadastrado (vazio geral) */}
        {!loading && !error && agendamentos.length === 0 && (
          <div className="bg-secondary border border-border rounded-2xl p-10 sm:p-16 flex flex-col items-center text-center gap-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center">
              <CalendarX2 size={32} strokeWidth={1.75} />
            </div>
            <div className="max-w-md flex flex-col gap-1">
              <h3 className="text-lg font-bold text-text-primary">Nenhum agendamento encontrado</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Você ainda não marcou nenhum horário. Escolha uma barbearia para agendar seu corte de cabelo ou barba.
              </p>
            </div>
            <Link to="/barbershops" className="pt-2">
              <Button>
                <Scissors size={18} />
                Explorar Barbearias
              </Button>
            </Link>
          </div>
        )}

        {/* Nenhum resultado com os filtros atuais */}
        {!loading && !error && agendamentos.length > 0 && agendamentosFiltrados.length === 0 && (
          <div className="bg-secondary border border-border rounded-2xl p-10 flex flex-col items-center text-center gap-3 shadow-2xs">
            <div className="w-14 h-14 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center">
              <FilterX size={26} strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-bold text-text-primary">Nenhum resultado para esses filtros</h3>
            <p className="text-sm text-text-secondary max-w-sm">
              Tente alterar os termos da busca, profissional ou período selecionado.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFiltros(filtrosPadrao)}
              className="mt-2"
            >
              Restaurar filtros padrão
            </Button>
          </div>
        )}

        {/* Lista de Agendamentos */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {agendamentosFiltrados.map((agendamento) => {
              const ehAgendado = agendamento.status === 'agendado'
              const estaReagendando = reagendandoId === agendamento.id

              return (
                <Card
                  key={agendamento.id}
                  className={`flex flex-col justify-between transition-all rounded-2xl p-6 ${
                    ehAgendado
                      ? 'border-selected/30 shadow-xs hover:border-selected/50'
                      : 'opacity-90'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    {/* Linha superior: Serviço e Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            ehAgendado
                              ? 'bg-selected/10 text-selected'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}
                        >
                          <Scissors size={20} strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-text-primary truncate">
                            {agendamento.service.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-xs text-text-secondary mt-0.5">
                            <Clock size={12} />
                            {agendamento.service.duration} min de duração
                          </span>
                        </div>
                      </div>

                      <StatusBadge status={agendamento.status} />
                    </div>

                    {/* Dados do profissional e data/horário */}
                    <div className="bg-white rounded-xl p-3.5 border border-border flex flex-col gap-2.5 text-sm">
                      <div className="flex items-center gap-2 text-text-primary">
                        <User size={16} className="text-text-secondary shrink-0" />
                        <span className="text-text-secondary text-xs">Profissional:</span>
                        <span className="font-medium truncate">{agendamento.professional.name}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-text-primary pt-2 border-t border-border/60">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium capitalize">
                          <CalendarDays size={15} className="text-selected shrink-0" />
                          <span>{formatarDataPtBr(agendamento.date)}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                          <Clock size={15} className="text-selected shrink-0" />
                          <span>
                            {agendamento.startTime} às {agendamento.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Painel inline de reagendamento */}
                    {ehAgendado && estaReagendando && (
                      <div className="bg-selected/5 border border-selected/20 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-selected">
                          <CalendarClock size={16} />
                          <span>Escolha uma nova data e horário</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            label="Nova data"
                            type="date"
                            value={novaData}
                            onChange={(e) => setNovaData(e.target.value)}
                          />
                          <Input
                            label="Novo horário"
                            type="time"
                            value={novoHorario}
                            onChange={(e) => setNovoHorario(e.target.value)}
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={salvandoReagendamento}
                            onClick={() => setReagendandoId(null)}
                          >
                            Voltar
                          </Button>
                          <Button
                            size="sm"
                            loading={salvandoReagendamento}
                            onClick={() => handleReagendar(agendamento.id)}
                          >
                            <CheckCircle2 size={16} />
                            Salvar novo horário
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ações para agendamento ativo */}
                  {ehAgendado && !estaReagendando && (
                    <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => iniciarReagendamento(agendamento)}
                        className="px-3.5 py-1.5 text-xs"
                      >
                        <CalendarClock size={15} />
                        Reagendar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setAgendamentoParaCancelar(agendamento)}
                        className="px-3.5 py-1.5 text-xs"
                      >
                        <Trash2 size={15} />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* Modal Elegante de Cancelamento de Agendamento */}
        {agendamentoParaCancelar && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Cancelar Agendamento</h3>
              </div>

              <div className="bg-secondary p-3.5 rounded-xl border border-border flex flex-col gap-1 text-sm">
                <p className="font-semibold text-text-primary">
                  {agendamentoParaCancelar.service.name}
                </p>
                <p className="text-text-secondary text-xs">
                  Profissional: <span className="text-text-primary font-medium">{agendamentoParaCancelar.professional.name}</span>
                </p>
                <p className="text-text-secondary text-xs">
                  Horário: <span className="text-text-primary font-medium">{formatarDataPtBr(agendamentoParaCancelar.date)} às {agendamentoParaCancelar.startTime}</span>
                </p>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed">
                Tem certeza que deseja cancelar este agendamento? O horário será imediatamente liberado para outros clientes.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <Button
                  variant="secondary"
                  disabled={cancelando}
                  onClick={() => setAgendamentoParaCancelar(null)}
                  className="px-4 py-2 border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 text-sm"
                >
                  Manter agendamento
                </Button>
                <Button
                  variant="danger"
                  loading={cancelando}
                  onClick={handleConfirmarCancelar}
                  className="px-4 py-2 text-sm"
                >
                  Confirmar cancelamento
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
