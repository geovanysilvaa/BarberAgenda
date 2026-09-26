import crypto from 'crypto'
import { IUsuarioRepository } from '../domain/interfaces/IUsuarioRepository'
import { IPasswordResetTokenRepository } from '../domain/interfaces/IPasswordResetTokenRepository'
import { ISolicitarRecuperacaoSenhaUseCase } from '../domain/interfaces/ISolicitarRecuperacaoSenhaUseCase'
import { IEmailService } from '../../shared/interfaces/IEmailService'
import { EsqueciSenhaDTO } from '../adapters/dtos/UsuarioDTO'

const TOKEN_EXPIRACAO_MINUTOS = 30
const MENSAGEM_GENERICA = 'Se este e-mail estiver cadastrado, enviamos um link de recuperação.'

/**
 * RF030 (etapa 1) — Solicitação de recuperação de senha.
 *
 * Regra anti-enumeration: a resposta é SEMPRE a mesma, exista ou não o
 * e-mail na base — do contrário daria pra descobrir quais e-mails estão
 * cadastrados só testando esse endpoint (mesmo princípio do login).
 */
export class SolicitarRecuperacaoSenhaUseCase implements ISolicitarRecuperacaoSenhaUseCase {
  constructor(
    private readonly usuarioRepository: IUsuarioRepository,
    private readonly tokenRepository: IPasswordResetTokenRepository,
    private readonly emailService: IEmailService,
    private readonly frontendUrl: string
  ) {}

  async executar(dados: EsqueciSenhaDTO): Promise<{ message: string }> {
    const email = dados.email.trim().toLowerCase()
    const usuario = await this.usuarioRepository.buscarPorEmail(email)

    if (usuario) {
      // Invalida qualquer token anterior ainda ativo — só o mais recente vale.
      await this.tokenRepository.invalidarTokensAtivos(usuario.id)

      const tokenBruto = crypto.randomBytes(32).toString('hex')
      const tokenHash = crypto.createHash('sha256').update(tokenBruto).digest('hex')
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRACAO_MINUTOS * 60 * 1000).toISOString()

      await this.tokenRepository.criar({
        userId: usuario.id,
        token: tokenHash,
        expiresAt,
      })

      const linkRedefinicao = `${this.frontendUrl}/redefinir-senha?token=${tokenBruto}`

      // Se o e-mail falhar, não deixamos o erro vazar pro cliente (evita
      // confirmar/negar existência do usuário via mensagem de erro).
      try {
        await this.emailService.enviarEmailRecuperacaoSenha(usuario.email, linkRedefinicao)
      } catch (err) {
        console.error('Falha ao enviar e-mail de recuperação de senha:', err)
      }
    }

    return { message: MENSAGEM_GENERICA }
  }
}
