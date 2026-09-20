import { Servico } from '../entidades/Servico'

export interface IServicoRepository {
  criar(data: Omit<Servico, 'id' | 'createdAt'>): Promise<Servico>
  listarPorBarbershopId(barbershopId: string): Promise<Servico[]>
  buscarPorId(id: string, barbershopId: string): Promise<Servico | null>
  /** Busca em lote por vários ids — evita problema N+1 em listas. */
  buscarPorIds(ids: string[]): Promise<Servico[]>
  atualizar(id: string, barbershopId: string, dados: Partial<Omit<Servico, 'id' | 'createdAt'>>): Promise<Servico>
}
