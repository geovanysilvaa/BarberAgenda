import { supabase } from '../../../shared/database/supabase'
import { Servico } from '../../domain/entidades/Servico'
import { IServicoRepository } from '../../domain/interfaces/IServicoRepository'

function mapRowParaServico(row: any): Servico {
  return {
    id: row.id,
    barbershopId: row.barbershop_id,
    name: row.name,
    description: row.description,
    durationMinutes: row.duration_minutes,
    price: Number(row.price),
    imageUrl: row.image_url ?? row.avatar_url ?? null,
    avatarUrl: row.avatar_url ?? row.image_url ?? null,
    createdAt: row.created_at,
  }
}

export class SupabaseServicoRepository implements IServicoRepository {
  async criar(dados: Omit<Servico, 'id' | 'createdAt'>): Promise<Servico> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        barbershop_id: dados.barbershopId,
        name: dados.name,
        description: dados.description,
        duration_minutes: dados.durationMinutes,
        price: dados.price,
        avatar_url: dados.avatarUrl ?? dados.imageUrl ?? null,
      })
      .select('*')
      .single()

    if (error) throw new Error(`Erro ao criar serviço: ${error.message}`)
    return mapRowParaServico(data)
  }

  async listarPorBarbershopId(barbershopId: string): Promise<Servico[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Erro ao listar serviços: ${error.message}`)
    return (data ?? []).map(mapRowParaServico)
  }

  async buscarPorId(id: string, barbershopId: string): Promise<Servico | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('barbershop_id', barbershopId)
      .maybeSingle()

    if (error) throw new Error(`Erro ao buscar serviço por id: ${error.message}`)
    return data ? mapRowParaServico(data) : null
  }

  async atualizar(id: string, barbershopId: string, dados: Partial<Omit<Servico, 'id' | 'createdAt'>>): Promise<Servico> {
    const updateData: any = {}
    if (dados.name) updateData.name = dados.name
    if (dados.description !== undefined) updateData.description = dados.description
    if (dados.durationMinutes) updateData.duration_minutes = dados.durationMinutes
    if (dados.price) updateData.price = dados.price
    if (dados.imageUrl !== undefined || dados.avatarUrl !== undefined) {
      updateData.avatar_url = dados.avatarUrl ?? dados.imageUrl ?? null
    }

    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .eq('barbershop_id', barbershopId)
      .select('*')
      .single()

    if (error) throw new Error(`Erro ao atualizar serviço: ${error.message}`)
    return mapRowParaServico(data)
  }
}
