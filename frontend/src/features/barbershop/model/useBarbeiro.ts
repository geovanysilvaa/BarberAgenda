import { useCallback, useState } from 'react'
import { api, ApiError } from '../../../shared/lib/api'
import type { Barbershop, BusinessHours } from '../../../entities/barbershop/types'
import type { Professional } from '../../../entities/professional/types'
import type { Service } from '../../../entities/service/types'

/**
 * Busca e gerencia dados de barbearias, profissionais e serviços
 * (custom-hooks.md) — usado nas páginas /barbershops e /barbershops/:id.
 */
export function useBarbeiro() {
  const [barbearias, setBarbearias] = useState<Barbershop[]>([])
  const [barbearia, setBarbearia] = useState<Barbershop | null>(null)
  const [profissionais, setProfissionais] = useState<Professional[]>([])
  const [servicos, setServicos] = useState<Service[]>([])
  const [horarios, setHorarios] = useState<BusinessHours[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const listarBarbearias = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Barbershop[]>('/barbershops')
      setBarbearias(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar barbearias.')
    } finally {
      setLoading(false)
    }
  }, [])

  const buscarBarbearia = useCallback(async (barbershopId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Barbershop>(`/barbershops/${barbershopId}`)
      setBarbearia(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar barbearia.')
    } finally {
      setLoading(false)
    }
  }, [])

  const listarProfissionais = useCallback(async (barbershopId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Professional[]>(`/barbershops/${barbershopId}/professionals`)
      setProfissionais(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar profissionais.')
    } finally {
      setLoading(false)
    }
  }, [])

  const listarServicos = useCallback(async (barbershopId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Service[]>(`/barbershops/${barbershopId}/services`)
      setServicos(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar serviços.')
    } finally {
      setLoading(false)
    }
  }, [])

  const listarHorarios = useCallback(async (barbershopId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<BusinessHours[]>(`/barbershops/${barbershopId}/hours`)
      setHorarios(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao buscar horário de funcionamento.')
    } finally {
      setLoading(false)
    }
  }, [])

  const salvarHorario = useCallback(
    async (barbershopId: string, dados: { dayOfWeek: number; openTime: string; closeTime: string }) => {
      return api.post<BusinessHours>(`/barbershops/${barbershopId}/hours`, { barbershopId, ...dados })
    },
    []
  )

  const criarBarbearia = useCallback(
    async (dados: {
      name: string
      address: string
      phone: string
      avatarUrl?: string | null
    }) => {
      return api.post<Barbershop>('/barbershops', dados)
    },
    []
  )

  const atualizarBarbearia = useCallback(
    async (
      barbershopId: string,
      dados: Partial<{ name: string; address: string; phone: string; avatarUrl: string | null }>
    ) => {
      const atualizada = await api.patch<Barbershop>(`/barbershops/${barbershopId}`, dados)
      setBarbearia(atualizada)
      return atualizada
    },
    []
  )

  const criarProfissional = useCallback(
    async (
      barbershopId: string,
      dados: { name: string; email: string; phone: string; password: string; specialty?: string }
    ) => {
      return api.post(`/barbershops/${barbershopId}/professionals`, dados)
    },
    []
  )

  const atualizarProfissional = useCallback(
    async (barbershopId: string, professionalId: string, dados: { name?: string; specialty?: string }) => {
      return api.patch(`/barbershops/${barbershopId}/professionals/${professionalId}`, dados)
    },
    []
  )

  const removerProfissional = useCallback(async (barbershopId: string, professionalId: string) => {
    await api.delete(`/barbershops/${barbershopId}/professionals/${professionalId}`)
  }, [])

  const tornarSeProfissional = useCallback(async (barbershopId: string, dados: { specialty?: string }) => {
    return api.post(`/barbershops/${barbershopId}/professionals/me`, dados)
  }, [])

  const criarServico = useCallback(
    async (
      barbershopId: string,
      dados: {
        name: string
        description?: string
        durationMinutes: number
        price: number
        imageUrl?: string | null
      }
    ) => {
      return api.post(`/barbershops/${barbershopId}/services`, dados)
    },
    []
  )

  const atualizarServico = useCallback(
    async (
      barbershopId: string,
      serviceId: string,
      dados: Partial<{
        name: string
        description?: string
        durationMinutes: number
        price: number
        imageUrl: string | null
      }>
    ) => {
      return api.patch(`/barbershops/${barbershopId}/services/${serviceId}`, dados)
    },
    []
  )

  return {
    barbearias,
    barbearia,
    profissionais,
    servicos,
    horarios,
    loading,
    error,
    listarBarbearias,
    buscarBarbearia,
    listarProfissionais,
    listarServicos,
    listarHorarios,
    salvarHorario,
    criarBarbearia,
    atualizarBarbearia,
    criarProfissional,
    atualizarProfissional,
    removerProfissional,
    tornarSeProfissional,
    criarServico,
    atualizarServico,
  }
}
