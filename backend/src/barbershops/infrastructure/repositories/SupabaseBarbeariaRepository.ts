import { supabase } from '../../../shared/database/supabase'
import { Barbearia } from '../../domain/entidades/Barbearia'
import { IBarbeariaRepository } from '../../domain/interfaces/IBarbeariaRepository'

function mapRowParaBarbearia(row: any): Barbearia {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    ownerId: row.owner_id,
    avatarUrl: row.avatar_url ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class SupabaseBarbeariaRepository implements IBarbeariaRepository {
  async criar(dados: Omit<Barbearia, 'id' | 'createdAt' | 'updatedAt'>): Promise<Barbearia> {
    const { data, error } = await supabase
      .from('barbershops')
      .insert({
        name: dados.name,
        address: dados.address,
        phone: dados.phone,
        owner_id: dados.ownerId,
        avatar_url: dados.avatarUrl ?? null,
      })
      .select('*')
      .single()

    if (error) throw new Error(`Erro ao criar barbearia: ${error.message}`)
    return mapRowParaBarbearia(data)
  }

  async buscarPorOwnerId(ownerId: string): Promise<Barbearia | null> {
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle()

    if (error) throw new Error(`Erro ao buscar barbearia por ownerId: ${error.message}`)
    return data ? mapRowParaBarbearia(data) : null
  }

  async existePorOwnerId(ownerId: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('barbershops')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', ownerId)

    if (error) throw new Error(`Erro ao checar barbearias do owner: ${error.message}`)
    return (count ?? 0) > 0
  }

  async listar(): Promise<Barbearia[]> {
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Erro ao listar barbearias: ${error.message}`)
    return (data ?? []).map(mapRowParaBarbearia)
  }

  async buscarPorId(id: string): Promise<Barbearia | null> {
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`Erro ao buscar barbearia por id: ${error.message}`)
    return data ? mapRowParaBarbearia(data) : null
  }

  async atualizar(
    id: string,
    dados: Partial<Pick<Barbearia, 'name' | 'address' | 'phone' | 'avatarUrl'>>
  ): Promise<Barbearia> {
    const payload: Record<string, any> = { updated_at: new Date().toISOString() }
    if (dados.name !== undefined) payload.name = dados.name
    if (dados.address !== undefined) payload.address = dados.address
    if (dados.phone !== undefined) payload.phone = dados.phone
    if (dados.avatarUrl !== undefined) payload.avatar_url = dados.avatarUrl

    const { data, error } = await supabase
      .from('barbershops')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(`Erro ao atualizar barbearia: ${error.message}`)
    return mapRowParaBarbearia(data)
  }
}
