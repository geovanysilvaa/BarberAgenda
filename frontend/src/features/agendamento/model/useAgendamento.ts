import { useCallback, useRef, useState } from 'react'
import { api, ApiError } from '../../../shared/lib/api'
import type {
  Appointment,
  RawAppointment,
  Unavailability,
  RecurringUnavailability,
  MeuProfissional,
} from '../../../entities/appointment/types'

/**
 * Busca e gerencia agendamentos, horários disponíveis e indisponibilidades
 * (custom-hooks.md) — usado nas páginas /appointments/*, /professional/*.
 */
export function useAgendamento() {
  const [agendamentos, setAgendamentos] = useState<Appointment[]>([])
  const [agendaProfissional, setAgendaProfissional] = useState<RawAppointment[]>([])
  const [indisponibilidades, setIndisponibilidades] = useState<Unavailability[]>([])
  const [indisponibilidadesRecorrentes, setIndisponibilidadesRecorrentes] = useState<RecurringUnavailability[]>([])
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([])
  const [meuProfissional, setMeuProfissional] = useState<MeuProfissional | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Guarda a chave da última busca de horários pedida — evita que uma
  // resposta antiga (ex.: data trocada rápido) sobrescreva o resultado
  // mais recente se chegar depois dele.
  const ultimaBuscaSlotsRef = useRef<string | null>(null)

  const listarMeusAgendamentos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { agendamentos } = await api.get<{ agendamentos: Appointment[] }>('/appointments')
      setAgendamentos(agendamentos)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar agendamentos.')
    } finally {
      setLoading(false)
    }
  }, [])

  const listarAgendaProfissional = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { agendamentos } = await api.get<{ agendamentos: RawAppointment[] }>('/agendamentos/minha-agenda')
      setAgendaProfissional(agendamentos)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar agenda.')
    } finally {
      setLoading(false)
    }
  }, [])

  const buscarMeuProfissional = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<MeuProfissional>('/professionals/me')
      setMeuProfissional(data)
      return data
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.code === 'PROFESSIONAL_NOT_FOUND')) {
        setMeuProfissional(null)
        return null
      }
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar dados do profissional.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const buscarHorariosDisponiveis = useCallback(
    async (barbershopId: string, professionalId: string, date: string, serviceId: string) => {
      const chaveBusca = `${barbershopId}:${professionalId}:${date}:${serviceId}`
      ultimaBuscaSlotsRef.current = chaveBusca
      setLoading(true)
      setError(null)
      try {
        const { slots } = await api.get<{ slots: string[] }>(
          `/barbershops/${barbershopId}/professionals/${professionalId}/available-slots?date=${date}&serviceId=${serviceId}`
        )
        if (ultimaBuscaSlotsRef.current === chaveBusca) {
          setHorariosDisponiveis(slots)
        }
      } catch (err) {
        if (ultimaBuscaSlotsRef.current === chaveBusca) {
          setError(err instanceof ApiError ? err.message : 'Erro ao buscar horários disponíveis.')
        }
      } finally {
        if (ultimaBuscaSlotsRef.current === chaveBusca) {
          setLoading(false)
        }
      }
    },
    []
  )

  const listarIndisponibilidades = useCallback(async (barbershopId: string, professionalId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Unavailability[]>(
        `/barbershops/${barbershopId}/professionals/${professionalId}/unavailability`
      )
      setIndisponibilidades(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar indisponibilidades.')
    } finally {
      setLoading(false)
    }
  }, [])

  const criarAgendamento = useCallback(
    async (dados: { professionalId: string; serviceId: string; date: string; time: string }) => {
      return api.post<Appointment>('/appointments', dados)
    },
    []
  )

  const cancelarAgendamento = useCallback(async (id: string) => {
    await api.patch(`/appointments/${id}/cancelar`)
  }, [])

  const reagendarAgendamento = useCallback(async (id: string, dados: { date: string; time: string }) => {
    return api.patch<Appointment>(`/appointments/${id}/reschedule`, dados)
  }, [])

  const criarIndisponibilidade = useCallback(
    async (
      barbershopId: string,
      professionalId: string,
      dados: { startsAt: string; endsAt: string; reason?: string }
    ) => {
      return api.post<Unavailability>(`/barbershops/${barbershopId}/professionals/${professionalId}/unavailability`, dados)
    },
    []
  )

  const removerIndisponibilidade = useCallback(
    async (barbershopId: string, professionalId: string, unavailabilityId: string) => {
      await api.delete(`/barbershops/${barbershopId}/professionals/${professionalId}/unavailability/${unavailabilityId}`)
    },
    []
  )

  const listarIndisponibilidadesRecorrentes = useCallback(async (barbershopId: string, professionalId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<RecurringUnavailability[]>(
        `/barbershops/${barbershopId}/professionals/${professionalId}/recurring-unavailability`
      )
      setIndisponibilidadesRecorrentes(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar indisponibilidades recorrentes.')
    } finally {
      setLoading(false)
    }
  }, [])

  const criarIndisponibilidadeRecorrente = useCallback(
    async (
      barbershopId: string,
      professionalId: string,
      dados: { dayOfWeek: number; startTime: string; endTime: string; reason?: string }
    ) => {
      return api.post<RecurringUnavailability>(
        `/barbershops/${barbershopId}/professionals/${professionalId}/recurring-unavailability`,
        dados
      )
    },
    []
  )

  const removerIndisponibilidadeRecorrente = useCallback(
    async (barbershopId: string, professionalId: string, recurringUnavailabilityId: string) => {
      await api.delete(
        `/barbershops/${barbershopId}/professionals/${professionalId}/recurring-unavailability/${recurringUnavailabilityId}`
      )
    },
    []
  )

  return {
    agendamentos,
    agendaProfissional,
    indisponibilidades,
    indisponibilidadesRecorrentes,
    horariosDisponiveis,
    meuProfissional,
    loading,
    error,
    listarMeusAgendamentos,
    listarAgendaProfissional,
    buscarMeuProfissional,
    buscarHorariosDisponiveis,
    listarIndisponibilidades,
    criarAgendamento,
    cancelarAgendamento,
    reagendarAgendamento,
    criarIndisponibilidade,
    removerIndisponibilidade,
    listarIndisponibilidadesRecorrentes,
    criarIndisponibilidadeRecorrente,
    removerIndisponibilidadeRecorrente,
  }
}
