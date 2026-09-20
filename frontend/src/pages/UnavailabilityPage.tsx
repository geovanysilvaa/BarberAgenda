import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Ban,
  ArrowLeft,
  Clock,
  Calendar,
  CalendarDays,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  CalendarOff,
  Info,
  CalendarX,
  Store,
} from 'lucide-react'
import { useAgendamento } from '../features/agendamento/model/useAgendamento'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { Card } from '../shared/ui/Card'
import { Button } from '../shared/ui/Button'
import { Input } from '../shared/ui/Input'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { SuccessMessage } from '../shared/ui/SuccessMessage'
import type { RecurringUnavailability, Unavailability } from '../entities/appointment/types'

const DIAS_DA_SEMANA = [
  { id: 0, nome: 'Domingo', abrev: 'Dom' },
  { id: 1, nome: 'Segunda-feira', abrev: 'Seg' },
  { id: 2, nome: 'Terça-feira', abrev: 'Ter' },
  { id: 3, nome: 'Quarta-feira', abrev: 'Qua' },
  { id: 4, nome: 'Quinta-feira', abrev: 'Qui' },
  { id: 5, nome: 'Sexta-feira', abrev: 'Sex' },
  { id: 6, nome: 'Sábado', abrev: 'Sáb' },
]

function formatarDataHoraPtBr(isoStr: string): { data: string; hora: string } {
  try {
    if (isoStr.includes('T')) {
      const [dataParte, horaComResto] = isoStr.split('T')
      if (dataParte && horaComResto) {
        const [ano, mes, dia] = dataParte.split('-')
        const hora = horaComResto.slice(0, 5)
        return { data: `${dia}/${mes}/${ano}`, hora }
      }
    }
    const d = new Date(isoStr)
    const data = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return { data, hora }
  } catch {
    return { data: isoStr, hora: '' }
  }
}

