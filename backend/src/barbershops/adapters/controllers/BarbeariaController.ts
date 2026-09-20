import { Request, Response, NextFunction } from 'express'
import { ICriarBarbeariaUseCase } from '../../domain/interfaces/ICriarBarbeariaUseCase'
import { IListarBarbeariasUseCase } from '../../domain/interfaces/IListarBarbeariasUseCase'
import { IBuscarBarbeariaPorIdUseCase } from '../../domain/interfaces/IBuscarBarbeariaPorIdUseCase'
import { IAtualizarBarbeariaUseCase } from '../../domain/interfaces/IAtualizarBarbeariaUseCase'
import { AppError } from '../../../shared/errors/AppError'

export class BarbeariaController {
  constructor(
    private readonly criarBarbeariaUseCase: ICriarBarbeariaUseCase,
    private readonly listarBarbeariasUseCase: IListarBarbeariasUseCase,
    private readonly buscarBarbeariaPorIdUseCase: IBuscarBarbeariaPorIdUseCase,
    private readonly atualizarBarbeariaUseCase: IAtualizarBarbeariaUseCase
  ) {}

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, address, phone, avatarUrl } = req.body

      if (!req.usuario) {
        throw new AppError('Usuário não autenticado.', 401, 'UNAUTHORIZED')
      }

      const ownerId = req.usuario.id

      const barbearia = await this.criarBarbeariaUseCase.executar({
        name,
        address,
        phone,
        ownerId,
        avatarUrl,
      })

      res.status(201).json(barbearia)
    } catch (error) {
      next(error)
    }
  }

  // RF032 — Listagem de barbearias
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barbearias = await this.listarBarbeariasUseCase.executar()
      res.status(200).json(barbearias)
    } catch (error) {
      next(error)
    }
  }

  // RF032 — Detalhes de uma barbearia
  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const barbearia = await this.buscarBarbeariaPorIdUseCase.executar(req.params.id as string)
      res.status(200).json(barbearia)
    } catch (error) {
      next(error)
    }
  }

  // RF033 — Atualização de dados da barbearia (owner)
  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new AppError('Usuário não autenticado.', 401, 'UNAUTHORIZED')
      }

      const barbearia = await this.atualizarBarbeariaUseCase.executar(
        req.params.id as string,
        req.usuario.id,
        req.body
      )

      res.status(200).json(barbearia)
    } catch (error) {
      next(error)
    }
  }
}
