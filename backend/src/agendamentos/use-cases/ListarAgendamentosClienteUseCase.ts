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
    
    const agendamentosFormatados = await Promise.all(
        agendamentos.map(async (agendamento) => {
            const profissional = await this.profissionalRepository.buscarPorIdGlobal(agendamento.professionalId)
            const servico = await this.servicoRepository.buscarPorId(agendamento.serviceId, agendamento.barbershopId)
            const usuarioProfissional = profissional ? await this.usuarioRepository.buscarPorId(profissional.userId) : null

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
    )

    return agendamentosFormatados
  }
}
