// modules/usuarios/infrastructure/SupabaseUsuarioRepository.ts
import { supabase } from '../../../shared/database/supabase'
import { Usuario } from '../../domain/entidades/Usuario'
import { IUsuarioRepository } from '../../domain/interfaces/IUsuarioRepository'

function mapRowParaUsuario(row: any): Usuario {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class SupabaseUsuarioRepository implements IUsuarioRepository {
  async criar(dados: Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: dados.name,
        email: dados.email,
        phone: dados.phone,
        password_hash: dados.passwordHash,
        role: dados.role,
      })
      .select('*')
      .single()

    if (error) throw new Error(`Erro ao criar usuário: ${error.message}`)
    return mapRowParaUsuario(data)
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new Error(`Erro ao buscar usuário por id: ${error.message}`)
    return data ? mapRowParaUsuario(data) : null
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error) throw new Error(`Erro ao buscar usuário por e-mail: ${error.message}`)
    return data ? mapRowParaUsuario(data) : null
  }

  async atualizar(id: string, dados: Partial<Pick<Usuario, 'name' | 'phone' | 'passwordHash' | 'role'>>): Promise<Usuario> {
    const payload: Record<string, any> = { updated_at: new Date().toISOString() }
    if (dados.name !== undefined) payload.name = dados.name
    if (dados.phone !== undefined) payload.phone = dados.phone
    if (dados.passwordHash !== undefined) payload.password_hash = dados.passwordHash
    if (dados.role !== undefined) payload.role = dados.role

    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(`Erro ao atualizar usuário: ${error.message}`)
    return mapRowParaUsuario(data)
  }

  async deletar(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Erro ao deletar usuário: ${error.message}`)
  }
}