import { Usuario } from '../entidades/Usuario'

export interface IUsuarioRepository {
  criar(dados: Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>): Promise<Usuario>
  buscarPorId(id: string): Promise<Usuario | null>
  buscarPorEmail(email: string): Promise<Usuario | null>
  /** Busca em lote por vários ids — evita problema N+1 em listas. */
  buscarPorIds(ids: string[]): Promise<Usuario[]>
  atualizar(id: string, dados: Partial<Pick<Usuario, 'name' | 'phone' | 'passwordHash' | 'role'>>): Promise<Usuario>
  deletar(id: string): Promise<void>
}