import { supabase } from '../../../shared/database/supabase'
import { Profissional, ProfissionalPublico } from '../../domain/entidades/Profissional'
import { IProfissionalRepository } from '../../domain/interfaces/IProfissionalRepository'

function mapRowParaProfissional(row: any): Profissional {
  return {
    id: row.id,
    userId: row.user_id,
    barbershopId: row.barbershop_id,
    specialty: row.specialty,
    avatarUrl: row.avatar_url ?? null,
    createdAt: row.created_at,
  }
}

function mapRowParaProfissionalPublico(row: any): ProfissionalPublico {
  const usuario = Array.isArray(row.users) ? row.users[0] : row.users

  return {
    id: row.id,
    barbershopId: row.barbershop_id,
    specialty: row.specialty,
    avatarUrl: row.avatar_url ?? usuario?.avatar_url ?? null,
    createdAt: row.created_at,
    name: usuario?.name ?? '',
  }
}

export class SupabaseProfissionalRepository implements IProfissionalRepository {
  async criar(dados: Omit<Profissional, 'id' | 'createdAt'>): Promise<Profissional> {
    const { data, error } = await supabase
      .from('professionals')
      .insert({
        user_id: dados.userId,
        barbershop_id: dados.barbershopId,
        specialty: dados.specialty,
        avatar_url: dados.avatarUrl ?? null,
      })
      .select('*')
      .single()

    if (error) throw new Error(`Erro ao criar profissional: ${error.message}`)
    return mapRowParaProfissional(data)
  }

  async listarPorBarbershopId(barbershopId: string): Promise<ProfissionalPublico[]> {
    const { data, error } = await supabase
      .from('professionals')
      .select('id, barbershop_id, specialty, created_at, avatar_url, users(name, avatar_url)')
      .eq('barbershop_id', barbershopId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Erro ao listar profissionais: ${error.message}`)
    return (data ?? []).map(mapRowParaProfissionalPublico)
  }

  async buscarPorId(id: string, barbershopId: string): Promise<ProfissionalPublico | null> {
    const { data, error } = await supabase
      .from('professionals')
      .select('id, barbershop_id, specialty, created_at, avatar_url, users(name, avatar_url)')
      .eq('id', id)
      .eq('barbershop_id', barbershopId)
      .maybeSingle()

    if (error) throw new Error(`Erro ao buscar profissional por id: ${error.message}`)
    return data ? mapRowParaProfissionalPublico(data) : null
  }

  async buscarPorUserId(userId: string): Promise<Profissional | null> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw new Error(`Erro ao buscar profissional por userId: ${error.message}`)
    return data ? mapRowParaProfissional(data) : null
  }

  async buscarCompletoPorId(id: string, barbershopId: string): Promise<Profissional | null> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .eq('barbershop_id', barbershopId)
      .maybeSingle()

    if (error) throw new Error(`Erro ao buscar profissional completo por id: ${error.message}`)
    return data ? mapRowParaProfissional(data) : null
  }

  async buscarPorIdGlobal(id: string): Promise<Profissional | null> {
    const { data, error } = await supabase.from('professionals').select('*').eq('id', id).maybeSingle()

    if (error) throw new Error(`Erro ao buscar profissional por id: ${error.message}`)
    return data ? mapRowParaProfissional(data) : null
  }

  async buscarPorIdsGlobal(ids: string[]): Promise<Profissional[]> {
    if (ids.length === 0) return []

    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .in('id', [...new Set(ids)])

    if (error) throw new Error(`Erro ao buscar profissionais por ids: ${error.message}`)
    return (data ?? []).map(mapRowParaProfissional)
  }

  async atualizar(id: string, dados: Partial<Pick<Profissional, 'specialty' | 'avatarUrl'>>): Promise<Profissional> {
    const payload: Record<string, any> = {}
    if (dados.specialty !== undefined) payload.specialty = dados.specialty
    if (dados.avatarUrl !== undefined) payload.avatar_url = dados.avatarUrl

    const { data, error } = await supabase
      .from('professionals')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(`Erro ao atualizar profissional: ${error.message}`)
    return mapRowParaProfissional(data)
  }

  async remover(id: string): Promise<void> {
    const { error } = await supabase.from('professionals').delete().eq('id', id)

    if (error) throw new Error(`Erro ao remover profissional: ${error.message}`)
  }
}
