import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { useAgendamento } from '../features/agendamento/model/useAgendamento'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { SuccessMessage } from '../shared/ui/SuccessMessage'
import { BottomNav } from '../shared/ui/BottomNav'
import type { RecurringUnavailability } from '../entities/appointment/types'

type TabId = 'recorrente' | 'pontual'

const DIAS_DA_SEMANA = [
  { id: 0, abrev: 'Dom' },
  { id: 1, abrev: 'Seg' },
  { id: 2, abrev: 'Ter' },
  { id: 3, abrev: 'Qua' },
  { id: 4, abrev: 'Qui' },
  { id: 5, abrev: 'Sex' },
  { id: 6, abrev: 'Sáb' },
] as const

const MESES_ABREV = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
] as const

type ItemLista =
  | { tipo: 'recorrente'; id: string; titulo: string; sub: string; reason: string | null }
  | { tipo: 'pontual'; id: string; titulo: string; sub: string; reason: string | null }

function agruparRecorrentesMesmoHorario(lista: RecurringUnavailability[]): ItemLista[] {
  const grupos = new Map<string, RecurringUnavailability[]>()
  for (const b of lista) {
    const chave = `${b.startTime}|${b.endTime}|${b.reason ?? ''}`
    const arr = grupos.get(chave) ?? []
    arr.push(b)
    grupos.set(chave, arr)
  }

  const itens: ItemLista[] = []
  for (const [, arr] of grupos) {
    const diasIds = arr.map((b) => b.dayOfWeek).sort((a, b) => a - b)
    const todosSegASex =
      diasIds.length === 5 &&
      diasIds[0] === 1 && diasIds[1] === 2 && diasIds[2] === 3 && diasIds[3] === 4 && diasIds[4] === 5
    const todosDiaInteiro =
      diasIds.length === 7 &&
      diasIds[0] === 0 && diasIds[1] === 1 && diasIds[2] === 2 &&
      diasIds[3] === 3 && diasIds[4] === 4 && diasIds[5] === 5 && diasIds[6] === 6
    const sóFds =
      diasIds.length === 2 && diasIds[0] === 0 && diasIds[1] === 6

    let diasTexto: string
    if (todosSegASex) diasTexto = 'Seg a Sex'
    else if (todosDiaInteiro) diasTexto = 'Todos os dias'
    else if (sóFds) diasTexto = 'Fim de semana'
    else diasTexto = diasIds.map((d) => DIAS_DA_SEMANA[d].abrev).join(', ')

    const ref = arr[0]
    const horario = `${ref.startTime.slice(0, 5)} – ${ref.endTime.slice(0, 5)}`
    const titulo = ref.reason?.trim() || 'Bloqueio semanal'
    const representante = arr.reduce((a, b) => (a.dayOfWeek < b.dayOfWeek ? a : b))
    itens.push({
      tipo: 'recorrente',
      id: `grupo:${representante.id}`,
      titulo,
      sub: `${diasTexto} • ${horario}`,
      reason: ref.reason,
    })
  }
  return itens
}

function formatarDataPtBr(iso: string): string {
  try {
    const parte = iso.includes('T') ? iso.slice(0, 10) : iso
    const [ano, mes, dia] = parte.split('-').map(Number)
    if (!ano || !mes || !dia) return iso
    return `${dia} ${MESES_ABREV[mes - 1]}`
  } catch {
    return iso
  }
}

