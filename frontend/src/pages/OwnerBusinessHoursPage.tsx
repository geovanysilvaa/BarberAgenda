import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  ShieldAlert,
  Check,
  Building2,
  Users,
  Scissors,
} from 'lucide-react'
import { useAuth } from '../features/auth/model/useAuth'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useActiveBarbershop } from '../features/barbershop/model/ActiveBarbershopContext'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { SuccessMessage } from '../shared/ui/SuccessMessage'
import { BottomNav } from '../shared/ui/BottomNav'
import { ApiError } from '../shared/lib/api'
import { AbaLink } from './OwnerBarbershopDetailPage'
import type { BusinessHours } from '../entities/barbershop/types'

// ========== Dias da semana em ordem exibida (seg -> dom) ==========
const DIAS_DA_SEMANA: {
  dayOfWeek: BusinessHours['dayOfWeek']
  label: string
}[] = [
  { dayOfWeek: 1, label: 'Segunda-feira' },
  { dayOfWeek: 2, label: 'Terça-feira' },
  { dayOfWeek: 3, label: 'Quarta-feira' },
  { dayOfWeek: 4, label: 'Quinta-feira' },
  { dayOfWeek: 5, label: 'Sexta-feira' },
  { dayOfWeek: 6, label: 'Sábado' },
  { dayOfWeek: 0, label: 'Domingo' },
]

interface DiaHorario {
  dayOfWeek: number
  label: string
  ativo: boolean
  openTime: string
  closeTime: string
}

const HORARIOS_PADRAO: Record<number, { openTime: string; closeTime: string }> = {
  1: { openTime: '09:00', closeTime: '19:00' },
  2: { openTime: '09:00', closeTime: '19:00' },
  3: { openTime: '09:00', closeTime: '19:00' },
  4: { openTime: '09:00', closeTime: '20:00' },
  5: { openTime: '09:00', closeTime: '20:00' },
  6: { openTime: '08:00', closeTime: '18:00' },
  0: { openTime: '', closeTime: '' },
}

