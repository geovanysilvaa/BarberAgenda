import { Profissional, ProfissionalPublico } from '../entidades/Profissional'

export interface IProfissionalRepository {
  criar(data: Omit<Profissional, 'id' | 'createdAt'>): Promise<Profissional>
  listarPorBarbershopId(barbershopId: string): Promise<ProfissionalPublico[]>
  buscarPorId(id: string, barbershopId: string): Promise<ProfissionalPublico | null>
  buscarPorUserId(userId: string): Promise<Profissional | null>
  buscarCompletoPorId(id: string, barbershopId: string): Promise<Profissional | null>
  buscarPorIdGlobal(id: string): Promise<Profissional | null>
  /** Busca em lote por vários ids — evita problema N+1 em listas. */
  buscarPorIdsGlobal(ids: string[]): Promise<Profissional[]>
  atualizar(id: string, dados: Partial<Pick<Profissional, 'specialty'>>): Promise<Profissional>
  remover(id: string): Promise<void>
}
