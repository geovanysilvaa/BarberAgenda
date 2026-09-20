import { IBarbeariaRepository } from '../domain/interfaces/IBarbeariaRepository'
import { IAtualizarBarbeariaUseCase } from '../domain/interfaces/IAtualizarBarbeariaUseCase'
import { AtualizarBarbeariaDTO } from '../adapters/dtos/BarbeariaDTO'
import { Barbearia } from '../domain/entidades/Barbearia'
import { AppError } from '../../shared/errors/AppError'

/**
 * RF033 — Atualização de dados da barbearia.
 * Apenas o owner que criou a barbearia pode editá-la (endpoints.md).
 */
export class AtualizarBarbeariaUseCase implements IAtualizarBarbeariaUseCase {
  constructor(private readonly barbeariaRepository: IBarbeariaRepository) {}

  async executar(id: string, ownerId: string, dados: AtualizarBarbeariaDTO): Promise<Barbearia> {
    const barbearia = await this.barbeariaRepository.buscarPorId(id)

    if (!barbearia) {
      throw new AppError('Barbearia não encontrada.', 404, 'BARBERSHOP_NOT_FOUND')
    }

    if (barbearia.ownerId !== ownerId) {
      throw new AppError('Você não tem permissão para acessar este recurso.', 403, 'FORBIDDEN')
    }

    const payload: Partial<Pick<Barbearia, 'name' | 'address' | 'phone' | 'avatarUrl'>> = {}

    if (dados.name !== undefined) payload.name = dados.name
    if (dados.address !== undefined) payload.address = dados.address
    if (dados.phone !== undefined) payload.phone = dados.phone
    if (dados.avatarUrl !== undefined) payload.avatarUrl = dados.avatarUrl

    if (Object.keys(payload).length === 0) {
      return barbearia
    }

    return this.barbeariaRepository.atualizar(id, payload)
  }
}