export function UnavailabilityPage() {
  const {
    indisponibilidadesRecorrentes,
    indisponibilidades,
    meuProfissional,
    loading: loadingAgendamento,
    error,
    buscarMeuProfissional,
    listarIndisponibilidadesRecorrentes,
    criarIndisponibilidadeRecorrente,
    removerIndisponibilidadeRecorrente,
    listarIndisponibilidades,
    criarIndisponibilidade,
    removerIndisponibilidade,
  } = useAgendamento()

  const { horarios, listarHorarios, loading: loadingHorarios } = useBarbeiro()

  // Aba ativa: 'recorrente' | 'pontual'
  const [abaAtiva, setAbaAtiva] = useState<'recorrente' | 'pontual'>('recorrente')

  // Form Recorrente
  const [diasSelecionados, setDiasSelecionados] = useState<Set<number>>(new Set())
  const [startTimeRecorrente, setStartTimeRecorrente] = useState('')
  const [endTimeRecorrente, setEndTimeRecorrente] = useState('')
  const [reasonRecorrente, setReasonRecorrente] = useState('')
  const [salvandoRecorrente, setSalvandoRecorrente] = useState(false)
  const [formErrorRecorrente, setFormErrorRecorrente] = useState<string | null>(null)
  const [sucessoRecorrente, setSucessoRecorrente] = useState<string | null>(null)

  // Form Pontual
  const [dataPontual, setDataPontual] = useState('')
  const [startTimePontual, setStartTimePontual] = useState('')
  const [endTimePontual, setEndTimePontual] = useState('')
  const [reasonPontual, setReasonPontual] = useState('')
  const [salvandoPontual, setSalvandoPontual] = useState(false)
  const [formErrorPontual, setFormErrorPontual] = useState<string | null>(null)
  const [sucessoPontual, setSucessoPontual] = useState<string | null>(null)

  // Modal de Exclusão
  const [recorrenteParaRemover, setRecorrenteParaRemover] = useState<RecurringUnavailability | null>(null)
  const [pontualParaRemover, setPontualParaRemover] = useState<Unavailability | null>(null)
  const [removendo, setRemovendo] = useState(false)

  const loading = loadingAgendamento || loadingHorarios

  useEffect(() => {
    buscarMeuProfissional().then((profissional) => {
      if (profissional) {
        listarIndisponibilidadesRecorrentes(profissional.barbershopId, profissional.id)
        listarIndisponibilidades(profissional.barbershopId, profissional.id)
        listarHorarios(profissional.barbershopId)
      }
    })
  }, [buscarMeuProfissional, listarIndisponibilidadesRecorrentes, listarIndisponibilidades, listarHorarios])

  // Conjunto de dias que a barbearia realmente abre
  const diasFuncionamento = useMemo(() => {
    return new Set(horarios.map((h) => h.dayOfWeek))
  }, [horarios])

  const temHorariosConfigurados = horarios.length > 0

  function toggleDia(dayOfWeek: number) {
    if (temHorariosConfigurados && !diasFuncionamento.has(dayOfWeek)) {
      setFormErrorRecorrente(
        `A barbearia não abre aos ${DIAS_DA_SEMANA[dayOfWeek]?.nome.toLowerCase()}s. O sistema já bloqueia agendamentos de clientes automaticamente neste dia.`
      )
      return
    }

    setFormErrorRecorrente(null)
    setDiasSelecionados((atual) => {
      const novo = new Set(atual)
      if (novo.has(dayOfWeek)) novo.delete(dayOfWeek)
      else novo.add(dayOfWeek)
      return novo
    })
  }

  function selecionarTodosDias() {
    const diasValidos = [0, 1, 2, 3, 4, 5, 6].filter(
      (d) => !temHorariosConfigurados || diasFuncionamento.has(d)
    )
    setDiasSelecionados(new Set(diasValidos))
    setFormErrorRecorrente(null)
  }

  function selecionarSegASex() {
    const diasValidos = [1, 2, 3, 4, 5].filter(
      (d) => !temHorariosConfigurados || diasFuncionamento.has(d)
    )
    setDiasSelecionados(new Set(diasValidos))
    setFormErrorRecorrente(null)
  }

  function selecionarFimDeSemana() {
    const diasValidos = [0, 6].filter(
      (d) => !temHorariosConfigurados || diasFuncionamento.has(d)
    )
    setDiasSelecionados(new Set(diasValidos))
    setFormErrorRecorrente(null)
  }

  function limparDias() {
    setDiasSelecionados(new Set())
    setFormErrorRecorrente(null)
  }

  function aplicarPresetHorario(inicio: string, fim: string, motivo: string) {
    setStartTimeRecorrente(inicio)
    setEndTimeRecorrente(fim)
    if (!reasonRecorrente) {
      setReasonRecorrente(motivo)
    }
  }

  async function handleRegistrarRecorrente() {
    setFormErrorRecorrente(null)
    setSucessoRecorrente(null)

    if (!meuProfissional) {
      setFormErrorRecorrente('Perfil de profissional não localizado para esta conta.')
      return
    }

    if (diasSelecionados.size === 0) {
      setFormErrorRecorrente('Selecione pelo menos um dia da semana que a barbearia esteja aberta.')
      return
    }

    const inicio = startTimeRecorrente.slice(0, 5)
    const fim = endTimeRecorrente.slice(0, 5)

    if (!inicio || !fim) {
      setFormErrorRecorrente('Por favor, informe os horários de início e término.')
      return
    }

    if (fim <= inicio) {
      setFormErrorRecorrente('O horário de término deve ser posterior ao horário de início.')
      return
    }

    setSalvandoRecorrente(true)
    try {
      await Promise.all(
        Array.from(diasSelecionados).map((dayOfWeek) =>
          criarIndisponibilidadeRecorrente(meuProfissional.barbershopId, meuProfissional.id, {
            dayOfWeek,
            startTime: inicio,
            endTime: fim,
            reason: reasonRecorrente.trim() || undefined,
          })
        )
      )
      setDiasSelecionados(new Set())
      setStartTimeRecorrente('')
      setEndTimeRecorrente('')
      setReasonRecorrente('')
      setSucessoRecorrente('Bloqueio semanal registrado com sucesso!')
      setTimeout(() => setSucessoRecorrente(null), 5000)
      await listarIndisponibilidadesRecorrentes(meuProfissional.barbershopId, meuProfissional.id)
    } catch (err: any) {
      console.error('[ERRO_REGISTRAR_RECORRENTE]', err)
      const detalhe =
        err?.message ||
        (typeof err === 'string' ? err : 'Não foi possível registrar o bloqueio. Tente novamente.')
      setFormErrorRecorrente(detalhe)
    } finally {
      setSalvandoRecorrente(false)
    }
  }

  // Verifica se a data pontual selecionada cai num dia fechado
  const diaSemanaDataPontual = useMemo(() => {
    if (!dataPontual) return null
    try {
      const [ano, mes, dia] = dataPontual.split('-').map(Number)
      if (!ano || !mes || !dia) return null
      return new Date(ano, mes - 1, dia).getDay()
    } catch {
      return null
    }
  }, [dataPontual])

  const barbeariaFechadaNaDataPontual =
    temHorariosConfigurados && diaSemanaDataPontual !== null && !diasFuncionamento.has(diaSemanaDataPontual)

  async function handleRegistrarPontual() {
    setFormErrorPontual(null)
    setSucessoPontual(null)

    if (!meuProfissional) {
      setFormErrorPontual('Perfil de profissional não localizado para esta conta.')
      return
    }

    if (barbeariaFechadaNaDataPontual) {
      setFormErrorPontual(
        `A barbearia já está fechada neste dia (${DIAS_DA_SEMANA[diaSemanaDataPontual!].nome}). Não é necessário cadastrar indisponibilidade pois nenhum cliente consegue agendar.`
      )
      return
    }

    const inicio = startTimePontual.slice(0, 5)
    const fim = endTimePontual.slice(0, 5)

    if (!dataPontual || !inicio || !fim) {
      setFormErrorPontual('Por favor, preencha a data e os horários de início e término.')
      return
    }

    if (fim <= inicio) {
      setFormErrorPontual('O horário de término deve ser posterior ao horário de início.')
      return
    }

    setSalvandoPontual(true)
    try {
      const startsAt = `${dataPontual}T${inicio}:00.000Z`
      const endsAt = `${dataPontual}T${fim}:00.000Z`

      await criarIndisponibilidade(meuProfissional.barbershopId, meuProfissional.id, {
        startsAt,
        endsAt,
        reason: reasonPontual.trim() || undefined,
      })

      setDataPontual('')
      setStartTimePontual('')
      setEndTimePontual('')
      setReasonPontual('')
      setSucessoPontual('Bloqueio pontual registrado com sucesso!')
      setTimeout(() => setSucessoPontual(null), 5000)
      await listarIndisponibilidades(meuProfissional.barbershopId, meuProfissional.id)
    } catch (err: any) {
      console.error('[ERRO_REGISTRAR_PONTUAL]', err)
      const detalhe =
        err?.message ||
        (typeof err === 'string' ? err : 'Não foi possível registrar o bloqueio. Tente novamente.')
      setFormErrorPontual(detalhe)
    } finally {
      setSalvandoPontual(false)
    }
  }

  async function handleConfirmarRemoverRecorrente() {
    if (!meuProfissional || !recorrenteParaRemover) return
    setRemovendo(true)
    try {
      await removerIndisponibilidadeRecorrente(
        meuProfissional.barbershopId,
        meuProfissional.id,
        recorrenteParaRemover.id
      )
      await listarIndisponibilidadesRecorrentes(meuProfissional.barbershopId, meuProfissional.id)
      setRecorrenteParaRemover(null)
    } finally {
      setRemovendo(false)
    }
  }

  async function handleConfirmarRemoverPontual() {
    if (!meuProfissional || !pontualParaRemover) return
    setRemovendo(true)
    try {
      await removerIndisponibilidade(
        meuProfissional.barbershopId,
        meuProfissional.id,
        pontualParaRemover.id
      )
      await listarIndisponibilidades(meuProfissional.barbershopId, meuProfissional.id)
      setPontualParaRemover(null)
    } finally {
      setRemovendo(false)
    }
  }

  const recorrentesOrdenadas = useMemo(() => {
    return [...indisponibilidadesRecorrentes].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
      return a.startTime.localeCompare(b.startTime)
    })
  }, [indisponibilidadesRecorrentes])

  return (
    <div className="min-h-screen bg-primary">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        {/* Navegação de Retorno */}
        <div>
          <Link
            to="/professional/schedule"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar para Minha Agenda</span>
          </Link>
        </div>

        {/* Header / Hero */}
        <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20 shadow-xs">
              <Ban size={28} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  Minha Indisponibilidade
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-selected/10 text-selected border border-selected/30">
                  <Sparkles size={12} />
                  Bloqueio Automático
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                Configure os períodos em que você não realiza atendimentos para bloquear agendamentos de clientes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white border border-border px-4 py-2 rounded-xl text-center shadow-2xs">
              <span className="text-2xs font-semibold text-text-secondary uppercase tracking-wider block">
                Bloqueios Ativos
              </span>
              <span className="text-lg font-bold text-text-primary">
                {indisponibilidadesRecorrentes.length + indisponibilidades.length}
              </span>
            </div>
          </div>
        </div>

        {/* Loading Global */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-text-secondary">Carregando bloqueios de horário...</p>
          </div>
        )}

        {/* Erro Global */}
        {error && (
          <div className="max-w-xl">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}

        {!loading && !meuProfissional && (
          <Card className="rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
            <div className="max-w-md flex flex-col gap-1">
              <h3 className="text-lg font-bold text-text-primary">Perfil Profissional Não Encontrado</h3>
              <p className="text-sm text-text-secondary">
                Para gerenciar horários de indisponibilidade, sua conta precisa estar vinculada como profissional em uma barbearia.
              </p>
            </div>
            <Link to="/owner/barbershops" className="mt-2">
              <Button variant="secondary" size="sm">
                Ir para Minhas Barbearias
              </Button>
            </Link>
          </Card>
        )}

        {!loading && meuProfissional && (
          <div className="flex flex-col gap-6">
            {/* Abas: Recorrente (Semanal) vs Pontual (Data Específica) */}
            <div className="flex items-center gap-2 border-b border-border pb-1">
              <button
                type="button"
                onClick={() => {
                  setAbaAtiva('recorrente')
                  setFormErrorRecorrente(null)
                }}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  abaAtiva === 'recorrente'
                    ? 'border-selected text-selected'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <CalendarDays size={18} />
                <span>Bloqueios Recorrentes (Semanais)</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-selected/10 text-selected">
                  {indisponibilidadesRecorrentes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAbaAtiva('pontual')
                  setFormErrorPontual(null)
                }}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  abaAtiva === 'pontual'
                    ? 'border-selected text-selected'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <CalendarOff size={18} />
                <span>Bloqueios Pontuais (Data Específica)</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-selected/10 text-selected">
                  {indisponibilidades.length}
                </span>
              </button>
            </div>

            {/* ABA 1: RECORRENTE (SEMANAL) */}
            {abaAtiva === 'recorrente' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Formulário Recorrente */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <Card className="rounded-2xl p-6 sm:p-7 flex flex-col gap-6 shadow-xs border-border">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                        <Clock size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-text-primary">Registrar Bloqueio Semanal</h2>
                        <p className="text-xs text-text-secondary">
                          Repete-se automaticamente toda semana nos dias de atendimento marcados.
                        </p>
                      </div>
                    </div>

                    {/* Seleção dos Dias da Semana com Detecção de Fechamento */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
                          Dias da Semana
                        </label>
                        <div className="flex items-center gap-2 text-2xs">
                          <button
                            type="button"
                            onClick={selecionarSegASex}
                            className="text-selected hover:underline font-semibold cursor-pointer"
                          >
                            Seg-Sex
                          </button>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={selecionarFimDeSemana}
                            className="text-selected hover:underline font-semibold cursor-pointer"
                          >
                            Fim de semana
                          </button>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={selecionarTodosDias}
                            className="text-selected hover:underline font-semibold cursor-pointer"
                          >
                            Abertos
                          </button>
                          {diasSelecionados.size > 0 && (
                            <>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={limparDias}
                                className="text-text-secondary hover:text-red-600 hover:underline cursor-pointer"
                              >
                                Limpar
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {DIAS_DA_SEMANA.map((dia) => {
                          const selecionado = diasSelecionados.has(dia.id)
                          const abreNesteDia = !temHorariosConfigurados || diasFuncionamento.has(dia.id)

                          return (
                            <button
                              key={dia.id}
                              type="button"
                              onClick={() => toggleDia(dia.id)}
                              title={
                                abreNesteDia
                                  ? `Selecionar ${dia.nome}`
                                  : `Barbearia fechada aos ${dia.nome.toLowerCase()}s (não recebe agendamentos)`
                              }
                              className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                !abreNesteDia
                                  ? 'bg-zinc-100 border-zinc-200 text-zinc-400 hover:bg-zinc-200'
                                  : selecionado
                                  ? 'bg-selected text-white border-selected shadow-2xs'
                                  : 'bg-white border-border text-text-secondary hover:border-selected/40 hover:text-text-primary'
                              }`}
                            >
                              <span>{dia.abrev}</span>
                              {!abreNesteDia && (
                                <span className="text-3xs font-normal text-zinc-400 scale-90">
                                  Fechado
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {temHorariosConfigurados && (
                        <div className="flex items-center gap-1.5 text-2xs text-text-secondary bg-secondary p-2 rounded-lg border border-border">
                          <Store size={13} className="text-selected shrink-0" />
                          <span>
                            Dias marcados como <strong>Fechado</strong> já têm agendamentos bloqueados pela barbearia.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Sugestões Rápidas de Horário */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-2xs font-semibold text-text-secondary uppercase tracking-wider">
                        Atalhos de Intervalo
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => aplicarPresetHorario('12:00', '13:00', 'Almoço')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-border text-xs text-text-secondary hover:text-text-primary hover:border-selected/40 transition-colors cursor-pointer"
                        >
                          🍴 Almoço (12:00 - 13:00)
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarPresetHorario('12:30', '13:30', 'Almoço')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-border text-xs text-text-secondary hover:text-text-primary hover:border-selected/40 transition-colors cursor-pointer"
                        >
                          🍴 Almoço (12:30 - 13:30)
                        </button>
                        <button
                          type="button"
                          onClick={() => aplicarPresetHorario('16:00', '16:30', 'Intervalo da tarde')}
                          className="px-2.5 py-1 rounded-lg bg-white border border-border text-xs text-text-secondary hover:text-text-primary hover:border-selected/40 transition-colors cursor-pointer"
                        >
                          ☕ Intervalo (16:00 - 16:30)
                        </button>
                      </div>
                    </div>

                    {/* Horários */}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Horário Inicial"
                        icon={Clock}
                        type="time"
                        value={startTimeRecorrente}
                        onChange={(e) => setStartTimeRecorrente(e.target.value)}
                      />
                      <Input
                        label="Horário Final"
                        icon={Clock}
                        type="time"
                        value={endTimeRecorrente}
                        onChange={(e) => setEndTimeRecorrente(e.target.value)}
                      />
                    </div>

                    {/* Motivo */}
                    <Input
                      label="Motivo do Bloqueio (opcional)"
                      icon={Info}
                      placeholder="Ex: Almoço, Folga semanal, Treinamento"
                      helperText="Visível apenas para você e a administração"
                      value={reasonRecorrente}
                      onChange={(e) => setReasonRecorrente(e.target.value)}
                    />

                    {formErrorRecorrente && <ErrorMessage>{formErrorRecorrente}</ErrorMessage>}
                    {sucessoRecorrente && <SuccessMessage>{sucessoRecorrente}</SuccessMessage>}

                    {/* Botão de Registro */}
                    <Button
                      disabled={diasSelecionados.size === 0 || !startTimeRecorrente || !endTimeRecorrente}
                      loading={salvandoRecorrente}
                      onClick={handleRegistrarRecorrente}
                      className="justify-center shadow-sm"
                    >
                      <Plus size={16} />
                      <span>
                        Registrar nos {diasSelecionados.size}{' '}
                        {diasSelecionados.size === 1 ? 'dia marcado' : 'dias marcados'}
                      </span>
                    </Button>
                  </Card>
                </div>

                {/* Lista de Bloqueios Recorrentes */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
                      <CalendarDays size={18} className="text-selected" />
                      Bloqueios Semanais Registrados ({indisponibilidadesRecorrentes.length})
                    </h3>
                  </div>

                  {recorrentesOrdenadas.length === 0 ? (
                    <Card className="p-8 text-center flex flex-col items-center justify-center gap-3 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-selected/10 text-selected flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-text-primary text-sm">Nenhum bloqueio recorrente</h4>
                        <p className="text-xs text-text-secondary max-w-xs">
                          Você está com todos os horários livres para agendamentos nos dias de funcionamento da barbearia.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {recorrentesOrdenadas.map((bloqueio) => {
                        const diaObj = DIAS_DA_SEMANA[bloqueio.dayOfWeek]

                        return (
                          <div
                            key={bloqueio.id}
                            className="bg-secondary border border-border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all duration-200 hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-white border border-border text-selected font-bold text-xs flex flex-col items-center justify-center shrink-0 shadow-2xs">
                                <span>{diaObj?.abrev}</span>
                              </div>

                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-text-primary">
                                    {diaObj?.nome}
                                  </span>
                                  <span className="font-semibold text-xs text-selected bg-selected/10 px-2 py-0.5 rounded-md">
                                    {bloqueio.startTime.slice(0, 5)} - {bloqueio.endTime.slice(0, 5)}
                                  </span>
                                </div>

                                {bloqueio.reason ? (
                                  <span className="text-xs text-text-secondary truncate mt-0.5">
                                    {bloqueio.reason}
                                  </span>
                                ) : (
                                  <span className="text-2xs text-text-secondary/60 italic mt-0.5">
                                    Sem motivo informado
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setRecorrenteParaRemover(bloqueio)}
                              className="p-2 rounded-xl text-text-secondary hover:text-red-600 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                              title="Remover bloqueio"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA 2: PONTUAL (DATA ESPECÍFICA) */}
            {abaAtiva === 'pontual' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Formulário Pontual */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                  <Card className="rounded-2xl p-6 sm:p-7 flex flex-col gap-6 shadow-xs border-border">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                        <CalendarOff size={20} strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-text-primary">Bloqueio em Data Específica</h2>
                        <p className="text-xs text-text-secondary">
                          Bloqueie uma data pontual para compromissos pessoais, consultas ou folgas extras.
                        </p>
                      </div>
                    </div>

                    <Input
                      label="Data do Bloqueio"
                      icon={Calendar}
                      type="date"
                      value={dataPontual}
                      onChange={(e) => {
                        setDataPontual(e.target.value)
                        setFormErrorPontual(null)
                      }}
                    />

                    {/* Aviso de dia fechado se aplicável */}
                    {barbeariaFechadaNaDataPontual && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                        <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          <strong>A barbearia não abre neste dia da semana ({DIAS_DA_SEMANA[diaSemanaDataPontual!].nome}).</strong> Os clientes já não conseguem agendar horários nesta data.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Horário Inicial"
                        icon={Clock}
                        type="time"
                        value={startTimePontual}
                        onChange={(e) => setStartTimePontual(e.target.value)}
                      />
                      <Input
                        label="Horário Final"
                        icon={Clock}
                        type="time"
                        value={endTimePontual}
                        onChange={(e) => setEndTimePontual(e.target.value)}
                      />
                    </div>

                    <Input
                      label="Motivo (opcional)"
                      icon={Info}
                      placeholder="Ex: Consulta médica, Viagem, Feriado"
                      value={reasonPontual}
                      onChange={(e) => setReasonPontual(e.target.value)}
                    />

                    {formErrorPontual && <ErrorMessage>{formErrorPontual}</ErrorMessage>}
                    {sucessoPontual && <SuccessMessage>{sucessoPontual}</SuccessMessage>}

                    <Button
                      disabled={
                        !dataPontual ||
                        !startTimePontual ||
                        !endTimePontual ||
                        barbeariaFechadaNaDataPontual
                      }
                      loading={salvandoPontual}
                      onClick={handleRegistrarPontual}
                      className="justify-center shadow-sm"
                    >
                      <Plus size={16} />
                      <span>Registrar Bloqueio nesta Data</span>
                    </Button>
                  </Card>
                </div>

                {/* Lista de Bloqueios Pontuais */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="font-bold text-text-primary text-base flex items-center gap-2">
                      <CalendarOff size={18} className="text-selected" />
                      Bloqueios Pontuais Cadastrados ({indisponibilidades.length})
                    </h3>
                  </div>

                  {indisponibilidades.length === 0 ? (
                    <Card className="p-8 text-center flex flex-col items-center justify-center gap-3 rounded-2xl">
                      <div className="w-12 h-12 rounded-xl bg-selected/10 text-selected flex items-center justify-center">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-text-primary text-sm">Nenhum bloqueio pontual</h4>
                        <p className="text-xs text-text-secondary max-w-xs">
                          Você não possui datas específicas bloqueadas no momento.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {indisponibilidades.map((bloqueio) => {
                        const inicio = formatarDataHoraPtBr(bloqueio.startsAt)
                        const fim = formatarDataHoraPtBr(bloqueio.endsAt)

                        return (
                          <div
                            key={bloqueio.id}
                            className="bg-secondary border border-border rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all duration-200 hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-11 h-11 rounded-xl bg-white border border-border text-selected flex items-center justify-center shrink-0 shadow-2xs">
                                <CalendarX size={20} />
                              </div>

                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-text-primary">
                                    {inicio.data}
                                  </span>
                                  <span className="font-semibold text-xs text-selected bg-selected/10 px-2 py-0.5 rounded-md">
                                    {inicio.hora} até {fim.hora}
                                  </span>
                                </div>

                                {bloqueio.reason ? (
                                  <span className="text-xs text-text-secondary truncate mt-0.5">
                                    {bloqueio.reason}
                                  </span>
                                ) : (
                                  <span className="text-2xs text-text-secondary/60 italic mt-0.5">
                                    Sem motivo informado
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setPontualParaRemover(bloqueio)}
                              className="p-2 rounded-xl text-text-secondary hover:text-red-600 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                              title="Remover bloqueio"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de Confirmação de Exclusão (Recorrente) */}
        {recorrenteParaRemover && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0 border border-red-500/20">
                  <AlertTriangle size={24} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-text-primary">Remover Bloqueio Semanal</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Deseja remover o bloqueio de{' '}
                    <strong className="text-text-primary">
                      {DIAS_DA_SEMANA[recorrenteParaRemover.dayOfWeek]?.nome}
                    </strong>{' '}
                    das{' '}
                    <strong className="text-text-primary">
                      {recorrenteParaRemover.startTime.slice(0, 5)} às{' '}
                      {recorrenteParaRemover.endTime.slice(0, 5)}
                    </strong>
                    ? O horário voltará a ficar disponível para agendamento dos clientes.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setRecorrenteParaRemover(null)}
                  disabled={removendo}
                  className="px-4 py-2 text-sm cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  loading={removendo}
                  onClick={handleConfirmarRemoverRecorrente}
                  className="px-5 py-2 text-sm cursor-pointer"
                >
                  <Trash2 size={16} />
                  Remover Bloqueio
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão (Pontual) */}
        {pontualParaRemover && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0 border border-red-500/20">
                  <AlertTriangle size={24} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-text-primary">Remover Bloqueio Pontual</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Deseja remover o bloqueio pontual do dia{' '}
                    <strong className="text-text-primary">
                      {formatarDataHoraPtBr(pontualParaRemover.startsAt).data}
                    </strong>
                    ?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPontualParaRemover(null)}
                  disabled={removendo}
                  className="px-4 py-2 text-sm cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  loading={removendo}
                  onClick={handleConfirmarRemoverPontual}
                  className="px-5 py-2 text-sm cursor-pointer"
                >
                  <Trash2 size={16} />
                  Remover Bloqueio
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
