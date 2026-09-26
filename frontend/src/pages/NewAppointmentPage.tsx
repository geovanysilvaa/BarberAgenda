import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  X,
  RefreshCw,
  Scissors,
  User as UserIcon,
} from 'lucide-react'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useAgendamento } from '../features/agendamento/model/useAgendamento'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { BottomNav } from '../shared/ui/BottomNav'
import { ApiError } from '../shared/lib/api'

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const DIAS_ABREV = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const
const MESES_NOME = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const

function dataToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function dateToISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDiasParaSemanaVisual(dataSelecionada: Date): Date[] {
  const dias: Date[] = []
  for (let i = 0; i < 7; i++) {
    const dia = new Date(dataSelecionada)
    dia.setDate(dataSelecionada.getDate() - dataSelecionada.getDay() + i)
    dias.push(dia)
  }
  return dias
}

export function NewAppointmentPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const barbershopId = searchParams.get('barbershopId')
  const serviceId = searchParams.get('serviceId')
  const [professionalId, setProfessionalId] = useState<string | null>(searchParams.get('professionalId'))

  const navigate = useNavigate()
  const {
    barbearia,
    profissionais,
    servicos,
    buscarBarbearia,
    listarProfissionais,
    listarServicos,
  } = useBarbeiro()
  const {
    horariosDisponiveis,
    loading: loadingHorarios,
    error: erroHorarios,
    buscarHorariosDisponiveis,
    criarAgendamento,
  } = useAgendamento()

  const [date, setDate] = useState<string>(hojeISO())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const dadosCompletos = !!barbershopId && !!professionalId && !!serviceId
  const temBarbeariaEServico = !!barbershopId && !!serviceId

  useEffect(() => {
    if (!barbershopId) return
    buscarBarbearia(barbershopId)
    listarProfissionais(barbershopId)
    listarServicos(barbershopId)
  }, [barbershopId, buscarBarbearia, listarProfissionais, listarServicos])

  useEffect(() => {
    if (!temBarbeariaEServico || profissionais.length === 0) return
    if (!professionalId) {
      setProfessionalId(profissionais[0].id)
      const params = new URLSearchParams(searchParams)
      params.set('professionalId', profissionais[0].id)
      setSearchParams(params, { replace: true })
    }
  }, [temBarbeariaEServico, professionalId, profissionais, searchParams, setSearchParams])

  useEffect(() => {
    if (!dadosCompletos) return
    setSelectedTime(null)
    buscarHorariosDisponiveis(barbershopId!, professionalId!, date, serviceId!)
  }, [dadosCompletos, barbershopId, professionalId, serviceId, date, buscarHorariosDisponiveis])

  const profissional = profissionais.find((p) => p.id === professionalId)
  const servico = servicos.find((s) => s.id === serviceId)

  const dataSelecionada = dataToDate(date)
  const semanaDias = useMemo(() => getDiasParaSemanaVisual(dataSelecionada), [date])
  const hojeDate = dataToDate(hojeISO())

  function handleSelecionarDia(d: Date) {
    if (d < hojeDate) return
    setDate(dateToISO(d))
  }

  function avancarSemana() {
    const novaData = new Date(dataSelecionada)
    novaData.setDate(novaData.getDate() + 7)
    setDate(dateToISO(novaData))
  }

  function voltarSemana() {
    const novaData = new Date(dataSelecionada)
    const novaDataVoltada = new Date(novaData.setDate(novaData.getDate() - 7))
    if (novaDataVoltada < hojeDate) {
      setDate(hojeISO())
    } else {
      setDate(dateToISO(novaDataVoltada))
    }
  }

  function handleSelecionarProfissional(id: string) {
    setProfessionalId(id)
    const params = new URLSearchParams(searchParams)
    params.set('professionalId', id)
    setSearchParams(params, { replace: true })
  }

  async function handleConfirmar() {
    if (!selectedTime) return
    setConfirmando(true)
    setConfirmError(null)
    try {
      await criarAgendamento({
        professionalId: professionalId!,
        serviceId: serviceId!,
        date,
        time: selectedTime,
      })
      setSucesso(true)
      setTimeout(() => navigate('/appointments'), 1600)
    } catch (err) {
      setConfirmError(
        err instanceof ApiError ? err.message : 'Não foi possível agendar. Tente novamente.',
      )
    } finally {
      setConfirmando(false)
    }
  }

  function handleVoltar() {
    if (barbershopId) navigate(`/barbershops/${barbershopId}`)
    else navigate(-1)
  }

  const podeConfirmar = !!selectedTime && !confirmando && !sucesso && dadosCompletos

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-40 md:pb-8">
      <header className="bg-[#fef7ff] sticky top-0 z-30 border-b border-[#ece8f5]/50">
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
            style={{ fontSize: '25px', letterSpacing: '-0.015em' }}
          >
            Novo Agendamento
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-5 pb-4 flex flex-col gap-7">
        {!barbershopId && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-3 text-sm text-amber-800">
            <Scissors size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Seleção incompleta</p>
              <p className="mt-1 leading-relaxed">
                Escolha uma barbearia e um serviço antes de agendar.
              </p>
            </div>
          </div>
        )}

        {temBarbeariaEServico && (
          <>
            <section
              className="bg-[#efe8ff] flex flex-col gap-2.5"
              style={{ padding: '18px 20px 20px', borderRadius: '22px' }}
            >
              <h2
                className="font-bold tracking-tight text-[#6d5bd9]"
                style={{ fontSize: '17px', letterSpacing: '0.01em' }}
              >
                RESUMO DO AGENDAMENTO
              </h2>

              <h3
                className="font-extrabold tracking-tight text-[#1a1722] leading-tight mt-1"
                style={{ fontSize: '22px' }}
              >
                {barbearia?.name ?? 'Carregando barbearia...'}
              </h3>

              <p
                className="text-[15px] text-[#4b4459] leading-snug"
                style={{ color: '#6b6478' }}
              >
                Serviço:{' '}
                <span className="text-[#3a344a] font-medium">{servico?.name ?? '...'}</span>
              </p>

              <p
                className="text-[15px] leading-snug"
                style={{ color: '#6b6478' }}
              >
                Profissional:{' '}
                <span className="text-[#3a344a] font-medium">{profissional?.name ?? '...'}</span>
              </p>

              <div className="pt-1 flex items-center gap-2 flex-wrap">
                <span
                  className="font-bold tracking-tight"
                  style={{ fontSize: '18px', color: '#6d5bd9' }}
                >
                  Preço: {servico ? formatPrice(servico.price) : 'R$ 0,00'}
                </span>
                <span style={{ color: '#6d5bd9' }}>•</span>
                <span
                  className="font-bold tracking-tight"
                  style={{ fontSize: '18px', color: '#6d5bd9' }}
                >
                  {servico?.durationMinutes ?? 0} min
                </span>
              </div>
            </section>

            {profissionais.length > 1 && (
              <section className="flex flex-col gap-3.5 -mx-5 px-5">
                <h2
                  className="font-bold tracking-tight text-[#1a1722]"
                  style={{ fontSize: '1.3rem' }}
                >
                  Selecione o profissional
                </h2>
                <div
                  className="flex gap-7 overflow-x-auto pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {profissionais.map((p) => {
                    const ativo = p.id === professionalId
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelecionarProfissional(p.id)}
                        className="flex flex-col items-center justify-center gap-2.5 w-[96px] shrink-0 group"
                      >
                        <div
                          className="w-20 h-20 rounded-full p-[3px] transition-all duration-200"
                          style={{
                            background: ativo
                              ? 'linear-gradient(135deg, #6d5bd9 0%, #8b7fe9 100%)'
                              : 'linear-gradient(135deg, #e9e3ff 0%, #f4efff 100%)',
                            boxShadow: ativo
                              ? '0 4px 12px -3px rgba(109,91,217,0.45)'
                              : 'none',
                          }}
                        >
                          <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                            {p.avatarUrl ? (
                              <img
                                src={p.avatarUrl}
                                alt={`Foto de ${p.name}`}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            ) : (
                              <UserIcon
                                size={28}
                                className={ativo ? 'text-[#6d5bd9]/70' : 'text-[#b5aed0]'}
                              />
                            )}
                          </div>
                        </div>
                        <span
                          className="text-[15px] font-bold tracking-tight line-clamp-1"
                          style={{ color: ativo ? '#6d5bd9' : '#2b2638' }}
                        >
                          {p.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            <section className="flex flex-col gap-3">
              <h2
                className="font-bold tracking-tight text-[#1a1722]"
                style={{ fontSize: '1.3rem' }}
              >
                Selecione a data
              </h2>

              <div
                className="bg-white border border-[#d4cde4] flex flex-col gap-4 relative overflow-hidden"
                style={{ padding: '20px 18px 22px', borderRadius: '22px' }}
              >
                <div className="flex items-center justify-between px-1">
                  <h3
                    className="font-extrabold tracking-tight text-[#1a1722]"
                    style={{ fontSize: '20px', letterSpacing: '-0.01em' }}
                  >
                    {MESES_NOME[dataSelecionada.getMonth()]} {dataSelecionada.getFullYear()}
                  </h3>
                </div>

                <div
                  className="grid grid-cols-7 gap-1 px-1"
                  role="row"
                  aria-label="Dias da semana"
                >
                  {DIAS_ABREV.map((d) => (
                    <div
                      key={d}
                      className="flex items-center justify-center text-[13px] font-bold pt-1"
                      style={{ color: '#837c92' }}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 px-1" role="row">
                  {semanaDias.map((d) => {
                    const diaNum = d.getDate()
                    const selecionado = dateToISO(d) === date
                    const passado = d < hojeDate
                    return (
                      <button
                        key={dateToISO(d)}
                        type="button"
                        disabled={passado}
                        onClick={() => handleSelecionarDia(d)}
                        className={[
                          'relative mx-auto w-11 h-11 rounded-full flex items-center justify-center',
                          'text-[17px] font-bold tracking-tight transition-all duration-150',
                          selecionado
                            ? 'bg-[#6d5bd9] text-white shadow-[0_4px_12px_-3px_rgba(109,91,217,0.5)]'
                            : passado
                              ? 'text-[#c7c2d4] cursor-not-allowed'
                              : 'text-[#1a1722] hover:bg-[#e9e3ff] active:scale-95',
                        ].join(' ')}
                      >
                        {diaNum}
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-end gap-1.5 px-1 pt-1">
                  <button
                    type="button"
                    onClick={voltarSemana}
                    aria-label="Semana anterior"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f1ecff] text-[#4b4459] active:bg-[#e9e3ff] transition-colors"
                  >
                    <ArrowLeft size={18} strokeWidth={2.3} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <button
                    type="button"
                    onClick={avancarSemana}
                    aria-label="Próxima semana"
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f1ecff] text-[#4b4459] active:bg-[#e9e3ff] transition-colors"
                  >
                    <ArrowLeft size={18} strokeWidth={2.3} />
                  </button>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3.5">
              <h2
                className="font-bold tracking-tight text-[#1a1722]"
                style={{ fontSize: '1.3rem' }}
              >
                Horários disponíveis
              </h2>

              {loadingHorarios && (
                <div className="flex items-center gap-3 px-1">
                  <LoadingSpinner size="sm" tone="selected" />
                  <p className="text-sm text-[#6b6778]">Buscando horários...</p>
                </div>
              )}

              {!loadingHorarios && erroHorarios && (
                <div className="flex flex-col gap-3">
                  <ErrorMessage>{erroHorarios}</ErrorMessage>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() =>
                        dadosCompletos &&
                        buscarHorariosDisponiveis(barbershopId!, professionalId!, date, serviceId!)
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#6d5bd9] bg-[#e9e3ff] rounded-xl hover:bg-[#d3c8ff] transition-colors"
                    >
                      <RefreshCw size={14} />
                      Tentar novamente
                    </button>
                  </div>
                </div>
              )}

              {!loadingHorarios && !erroHorarios && (
                <>
                  {horariosDisponiveis.length === 0 ? (
                    <div
                      className="bg-white border border-[#ebe7f5] p-5 flex items-start gap-3 text-sm"
                      style={{ borderRadius: '18px', color: '#4a4657' }}
                    >
                      <X size={20} className="text-[#8c8699] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Nenhum horário disponível</p>
                        <p className="mt-1 leading-relaxed" style={{ color: '#6b6778' }}>
                          Tente selecionar outra data ou outro profissional.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex flex-wrap gap-3"
                      role="group"
                      aria-label="Horários disponíveis"
                    >
                      {horariosDisponiveis.map((horario) => {
                        const ativo = selectedTime === horario
                        return (
                          <button
                            key={horario}
                            type="button"
                            onClick={() => setSelectedTime(horario)}
                            className={[
                              'inline-flex items-center justify-center',
                              'rounded-[14px] transition-all duration-150',
                              'font-semibold tracking-tight',
                              ativo
                                ? 'bg-[#f8f4ff] text-[#6d5bd9] border-2 border-[#c8bfee]'
                                : 'bg-[#ece8f5] text-[#3a344a] border-2 border-transparent hover:bg-[#e4def0] active:scale-[0.97]',
                            ].join(' ')}
                            style={{
                              padding: '9px 16px',
                              fontSize: '17px',
                              minWidth: '78px',
                            }}
                          >
                            {horario}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </section>

            {confirmError && <ErrorMessage>{confirmError}</ErrorMessage>}
            {sucesso && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 flex items-start gap-3 text-sm">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900">Agendamento confirmado!</p>
                  <p className="text-emerald-800 mt-1">Redirecionando...</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {temBarbeariaEServico && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none pb-[92px]">
          <div className="max-w-md mx-auto px-5 pointer-events-auto">
            <button
              type="button"
              disabled={!podeConfirmar}
              onClick={handleConfirmar}
              className={[
                'w-full inline-flex items-center justify-center gap-2',
                'text-white font-extrabold tracking-tight transition-all duration-150',
                'shadow-[0_8px_20px_-6px_rgba(109,91,217,0.55)]',
                podeConfirmar
                  ? 'bg-[#6d5bd9] hover:bg-[#5d4bc9] active:scale-[0.992]'
                  : 'bg-[#b9b0d4] cursor-not-allowed shadow-none',
              ].join(' ')}
              style={{
                padding: '16px 20px',
                borderRadius: '999px',
                fontSize: '19px',
              }}
            >
              {confirmando ? (
                <>
                  <LoadingSpinner size="sm" tone="white" />
                  Confirmando...
                </>
              ) : sucesso ? (
                <>
                  <CheckCircle2 size={20} strokeWidth={2.4} />
                  Confirmado!
                </>
              ) : (
                'Confirmar Agendamento'
              )}
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
