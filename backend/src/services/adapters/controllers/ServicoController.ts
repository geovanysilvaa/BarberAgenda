import { Request, Response, NextFunction } from 'express'
import { ICadastrarServicoUseCase } from '../../domain/interfaces/ICadastrarServicoUseCase'
import { IAtualizarServicoUseCase } from '../../domain/interfaces/IAtualizarServicoUseCase'
import { IListarServicosUseCase } from '../../domain/interfaces/IListarServicosUseCase'
import { AppError } from '../../../shared/errors/AppError'

export class ServicoController {
  constructor(
    private readonly cadastrarServicoUseCase: ICadastrarServicoUseCase,
    private readonly atualizarServicoUseCase: IAtualizarServicoUseCase,
    private readonly listarServicosUseCase: IListarServicosUseCase
  ) {}

  // RF014 — Cadastro de serviços da barbearia (owner)
  async cadastrar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new AppError('Usuário não autenticado.', 401, 'UNAUTHORIZED')
      }

      const { name, description, durationMinutes, price, imageUrl, avatarUrl } = req.body

      const servico = await this.cadastrarServicoUseCase.executar({
        name,
        description,
        durationMinutes,
        price,
        imageUrl,
        avatarUrl,
        barbershopId: req.params.barbershopId as string,
        ownerId: req.usuario.id,
      })

      res.status(201).json(servico)
    } catch (error) {
      next(error)
    }
  }

  // RF014 — Atualização de serviço (owner)
  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new AppError('Usuário não autenticado.', 401, 'UNAUTHORIZED')
      }

      const { name, description, durationMinutes, price, imageUrl, avatarUrl } = req.body

      const servico = await this.atualizarServicoUseCase.executar({
        name,
        description,
        durationMinutes,
        price,
        imageUrl,
        avatarUrl,
        barbershopId: req.params.barbershopId as string,
        serviceId: req.params.id as string,
        ownerId: req.usuario.id,
      })

      res.status(200).json(servico)
    } catch (error) {
      next(error)
    }
  }

  // RF015 — Seleção de serviço (listagem)
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const servicos = await this.listarServicosUseCase.executar(req.params.barbershopId as string)
      res.status(200).json(servicos)
    } catch (error) {
      next(error)
    }
  }
}