export function OwnerBusinessHoursPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const barbershopId = id as string
  const { user } = useAuth()
  const {
    barbearia,
    horarios,
    loading,
    error,
    buscarBarbearia,
    listarHorarios,
    salvarHorario,
  } = useBarbeiro()
  const { selecionarBarbearia } = useActiveBarbershop()

  const [dias, setDias] = useState<DiaHorario[]>(() =>
    DIAS_DA_SEMANA.map((d) => {
      const padrao = HORARIOS_PADRAO[d.dayOfWeek]
      const temHorarioPadrao = !!padrao.openTime && !!padrao.closeTime
      return {
        dayOfWeek: d.dayOfWeek,
        label: d.label,
        ativo: temHorarioPadrao,
        openTime: padrao.openTime,
        closeTime: padrao.closeTime,
      }
    }),
  )
  const [salvandoTodos, setSalvandoTodos] = useState(false)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [erroRaiz, setErroRaiz] = useState<string | null>(null)

  useEffect(() => {
    if (barbershopId) {
      buscarBarbearia(barbershopId)
      listarHorarios(barbershopId)
      selecionarBarbearia(barbershopId)
    }
  }, [barbershopId, buscarBarbearia, listarHorarios, selecionarBarbearia])

  // Inicializa valores com os que vieram da API (sobrescreve defaults)
  useEffect(() => {
    if (!horarios.length) return
    const porDia: Record<number, { openTime: string; closeTime: string }> = {}
    for (const h of horarios) {
      porDia[h.dayOfWeek] = {
        openTime: h.openTime.slice(0, 5),
        closeTime: h.closeTime.slice(0, 5),
      }
    }
    setDias((atual) =>
      atual.map((d) => {
        const daApi = porDia[d.dayOfWeek]
        if (daApi) {
          return {
            ...d,
            ativo: true,
            openTime: daApi.openTime,
            closeTime: daApi.closeTime,
          }
        }
        return { ...d, ativo: !!d.openTime && !!d.closeTime }
      }),
    )
  }, [horarios])

  const ehDono = !!barbearia && !!user && barbearia.ownerId === user.id

  function toggleDia(idx: number) {
    setDias((atual) => {
      const copia = [...atual]
      const dia = { ...copia[idx] }
      dia.ativo = !dia.ativo
      if (dia.ativo && (!dia.openTime || !dia.closeTime)) {
        const padrao = HORARIOS_PADRAO[dia.dayOfWeek]
        if (padrao?.openTime && padrao?.closeTime) {
          dia.openTime = padrao.openTime
          dia.closeTime = padrao.closeTime
        } else {
          dia.openTime = '09:00'
          dia.closeTime = '18:00'
        }
      }
      copia[idx] = dia
      return copia
    })
  }

  function mudarHorario(
    idx: number,
    campo: 'openTime' | 'closeTime',
    valor: string,
  ) {
    setDias((atual) => {
      const copia = [...atual]
      copia[idx] = { ...copia[idx], [campo]: valor }
      return copia
    })
  }

  async function handleSalvarTodos() {
    setErroRaiz(null)
    setSucesso(null)
    setSalvandoTodos(true)
    try {
      const promises: Promise<unknown>[] = []
      for (const d of dias) {
        if (d.ativo && d.openTime && d.closeTime) {
          promises.push(
            salvarHorario(barbershopId, {
              dayOfWeek: d.dayOfWeek,
              openTime: d.openTime,
              closeTime: d.closeTime,
            }),
          )
        }
      }
      await Promise.all(promises)
      await listarHorarios(barbershopId)
      setSucesso('Horários de funcionamento salvos com sucesso!')
      setTimeout(() => setSucesso(null), 4500)
    } catch (err) {
      setErroRaiz(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível salvar os horários. Tente novamente.',
      )
    } finally {
      setSalvandoTodos(false)
    }
  }

  // ========== Render ==========

  if (loading && !barbearia) {
    return (
      <div className="min-h-screen bg-[#fef7ff] pb-40 md:pb-8">
        <div className="max-w-md mx-auto px-5 py-20 flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" tone="selected" />
          <p className="text-sm text-[#6b6478]">
            Carregando horários de funcionamento...
          </p>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fef7ff] pb-40 md:pb-8">
      <main className="max-w-md mx-auto px-5 pt-6 pb-4 flex flex-col gap-5 md:max-w-5xl md:px-6 md:pt-8">
        {/* ===================== HEADER INLINE ===================== */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#2b2238] hover:bg-[#efe8ff] transition-colors shrink-0"
            aria-label="Voltar"
          >
            <ArrowLeft size={26} strokeWidth={1.9} />
          </button>

          <h1
            className="flex-1 font-extrabold tracking-tight text-[#1a1722]"
            style={{ fontSize: '28px', letterSpacing: '-0.015em' }}
          >
            Horário de Funcionamento
          </h1>
        </div>

        {/* ===================== SUB-MENU HORIZONTAL (ABAS) ===================== */}
        {barbearia && ehDono && (
          <div
            className="flex items-center gap-2 overflow-x-auto -mx-5 px-5 pt-1"
            style={{ scrollbarWidth: 'none' }}
          >
            <AbaLink
              to={`/owner/barbershops/${id}`}
              atual={false}
              icon={<Building2 size={16} strokeWidth={2.1} />}
              label="Dados Gerais"
            />
            <AbaLink
              to={`/owner/barbershops/${id}/professionals`}
              atual={location.pathname.includes('/professionals')}
              icon={<Users size={16} strokeWidth={2.1} />}
              label="Profissionais"
            />
            <AbaLink
              to={`/owner/barbershops/${id}/services`}
              atual={location.pathname.includes('/services')}
              icon={<Scissors size={16} strokeWidth={2.1} />}
              label="Serviços"
            />
            <AbaLink
              to={`/owner/barbershops/${id}/hours`}
              atual
              icon={<Clock size={16} strokeWidth={2.1} />}
              label="Horários"
            />
          </div>
        )}

        {/* ERRO GERAL */}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {/* ACESSO NEGADO */}
        {barbearia && !ehDono && (
          <div className="bg-[#fde5e5]/50 border border-[#f3c9c9] rounded-[22px] p-6 flex items-start gap-4">
            <ShieldAlert size={24} className="text-[#c94e4e] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[17px] font-extrabold text-[#2b2238]">
                Acesso Restrito
              </h3>
              <p className="text-[14px] text-[#6b6478] leading-relaxed">
                Você não possui permissão para gerenciar os horários desta
                barbearia.
              </p>
            </div>
          </div>
        )}

        {/* ===================== LISTA DE DIAS ===================== */}
        {barbearia && ehDono && (
          <div className="flex flex-col gap-3">
            {dias.map((dia, idx) => (
              <div
                key={dia.dayOfWeek}
                className={[
                  'rounded-[18px] p-5 transition-all border',
                  dia.ativo
                    ? 'bg-white border-[#ebe7f5] shadow-[0_1px_2px_rgba(18,17,51,0.03),0_6px_20px_-12px_rgba(26,24,58,0.12)]'
                    : 'bg-[#e5e3eb]/50 border-[#e5e3eb] shadow-none',
                ].join(' ')}
              >
                {/* LINHA CIMA: NOME DO DIA + TOGGLE */}
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={[
                      'font-bold tracking-tight',
                      dia.ativo
                        ? 'text-[#2b2238]'
                        : 'text-[#8f889e]',
                    ].join(' ')}
                    style={{ fontSize: '20px', letterSpacing: '-0.005em' }}
                  >
                    {dia.label}
                  </span>

                  {/* TOGGLE SWITCH */}
                  <ToggleSwitch
                    checked={dia.ativo}
                    onChange={() => toggleDia(idx)}
                    disabled={salvandoTodos}
                  />
                </div>

                {/* CONTEÚDO ABAIXO: inputs OU "Fechado o dia todo" */}
                {dia.ativo ? (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <HorarioInput
                      label="Abertura"
                      value={dia.openTime}
                      onChange={(v) => mudarHorario(idx, 'openTime', v)}
                      disabled={salvandoTodos}
                    />
                    <HorarioInput
                      label="Fechamento"
                      value={dia.closeTime}
                      onChange={(v) => mudarHorario(idx, 'closeTime', v)}
                      disabled={salvandoTodos}
                    />
                  </div>
                ) : (
                  <p
                    className="mt-4 font-medium tracking-tight"
                    style={{ color: '#8f889e', fontSize: '16px' }}
                  >
                    Fechado o dia todo
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* FEEDBACKS */}
        {erroRaiz && <ErrorMessage>{erroRaiz}</ErrorMessage>}
        {sucesso && <SuccessMessage>{sucesso}</SuccessMessage>}

        {/* BOTÃO SALVAR HORÁRIOS (único, final) */}
        {barbearia && ehDono && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSalvarTodos}
              disabled={salvandoTodos}
              className={[
                'w-full inline-flex items-center justify-center gap-2',
                'text-white font-extrabold tracking-tight transition-all duration-150',
                'rounded-[999px]',
                salvandoTodos
                  ? 'bg-[#b9b0d4] cursor-wait shadow-none'
                  : 'bg-[#6d5bd9] hover:bg-[#5d4bc9] shadow-[0_10px_26px_-8px_rgba(109,91,217,0.55)] active:scale-[0.992]',
              ].join(' ')}
              style={{ padding: '17px 24px', fontSize: '18px' }}
            >
              {salvandoTodos ? (
                <>
                  <LoadingSpinner size="sm" tone="white" />
                  Salvando...
                </>
              ) : sucesso ? (
                <>
                  <Check size={20} strokeWidth={2.4} />
                  Salvo!
                </>
              ) : (
                'Salvar Horários'
              )}
            </button>
          </div>
        )}
      </main>

      {/* Bottom Nav (mobile) */}
      <BottomNav />
    </div>
  )
}

// ============================================================================
// Componentes auxiliares
// ============================================================================

interface ToggleSwitchProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}

function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={[
        'relative w-[58px] h-[32px] rounded-full shrink-0',
        'transition-all duration-150 ease-out',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#6d5bd9]/25',
        checked ? 'bg-[#6d5bd9]' : 'bg-[#9a93a9]',
        disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98] cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-1/2 -translate-y-1/2',
          'w-[24px] h-[24px] rounded-full bg-white shadow-[0_2px_6px_rgba(18,17,51,0.22)]',
          'transition-all duration-150 ease-out',
          checked
            ? 'left-[calc(100%-28px)]'
            : 'left-[4px]',
        ].join(' ')}
      />
      <span className="sr-only">{checked ? 'Aberto' : 'Fechado'}</span>
    </button>
  )
}

interface HorarioInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

function HorarioInput({ label, value, onChange, disabled }: HorarioInputProps) {
  return (
    <label className="block">
      <div
        className={[
          'relative flex items-center gap-2',
          'bg-white',
          'rounded-[14px] border-2 border-[#c2b8d6]',
          'transition-all duration-150',
          'focus-within:border-[#6d5bd9] focus-within:ring-4 focus-within:ring-[#6d5bd9]/15',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
        style={{ padding: '11px 14px' }}
      >
        <Clock size={18} strokeWidth={2} className="text-[#6d5bd9] shrink-0" />
        <span
          className="font-bold tracking-tight whitespace-nowrap"
          style={{ color: '#6b6478', fontSize: '16px' }}
        >
          {label}:
        </span>
        <input
          type="time"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={[
            'flex-1 min-w-0 bg-transparent outline-none',
            'font-bold tracking-tight text-[#2b2238]',
            disabled ? 'cursor-not-allowed' : '',
          ].join(' ')}
          style={{ fontSize: '18px' }}
        />
      </div>
    </label>
  )
}
