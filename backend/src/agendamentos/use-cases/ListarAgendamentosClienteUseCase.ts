import { IAgendamentoRepository } from '../domain/interfaces/IAgendamentoRepository'
import { IProfissionalRepository } from '../../professionals/domain/interfaces/IProfissionalRepository'
import { IServicoRepository } from '../../services/domain/interfaces/IServicoRepository'
import { IUsuarioRepository } from '../../usuarios/domain/interfaces/IUsuarioRepository'
import { AgendamentoResponseDTO } from '../adapters/dtos/AgendamentoDTO'

export class ListarAgendamentosClienteUseCase {
  constructor(
    private readonly agendamentoRepository: IAgendamentoRepository,
    private readonly profissionalRepository: IProfissionalRepository,
    private readonly servicoRepository: IServicoRepository,
    private readonly usuarioRepository: IUsuarioRepository
  ) {}

  async executar(clientId: string): Promise<AgendamentoResponseDTO[]> {
    const agendamentos = await this.agendamentoRepository.listarPorCliente(clientId)

    // Resolve N+1: faz 3 buscas em LOTE (profissionais, serviços, usuários)
    // em vez de 3 queries POR agendamento. Ganho: O(3 + N) → O(3) queries.
    const profissionalIds = [...new Set(agendamentos.map((a) => a.professionalId))]
    const serviceIds = [...new Set(agendamentos.map((a) => a.serviceId))]

    const [todosProfissionais, todosServicos] = await Promise.all([
      this.profissionalRepository.buscarPorIdsGlobal(profissionalIds),
      this.servicoRepository.buscarPorIds(serviceIds),
    ])

    // Busca os usuários (nomes dos profissionais) por userId em lote também.
    const usuarioIds = [...new Set(todosProfissionais.map((p) => p.userId).filter(Boolean) as string[])]
    const todosUsuarios = await this.usuarioRepository.buscarPorIds(usuarioIds)

    // Maps para lookup O(1) ao formatar a lista.
    const profissionalPorId = new Map(todosProfissionais.map((p) => [p.id, p]))
    const servicoPorId = new Map(todosServicos.map((s) => [s.id, s]))
    const usuarioPorId = new Map(todosUsuarios.map((u) => [u.id, u]))

    return agendamentos.map((agendamento) => {
      const profissional = profissionalPorId.get(agendamento.professionalId)
      const servico = servicoPorId.get(agendamento.serviceId)
      const usuarioProfissional = profissional ? usuarioPorId.get(profissional.userId) : undefined

      return {
        id: agendamento.id,
        status: agendamento.status,
        professional: { id: profissional?.id ?? '', name: usuarioProfissional?.name ?? '' },
        service: { id: servico?.id ?? '', name: servico?.name ?? '', duration: servico?.durationMinutes ?? 0 },
        date: agendamento.date,
        startTime: agendamento.startTime.slice(0, 5),
        endTime: agendamento.endTime.slice(0, 5),
        createdAt: agendamento.createdAt,
      }
    })
  }
}
