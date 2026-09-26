import { IAgendamentoRepository } from '../domain/interfaces/IAgendamentoRepository'
import { ICancelarAgendamentoUseCase } from '../domain/interfaces/ICancelarAgendamentoUseCase'
import { AppError } from '../../shared/errors/AppError'
import { IProfissionalRepository } from '../../professionals/domain/interfaces/IProfissionalRepository'
import { IBarbeariaRepository } from '../../barbershops/domain/interfaces/IBarbeariaRepository'
import { IUsuarioRepository } from '../../usuarios/domain/interfaces/IUsuarioRepository'
import { IServicoRepository } from '../../services/domain/interfaces/IServicoRepository'
import { INotificationService } from '../../shared/interfaces/INotificationService'

/**
 * RF008 — Cancelamento de agendamento.
 * Quem pode cancelar: o cliente dono do agendamento, o profissional
 * vinculado a ele, ou o owner da barbearia — checado pela relação real
 * (userId do profissional / ownerId da barbearia), não pela claim
 * `role` do JWT (que é singular e não reflete multi-papel).
 */
export class CancelarAgendamentoUseCase implements ICancelarAgendamentoUseCase {
  constructor(
    private readonly agendamentoRepository: IAgendamentoRepository,
    private readonly profissionalRepository: IProfissionalRepository,
    private readonly barbeariaRepository: IBarbeariaRepository,
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly servicoRepository: IServicoRepository,
    private readonly notificationService: INotificationService
  ) {}

  async executar(agendamentoId: string, userId: string): Promise<void> {
    const agendamento = await this.agendamentoRepository.buscarPorId(agendamentoId)

    if (!agendamento) {
      throw new AppError('Agendamento não encontrado.', 404, 'APPOINTMENT_NOT_FOUND')
    }

    if (agendamento.status === 'cancelado') {
      throw new AppError('Agendamento já está cancelado.', 400, 'ALREADY_CANCELLED')
    }

    let autorizado = agendamento.clientId === userId

    if (!autorizado) {
      const profissional = await this.profissionalRepository.buscarPorIdGlobal(agendamento.professionalId)
      autorizado = profissional?.userId === userId
    }

    if (!autorizado) {
      const barbearia = await this.barbeariaRepository.buscarPorId(agendamento.barbershopId)
      autorizado = barbearia?.ownerId === userId
    }

    if (!autorizado) {
      throw new AppError('Não autorizado para cancelar este agendamento.', 403, 'UNAUTHORIZED')
    }

    await this.agendamentoRepository.atualizar(agendamentoId, {
      status: 'cancelado',
    })

    // RF013 — notifica o cliente por e-mail. Melhor esforço: falha no
    // envio não pode derrubar o cancelamento, que já foi persistido.
    try {
      const [cliente, profissional, servico] = await Promise.all([
        this.usuarioRepository.buscarPorId(agendamento.clientId),
        this.profissionalRepository.buscarPorIdGlobal(agendamento.professionalId),
        this.servicoRepository.buscarPorId(agendamento.serviceId, agendamento.barbershopId),
      ])

      if (cliente) {
        const usuarioProfissional = profissional
          ? await this.usuarioRepository.buscarPorId(profissional.userId)
          : null

        await this.notificationService.notificarAgendamentoCancelado({
          clienteEmail: cliente.email,
          clienteNome: cliente.name,
          profissionalNome: usuarioProfissional?.name ?? '',
          servicoNome: servico?.name ?? '',
          date: agendamento.date,
          startTime: agendamento.startTime.slice(0, 5),
        })
      }
    } catch (err) {
      console.error('Falha ao enviar notificação de cancelamento:', err)
    }
  }
}
