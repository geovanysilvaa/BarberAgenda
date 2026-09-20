import { IBarbeariaRepository } from '../domain/interfaces/IBarbeariaRepository'
import { ICriarBarbeariaUseCase } from '../domain/interfaces/ICriarBarbeariaUseCase'
import { CriarBarbeariaDTO, BarbeariaResponseDTO } from '../adapters/dtos/BarbeariaDTO'
import { IUsuarioRepository } from '../../usuarios/domain/interfaces/IUsuarioRepository'

/**
 * RF031 — Criação de barbearia.
 * Um owner pode ter mais de uma barbearia (barbershops.md) — diferente
 * do profissional, que pertence a uma única barbearia no MVP. Por isso
 * não há checagem de "já possui barbearia" aqui.
 */
export class CriarBarbeariaUseCase implements ICriarBarbeariaUseCase {
  constructor(
    private readonly barbeariaRepository: IBarbeariaRepository,
    private readonly usuarioRepository: IUsuarioRepository
  ) {}

  async executar(dados: CriarBarbeariaDTO): Promise<BarbeariaResponseDTO> {
    const barbeariaCriada = await this.barbeariaRepository.criar({
      name: dados.name,
      address: dados.address,
      phone: dados.phone,
      ownerId: dados.ownerId,
      avatarUrl: dados.avatarUrl ?? null,
    })

    // RF031: Promove usuário a owner
    await this.usuarioRepository.atualizar(dados.ownerId, { role: 'owner' })

    return barbeariaCriada
  }
}
