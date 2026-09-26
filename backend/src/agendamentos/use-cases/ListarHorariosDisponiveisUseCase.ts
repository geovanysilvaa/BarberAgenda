import { IAgendamentoRepository } from '../domain/interfaces/IAgendamentoRepository'
import { IListarHorariosDisponiveisUseCase } from '../domain/interfaces/IListarHorariosDisponiveisUseCase'
import { IProfissionalRepository } from '../../professionals/domain/interfaces/IProfissionalRepository'
import { IServicoRepository } from '../../services/domain/interfaces/IServicoRepository'
import { IBusinessHoursRepository } from '../../barbershops/domain/interfaces/IBusinessHoursRepository'
import { IIndisponibilidadeRepository } from '../../unavailabilities/domain/interfaces/IIndisponibilidadeRepository'
import { IIndisponibilidadeRecorrenteRepository } from '../../unavailabilities/domain/interfaces/IIndisponibilidadeRecorrenteRepository'
import { AppError } from '../../shared/errors/AppError'
import { dataNoPassado, diaDaSemana, hhmmParaMinutos, minutosParaHHmm } from '../../shared/utils/dateUtils'

/**
 * RF022 — Cálculo de horários livres.
 *
 * Gera candidatos entre o horário de funcionamento do dia, em incrementos
 * da duração do serviço, descartando os que colidem com um agendamento
 * ativo ou com uma indisponibilidade do profissional — mesmas três regras
 * de disponibilidade já aplicadas em CriarAgendamentoUseCase (RF007), só
 * que aqui listando em vez de validar um único horário escolhido.
 */
export class ListarHorariosDisponiveisUseCase implements IListarHorariosDisponiveisUseCase {
  constructor(
    private readonly profissionalRepository: IProfissionalRepository,
    private readonly servicoRepository: IServicoRepository,
    private readonly businessHoursRepository: IBusinessHoursRepository,
    private readonly agendamentoRepository: IAgendamentoRepository,
    private readonly indisponibilidadeRepository: IIndisponibilidadeRepository,
    private readonly indisponibilidadeRecorrenteRepository: IIndisponibilidadeRecorrenteRepository
  ) {}

  async executar(barbershopId: string, professionalId: string, date: string, serviceId: string): Promise<string[]> {
    if (dataNoPassado(date)) {
      throw new AppError('Data ou horário inválido.', 400, 'INVALID_DATE')
    }

    const profissional = await this.profissionalRepository.buscarPorIdGlobal(professionalId)

    if (!profissional || profissional.barbershopId !== barbershopId) {
      throw new AppError('Profissional não encontrado.', 404, 'PROFESSIONAL_NOT_FOUND')
    }

    const servico = await this.servicoRepository.buscarPorId(serviceId, barbershopId)

    if (!servico) {
      throw new AppError('Serviço não encontrado.', 404, 'SERVICE_NOT_FOUND')
    }

    const horarios = await this.businessHoursRepository.listarPorBarbeariaId(barbershopId)
    const horarioDoDia = horarios.find((h) => h.dayOfWeek === diaDaSemana(date))

    if (!horarioDoDia) {
      return []
    }

    const abreMin = hhmmParaMinutos(horarioDoDia.openTime.slice(0, 5))
    const fechaMin = hhmmParaMinutos(horarioDoDia.closeTime.slice(0, 5))
    const duracao = servico.durationMinutes

    const agendamentosDoDia = await this.agendamentoRepository.listarPorProfissionalEData(professionalId, date)
    const indisponibilidades = await this.indisponibilidadeRepository.listarPorProfissional(professionalId)
    const todasRecorrentes = await this.indisponibilidadeRecorrenteRepository.listarPorProfissional(professionalId)
    const indisponibilidadesRecorrentesDoDia = todasRecorrentes.filter((i) => i.dayOfWeek === diaDaSemana(date))

    const hoje = !dataNoPassado(date) && date === new Date().toISOString().slice(0, 10)
    const agoraMin = new Date().getUTCHours() * 60 + new Date().getUTCMinutes()

    const slots: string[] = []

    for (let inicioMin = abreMin; inicioMin + duracao <= fechaMin; inicioMin += duracao) {
      if (hoje && inicioMin <= agoraMin) continue

      const fimMin = inicioMin + duracao
      const inicioStr = minutosParaHHmm(inicioMin)
      const fimStr = minutosParaHHmm(fimMin)

      const conflitaAgendamento = agendamentosDoDia.some(
        (a) => inicioStr < a.endTime.slice(0, 5) && fimStr > a.startTime.slice(0, 5)
      )
      if (conflitaAgendamento) continue

      const inicioISO = `${date}T${inicioStr}:00.000Z`
      const fimISO = `${date}T${fimStr}:00.000Z`
      const conflitaIndisponibilidade = indisponibilidades.some(
        (i) => new Date(i.startsAt) < new Date(fimISO) && new Date(i.endsAt) > new Date(inicioISO)
      )
      if (conflitaIndisponibilidade) continue

      const conflitaIndisponibilidadeRecorrente = indisponibilidadesRecorrentesDoDia.some(
        (i) => inicioStr < i.endTime.slice(0, 5) && fimStr > i.startTime.slice(0, 5)
      )
      if (conflitaIndisponibilidadeRecorrente) continue

      slots.push(inicioStr)
    }

    return slots
  }
}