export function UnavailabilityPage() {
  const navigate = useNavigate()
  const {
    indisponibilidadesRecorrentes,
    indisponibilidades,
    meuProfissional,
    loading,
    error,
    buscarMeuProfissional,
    listarIndisponibilidadesRecorrentes,
    criarIndisponibilidadeRecorrente,
    removerIndisponibilidadeRecorrente,
    listarIndisponibilidades,
    criarIndisponibilidade,
    removerIndisponibilidade,
  } = useAgendamento()

  const [tab, setTab] = useState<TabId>('recorrente')

  // Form Recorrente
  const [diasSelecionados, setDiasSelecionados] = useState<Set<number>>(new Set([1, 2, 3, 4]))
  const [startRec, setStartRec] = useState('12:00')
  const [endRec, setEndRec] = useState('13:00')
  const [motivoRec, setMotivoRec] = useState('')
  const [salvandoRec, setSalvandoRec] = useState(false)
  const [formErrRec, setFormErrRec] = useState<string | null>(null)
  const [formOkRec, setFormOkRec] = useState<string | null>(null)

  // Form Pontual
  const [dataPont, setDataPont] = useState('')
  const [startPont, setStartPont] = useState('')
  const [endPont, setEndPont] = useState('')
  const [motivoPont, setMotivoPont] = useState('')
  const [salvandoPont, setSalvandoPont] = useState(false)
  const [formErrPont, setFormErrPont] = useState<string | null>(null)
  const [formOkPont, setFormOkPont] = useState<string | null>(null)

  // Ações de remover
  const [removendo, setRemovendo] = useState(false)

  useEffect(() => {
    buscarMeuProfissional().then((p) => {
      if (p) {
        listarIndisponibilidadesRecorrentes(p.barbershopId, p.id)
        listarIndisponibilidades(p.barbershopId, p.id)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleDia(id: number) {
    setDiasSelecionados((atual) => {
      const n = new Set(atual)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  async function handleAdicionarRecorrente() {
    setFormErrRec(null)
    setFormOkRec(null)

    if (!meuProfissional) {
      setFormErrRec('Perfil profissional não localizado para esta conta.')
      return
    }
    if (diasSelecionados.size === 0) {
      setFormErrRec('Selecione pelo menos um dia da semana.')
      return
    }
    const inicio = startRec.slice(0, 5)
    const fim = endRec.slice(0, 5)
    if (!inicio || !fim) {
      setFormErrRec('Informe os horários inicial e final.')
      return
    }
    if (fim <= inicio) {
      setFormErrRec('O horário final deve ser maior que o inicial.')
      return
    }

    setSalvandoRec(true)
    try {
      await Promise.all(
        Array.from(diasSelecionados).map((d) =>
          criarIndisponibilidadeRecorrente(meuProfissional.barbershopId, meuProfissional.id, {
            dayOfWeek: d,
            startTime: inicio,
            endTime: fim,
            reason: motivoRec.trim() || undefined,
          }),
        ),
      )
      setMotivoRec('')
      setFormOkRec('Bloqueio recorrente adicionado!')
      setTimeout(() => setFormOkRec(null), 4500)
      await listarIndisponibilidadesRecorrentes(meuProfissional.barbershopId, meuProfissional.id)
    } catch (err: any) {
      const msg =
        err?.message ??
        (err instanceof Error ? err.message : undefined) ??
        'Não foi possível adicionar o bloqueio. Tente novamente.'
      setFormErrRec(msg)
    } finally {
      setSalvandoRec(false)
    }
  }

  async function handleAdicionarPontual() {
    setFormErrPont(null)
    setFormOkPont(null)

    if (!meuProfissional) {
      setFormErrPont('Perfil profissional não localizado para esta conta.')
      return
    }

    const inicio = startPont.slice(0, 5)
    const fim = endPont.slice(0, 5)
    if (!dataPont || !inicio || !fim) {
      setFormErrPont('Preencha a data e os horários inicial e final.')
      return
    }
    if (fim <= inicio) {
      setFormErrPont('O horário final deve ser maior que o inicial.')
      return
    }

    setSalvandoPont(true)
    try {
      const startsAt = `${dataPont}T${inicio}:00.000Z`
      const endsAt = `${dataPont}T${fim}:00.000Z`
      await criarIndisponibilidade(meuProfissional.barbershopId, meuProfissional.id, {
        startsAt,
        endsAt,
        reason: motivoPont.trim() || undefined,
      })
      setDataPont('')
      setStartPont('')
      setEndPont('')
      setMotivoPont('')
      setFormOkPont('Bloqueio pontual adicionado!')
      setTimeout(() => setFormOkPont(null), 4500)
      await listarIndisponibilidades(meuProfissional.barbershopId, meuProfissional.id)
    } catch (err: any) {
      const msg =
        err?.message ??
        (err instanceof Error ? err.message : undefined) ??
        'Não foi possível adicionar o bloqueio. Tente novamente.'
      setFormErrPont(msg)
    } finally {
      setSalvandoPont(false)
    }
  }

  async function handleRemoverRecorrente(id: string) {
    if (!meuProfissional) return
    setRemovendo(true)
    try {
      await removerIndisponibilidadeRecorrente(
        meuProfissional.barbershopId,
        meuProfissional.id,
        id,
      )
      await listarIndisponibilidadesRecorrentes(meuProfissional.barbershopId, meuProfissional.id)
    } finally {
      setRemovendo(false)
    }
  }

  async function handleRemoverPontual(id: string) {
    if (!meuProfissional) return
    setRemovendo(true)
    try {
      await removerIndisponibilidade(
        meuProfissional.barbershopId,
        meuProfissional.id,
        id,
      )
      await listarIndisponibilidades(meuProfissional.barbershopId, meuProfissional.id)
    } finally {
      setRemovendo(false)
    }
  }

  const itensLista = useMemo<ItemLista[]>(() => {
    const recorrentes = agruparRecorrentesMesmoHorario(indisponibilidadesRecorrentes)
    const pontuais: ItemLista[] = indisponibilidades.map((b) => {
      const data = formatarDataPtBr(b.startsAt)
      const horario = `${b.startsAt.slice(11, 16)} – ${b.endsAt.slice(11, 16)}`
      const titulo = b.reason?.trim() || 'Bloqueio'
      return {
        tipo: 'pontual',
        id: b.id,
        titulo: b.reason ? `${titulo} (Pontual)` : 'Bloqueio Pontual',
        sub: `${data} • ${horario}`,
        reason: b.reason,
      }
    })
    return [...recorrentes, ...pontuais]
  }, [indisponibilidadesRecorrentes, indisponibilidades])

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-40 md:pb-8">
      <main
        className="max-w-md mx-auto px-5 pt-8 pb-4 flex flex-col gap-6"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="shrink-0 w-10 h-10 rounded-full inline-flex items-center justify-center text-[#1a1722] hover:bg-white transition-colors"
            style={{ marginLeft: '-8px' }}
          >
            <ArrowLeft size={28} strokeWidth={2.2} />
          </button>
          <h1
            className="font-extrabold tracking-tight text-[#1a1722] leading-tight"
            style={{ fontSize: '29px', letterSpacing: '-0.02em' }}
          >
            Indisponibilidades
          </h1>
        </div>

        <div
          className="grid grid-cols-2 items-center"
          style={{ padding: '5px', borderRadius: '999px', background: '#efe8ff' }}
          role="tablist"
        >
          <button
            role="tab"
            aria-selected={tab === 'recorrente'}
            type="button"
            onClick={() => {
              setTab('recorrente')
              setFormErrRec(null)
              setFormErrPont(null)
            }}
            className={[
              'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150',
              tab === 'recorrente'
                ? 'bg-white text-[#6d5bd9] shadow-[0_1px_3px_rgba(109,91,217,0.15)]'
                : 'text-[#837c92] hover:text-[#5b5669]',
            ].join(' ')}
            style={{ padding: '11px 14px', borderRadius: '999px', fontSize: '17px' }}
          >
            Recorrente
          </button>
          <button
            role="tab"
            aria-selected={tab === 'pontual'}
            type="button"
            onClick={() => {
              setTab('pontual')
              setFormErrRec(null)
              setFormErrPont(null)
            }}
            className={[
              'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150',
              tab === 'pontual'
                ? 'bg-white text-[#6d5bd9] shadow-[0_1px_3px_rgba(109,91,217,0.15)]'
                : 'text-[#837c92] hover:text-[#5b5669]',
            ].join(' ')}
            style={{ padding: '11px 14px', borderRadius: '999px', fontSize: '17px' }}
          >
            Pontual
          </button>
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {loading && !meuProfissional && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" tone="selected" />
            <p className="text-sm text-[#6b6778]">Carregando...</p>
          </div>
        )}

        {!loading && !meuProfissional && (
          <div
            className="bg-white border border-[#ebe7f5] p-8 flex flex-col items-center text-center gap-4"
            style={{ borderRadius: '22px' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: '#fff4e5' }}
            >
              <AlertTriangle size={28} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-[#1a1722]" style={{ fontSize: '18px' }}>
              Perfil Profissional Não Encontrado
            </h3>
            <p className="text-sm text-[#6b6478]">
              Esta tela exige que sua conta esteja vinculada como profissional em uma barbearia.
            </p>
          </div>
        )}

        {!loading && meuProfissional && (
          <>
            <section
              className="bg-white border border-[#ebe7f5] flex flex-col gap-5"
              style={{
                padding: '22px 22px 26px',
                borderRadius: '22px',
                boxShadow: '0 1px 3px rgba(26,23,34,0.04)',
              }}
            >
              <h2
                className="font-bold tracking-tight text-[#1a1722]"
                style={{ fontSize: '19px', letterSpacing: '-0.01em' }}
              >
                {tab === 'recorrente' ? 'Adicionar Bloqueio Recorrente' : 'Adicionar Bloqueio Pontual'}
              </h2>

              {tab === 'recorrente' ? (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {DIAS_DA_SEMANA.slice(1).map((d) => {
                      const selecionado = diasSelecionados.has(d.id)
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleDia(d.id)}
                          className={[
                            'inline-flex items-center justify-center font-bold tracking-tight',
                            'rounded-[14px] transition-all duration-150 min-w-[62px]',
                            selecionado
                              ? 'bg-[#f4efff] text-[#6d5bd9] border border-[#d6cdf8]'
                              : 'bg-[#ece8f5] text-[#6b6478] border border-transparent hover:text-[#4a4459]',
                          ].join(' ')}
                          style={{ padding: '10px 16px', fontSize: '17px' }}
                        >
                          {d.abrev}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => toggleDia(6)}
                      className={[
                        'inline-flex items-center justify-center font-bold tracking-tight',
                        'rounded-[14px] transition-all duration-150 min-w-[62px]',
                        diasSelecionados.has(6)
                          ? 'bg-[#f4efff] text-[#6d5bd9] border border-[#d6cdf8]'
                          : 'bg-[#ece8f5] text-[#6b6478] border border-transparent hover:text-[#4a4459]',
                      ].join(' ')}
                      style={{ padding: '10px 16px', fontSize: '17px' }}
                    >
                      Sáb
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleDia(0)}
                      className={[
                        'inline-flex items-center justify-center font-bold tracking-tight',
                        'rounded-[14px] transition-all duration-150 min-w-[62px]',
                        diasSelecionados.has(0)
                          ? 'bg-[#f4efff] text-[#6d5bd9] border border-[#d6cdf8]'
                          : 'bg-[#ece8f5] text-[#6b6478] border border-transparent hover:text-[#4a4459]',
                      ].join(' ')}
                      style={{ padding: '10px 16px', fontSize: '17px' }}
                    >
                      Dom
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-semibold tracking-tight"
                        style={{ color: '#6d5bd9', fontSize: '15px' }}
                      >
                        Horário Inicial
                      </label>
                      <input
                        type="time"
                        className={[
                          'w-full bg-[#fef7ff] border rounded-[14px]',
                          'font-bold tracking-tight text-[#1a1722]',
                          'transition-all duration-150 outline-none',
                          'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
                        ].join(' ')}
                        style={{ padding: '13px 18px', fontSize: '19px' }}
                        value={startRec}
                        onChange={(e) => setStartRec(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-semibold tracking-tight"
                        style={{ color: '#6d5bd9', fontSize: '15px' }}
                      >
                        Horário Final
                      </label>
                      <input
                        type="time"
                        className={[
                          'w-full bg-[#fef7ff] border rounded-[14px]',
                          'font-bold tracking-tight text-[#1a1722]',
                          'transition-all duration-150 outline-none',
                          'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
                        ].join(' ')}
                        style={{ padding: '13px 18px', fontSize: '19px' }}
                        value={endRec}
                        onChange={(e) => setEndRec(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-semibold tracking-tight"
                      style={{ color: '#6d5bd9', fontSize: '15px' }}
                    >
                      Motivo (opcional)
                    </label>
                    <input
                      type="text"
                      className={[
                        'w-full bg-[#fef7ff] border rounded-[14px]',
                        'font-bold tracking-tight text-[#1a1722]',
                        'placeholder:text-[#b7b0ca]',
                        'transition-all duration-150 outline-none',
                        'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
                      ].join(' ')}
                      style={{ padding: '13px 18px', fontSize: '19px' }}
                      placeholder="Ex: Almoço com a equipe"
                      value={motivoRec}
                      onChange={(e) => setMotivoRec(e.target.value)}
                    />
                  </div>

                  {formErrRec && <ErrorMessage>{formErrRec}</ErrorMessage>}
                  {formOkRec && <SuccessMessage>{formOkRec}</SuccessMessage>}

                  <div className="pt-0.5">
                    <button
                      type="button"
                      disabled={salvandoRec}
                      className={[
                        'w-full inline-flex items-center justify-center gap-2',
                        'text-white font-extrabold tracking-tight transition-all duration-150',
                        'shadow-[0_8px_20px_-6px_rgba(109,91,217,0.55)]',
                        salvandoRec
                          ? 'bg-[#b9b0d4] cursor-wait shadow-none'
                          : 'bg-[#6d5bd9] hover:bg-[#5d4bc9] active:scale-[0.992]',
                      ].join(' ')}
                      style={{ padding: '16px 20px', borderRadius: '999px', fontSize: '19px' }}
                      onClick={handleAdicionarRecorrente}
                    >
                      {salvandoRec ? (
                        <>
                          <LoadingSpinner size="sm" tone="white" />
                          Adicionando...
                        </>
                      ) : (
                        'Adicionar Bloqueio'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-semibold tracking-tight"
                      style={{ color: '#6d5bd9', fontSize: '15px' }}
                    >
                      Data
                    </label>
                    <input
                      type="date"
                      className={[
                        'w-full bg-[#fef7ff] border rounded-[14px]',
                        'font-bold tracking-tight text-[#1a1722]',
                        'transition-all duration-150 outline-none',
                        'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
                      ].join(' ')}
                      style={{ padding: '13px 18px', fontSize: '19px' }}
                      value={dataPont}
                      onChange={(e) => setDataPont(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-semibold tracking-tight"
                        style={{ color: '#6d5bd9', fontSize: '15px' }}
                      >
                        Horário Inicial
                      </label>
                      <input
                        type="time"
                        className={[
                          'w-full bg-[#fef7ff] border rounded-[14px]',
                          'font-bold tracking-tight text-[#1a1722]',
                          'transition-all duration-150 outline-none',
                          'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
                        ].join(' ')}
                        style={{ padding: '13px 18px', fontSize: '19px' }}
                        value={startPont}
                        onChange={(e) => setStartPont(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="font-semibold tracking-tight"
                        style={{ color: '#6d5bd9', fontSize: '15px' }}
                      >
                        Horário Final
                      </label>
                      <input
                        type="time"
                        className={[
                          'w-full bg-[#fef7ff] border rounded-[14px]',
                          'font-bold tracking-tight text-[#1a1722]',
                          'transition-all duration-150 outline-none',
                          'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
                        ].join(' ')}
                        style={{ padding: '13px 18px', fontSize: '19px' }}
                        value={endPont}
                        onChange={(e) => setEndPont(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-semibold tracking-tight"
                      style={{ color: '#6d5bd9', fontSize: '15px' }}
                    >
                      Motivo (opcional)
                    </label>
                    <input
                      type="text"
                      className={[
                        'w-full bg-[#fef7ff] border rounded-[14px]',
                        'font-bold tracking-tight text-[#1a1722]',
                        'placeholder:text-[#b7b0ca]',
                        'transition-all duration-150 outline-none',
                        'border-[#c2b8d6] hover:border-[#aea0c9] focus:border-[#6d5bd9] focus:ring-4 focus:ring-[#6d5bd9]/15',
                      ].join(' ')}
                      style={{ padding: '13px 18px', fontSize: '19px' }}
                      placeholder="Ex: Exame médico"
                      value={motivoPont}
                      onChange={(e) => setMotivoPont(e.target.value)}
                    />
                  </div>

                  {formErrPont && <ErrorMessage>{formErrPont}</ErrorMessage>}
                  {formOkPont && <SuccessMessage>{formOkPont}</SuccessMessage>}

                  <div className="pt-0.5">
                    <button
                      type="button"
                      disabled={salvandoPont}
                      className={[
                        'w-full inline-flex items-center justify-center gap-2',
                        'text-white font-extrabold tracking-tight transition-all duration-150',
                        'shadow-[0_8px_20px_-6px_rgba(109,91,217,0.55)]',
                        salvandoPont
                          ? 'bg-[#b9b0d4] cursor-wait shadow-none'
                          : 'bg-[#6d5bd9] hover:bg-[#5d4bc9] active:scale-[0.992]',
                      ].join(' ')}
                      style={{ padding: '16px 20px', borderRadius: '999px', fontSize: '19px' }}
                      onClick={handleAdicionarPontual}
                    >
                      {salvandoPont ? (
                        <>
                          <LoadingSpinner size="sm" tone="white" />
                          Adicionando...
                        </>
                      ) : (
                        'Adicionar Bloqueio'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="flex flex-col gap-4 pt-1">
              <h2
                className="font-bold tracking-tight text-[#1a1722]"
                style={{ fontSize: '19px', letterSpacing: '-0.01em' }}
              >
                Bloqueios Ativos
              </h2>

              {itensLista.length === 0 ? (
                <p className="text-[#6b6478] text-base pl-1">
                  Nenhum bloqueio ativo cadastrado.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {itensLista.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-[#ebe7f5] flex items-center justify-between gap-3"
                      style={{
                        padding: '18px 20px',
                        borderRadius: '18px',
                        boxShadow: '0 1px 2px rgba(26,23,34,0.04)',
                      }}
                    >
                      <div className="flex flex-col gap-1.5 min-w-0 pr-2">
                        <span
                          className="font-extrabold tracking-tight text-[#1a1722] truncate"
                          style={{ fontSize: '19px', letterSpacing: '-0.01em' }}
                        >
                          {item.titulo}
                        </span>
                        <span
                          className="tracking-tight"
                          style={{ color: '#6b6478', fontSize: '15px' }}
                        >
                          {item.sub}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={removendo}
                        onClick={() => {
                          if (item.tipo === 'recorrente') {
                            const realId = item.id.startsWith('grupo:')
                              ? item.id.slice(6)
                              : item.id
                            handleRemoverRecorrente(realId)
                          } else {
                            handleRemoverPontual(item.id)
                          }
                        }}
                        aria-label={item.tipo === 'recorrente' ? 'Remover bloqueio recorrente' : 'Remover bloqueio pontual'}
                        className="shrink-0 w-11 h-11 rounded-xl inline-flex items-center justify-center text-[#d95e5e] hover:bg-[#fff0f0] active:scale-[0.96] transition-all disabled:opacity-50"
                      >
                        <Trash2 size={26} strokeWidth={2.1} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
