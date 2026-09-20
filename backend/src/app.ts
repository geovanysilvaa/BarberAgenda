import express, { Router } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { apiLimiter, authLimiter } from './shared/middlewares/rateLimiter'
import { errorHandler } from './shared/middlewares/errorHandler'
import { routerAuth, routerUsers } from './usuarios/adapters/routes/usuario.routes'
import { routerBarbershop } from './barbershops/adapters/routes/barbershop.routes'
import { routerProfissional } from './professionals/adapters/routes/professional.routes'
import { routerProfissionalMe } from './professionals/adapters/routes/professional-me.routes'
import { routerServico } from './services/adapters/routes/service.routes'
import { routerAgendamento } from './agendamentos/adapters/routes/agendamento.routes'
import { UsuarioController } from './usuarios/adapters/controllers/UsuarioController'
import { BarbeariaController } from './barbershops/adapters/controllers/BarbeariaController'
import { BusinessHoursController } from './barbershops/adapters/controllers/BusinessHoursController'
import { SupabaseBusinessHoursRepository } from './barbershops/infrastructure/repositories/SupabaseBusinessHoursRepository'
import { CriarHorarioFuncionamentoUseCase } from './barbershops/use-cases/CriarHorarioFuncionamentoUseCase'
import { ListarHorariosFuncionamentoUseCase } from './barbershops/use-cases/ListarHorariosFuncionamentoUseCase'
import { ProfissionalController } from './professionals/adapters/controllers/ProfissionalController'
import { ServicoController } from './services/adapters/controllers/ServicoController'
import { AgendamentoController } from './agendamentos/adapters/controllers/AgendamentoController'
import { HorariosDisponiveisController } from './agendamentos/adapters/controllers/HorariosDisponiveisController'
import { routerHorariosDisponiveis } from './agendamentos/adapters/routes/horarios-disponiveis.routes'
import { ListarHorariosDisponiveisUseCase } from './agendamentos/use-cases/ListarHorariosDisponiveisUseCase'
import { CadastrarUsuarioUseCase } from './usuarios/use-cases/CadastrarUsuarioUseCase'
import { SupabaseUsuarioRepository } from './usuarios/infrastructure/repositories/SupabaseUsuarioRepository'
import { AutenticarUsuarioUseCase } from './usuarios/use-cases/AutenticarUsuarioUseCase'
import { BuscarUsuarioUseCase } from './usuarios/use-cases/BuscarUsuarioUseCase'
import { EncerrarSessaoUseCase } from './usuarios/use-cases/EncerrarSessaoUseCase'
import { AtualizarUsuarioUseCase } from './usuarios/use-cases/AtualizarUsuarioUseCase'
import { RenovarTokenUseCase } from './usuarios/use-cases/RenovarTokenUseCase'
import { SolicitarRecuperacaoSenhaUseCase } from './usuarios/use-cases/SolicitarRecuperacaoSenhaUseCase'
import { RedefinirSenhaUseCase } from './usuarios/use-cases/RedefinirSenhaUseCase'
import { ExcluirContaUseCase } from './usuarios/use-cases/ExcluirContaUseCase'
import { SupabasePasswordResetTokenRepository } from './usuarios/infrastructure/repositories/SupabasePasswordResetTokenRepository'
import { NodemailerEmailService } from './shared/infrastructure/NodemailerEmailService'
import { EmailNotificationService } from './shared/infrastructure/EmailNotificationService'
import { SupabaseBarbeariaRepository } from './barbershops/infrastructure/repositories/SupabaseBarbeariaRepository'
import { CriarBarbeariaUseCase } from './barbershops/use-cases/CriarBarbeariaUseCase'
import { ListarBarbeariasUseCase } from './barbershops/use-cases/ListarBarbeariasUseCase'
import { BuscarBarbeariaPorIdUseCase } from './barbershops/use-cases/BuscarBarbeariaPorIdUseCase'
import { AtualizarBarbeariaUseCase } from './barbershops/use-cases/AtualizarBarbeariaUseCase'
import { SupabaseProfissionalRepository } from './professionals/infrastructure/repositories/SupabaseProfissionalRepository'
import { CadastrarProfissionalUseCase } from './professionals/use-cases/CadastrarProfissionalUseCase'
import { ListarProfissionaisUseCase } from './professionals/use-cases/ListarProfissionaisUseCase'
import { BuscarProfissionalUseCase } from './professionals/use-cases/BuscarProfissionalUseCase'
import { AtualizarProfissionalUseCase } from './professionals/use-cases/AtualizarProfissionalUseCase'
import { RemoverProfissionalUseCase } from './professionals/use-cases/RemoverProfissionalUseCase'
import { TornarSeProfissionalUseCase } from './professionals/use-cases/TornarSeProfissionalUseCase'
import { BuscarMeuProfissionalUseCase } from './professionals/use-cases/BuscarMeuProfissionalUseCase'
import { SupabaseServicoRepository } from './services/infrastructure/repositories/SupabaseServicoRepository'
import { CadastrarServicoUseCase } from './services/use-cases/CadastrarServicoUseCase'
import { AtualizarServicoUseCase } from './services/use-cases/AtualizarServicoUseCase'
import { ListarServicosUseCase } from './services/use-cases/ListarServicosUseCase'
import { ListarAgendaProfissionalUseCase } from './agendamentos/use-cases/ListarAgendaProfissionalUseCase'
import { ListarAgendamentosClienteUseCase } from './agendamentos/use-cases/ListarAgendamentosClienteUseCase'
import { CriarAgendamentoUseCase } from './agendamentos/use-cases/CriarAgendamentoUseCase'
import { CancelarAgendamentoUseCase } from './agendamentos/use-cases/CancelarAgendamentoUseCase'
import { ConcluirAgendamentoUseCase } from './agendamentos/use-cases/ConcluirAgendamentoUseCase'
import { ReagendarAgendamentoUseCase } from './agendamentos/use-cases/ReagendarAgendamentoUseCase'
import { SupabaseAgendamentoRepository } from './agendamentos/infrastructure/repositories/SupabaseAgendamentoRepository'
import { routerIndisponibilidade } from './unavailabilities/adapters/routes/unavailability.routes'
import { IndisponibilidadeController } from './unavailabilities/adapters/controllers/IndisponibilidadeController'
import { SupabaseIndisponibilidadeRepository } from './unavailabilities/infrastructure/repositories/SupabaseIndisponibilidadeRepository'
import { RegistrarIndisponibilidadeUseCase } from './unavailabilities/use-cases/RegistrarIndisponibilidadeUseCase'
import { RemoverIndisponibilidadeUseCase } from './unavailabilities/use-cases/RemoverIndisponibilidadeUseCase'
import { ListarIndisponibilidadesUseCase } from './unavailabilities/use-cases/ListarIndisponibilidadesUseCase'
import { VerificarBloqueioUseCase } from './unavailabilities/use-cases/VerificarBloqueioUseCase'
import { routerIndisponibilidadeRecorrente } from './unavailabilities/adapters/routes/recurring-unavailability.routes'
import { IndisponibilidadeRecorrenteController } from './unavailabilities/adapters/controllers/IndisponibilidadeRecorrenteController'
import { SupabaseIndisponibilidadeRecorrenteRepository } from './unavailabilities/infrastructure/repositories/SupabaseIndisponibilidadeRecorrenteRepository'
import { RegistrarIndisponibilidadeRecorrenteUseCase } from './unavailabilities/use-cases/RegistrarIndisponibilidadeRecorrenteUseCase'
import { RemoverIndisponibilidadeRecorrenteUseCase } from './unavailabilities/use-cases/RemoverIndisponibilidadeRecorrenteUseCase'
import { ListarIndisponibilidadesRecorrentesUseCase } from './unavailabilities/use-cases/ListarIndisponibilidadesRecorrentesUseCase'
import { routerStorage } from './shared/adapters/routes/storage.routes'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())
app.use(apiLimiter)

// Composição das dependências
const usuarioRepository = new SupabaseUsuarioRepository()
// Instanciados aqui (antes do uso "natural" mais abaixo) porque
// AutenticarUsuarioUseCase/BuscarUsuarioUseCase/RenovarTokenUseCase
// precisam deles para calcular os papéis (roles) do usuário — ver
// construirRolesUsuario.ts.
const barbeariaRepository = new SupabaseBarbeariaRepository()
const profissionalRepository = new SupabaseProfissionalRepository()

const cadastrarUsuarioUseCase = new CadastrarUsuarioUseCase(usuarioRepository)
const autenticarUsuarioUseCase = new AutenticarUsuarioUseCase(
  usuarioRepository,
  barbeariaRepository,
  profissionalRepository
)
const buscarUsuarioUseCase = new BuscarUsuarioUseCase(usuarioRepository, barbeariaRepository, profissionalRepository)
const encerrarSessaoUseCase = new EncerrarSessaoUseCase()
const atualizarUsuarioUseCase = new AtualizarUsuarioUseCase(usuarioRepository, barbeariaRepository, profissionalRepository)
const excluirContaUseCase = new ExcluirContaUseCase(usuarioRepository)
const renovarTokenUseCase = new RenovarTokenUseCase(usuarioRepository, barbeariaRepository, profissionalRepository)

// RF030 — Recuperação de senha
const passwordResetTokenRepository = new SupabasePasswordResetTokenRepository()
const emailService = new NodemailerEmailService()
// RF012/RF013 — Adapter de notificação (ADR-006); hoje só e-mail.
const notificationService = new EmailNotificationService()
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
const solicitarRecuperacaoSenhaUseCase = new SolicitarRecuperacaoSenhaUseCase(
  usuarioRepository,
  passwordResetTokenRepository,
  emailService,
  frontendUrl
)
const redefinirSenhaUseCase = new RedefinirSenhaUseCase(usuarioRepository, passwordResetTokenRepository)

const usuarioController = new UsuarioController(
  cadastrarUsuarioUseCase,
  autenticarUsuarioUseCase,
  buscarUsuarioUseCase,
  encerrarSessaoUseCase,
  atualizarUsuarioUseCase,
  solicitarRecuperacaoSenhaUseCase,
  redefinirSenhaUseCase,
  excluirContaUseCase,
  renovarTokenUseCase
)

const criarBarbeariaUseCase = new CriarBarbeariaUseCase(barbeariaRepository, usuarioRepository)
const listarBarbeariasUseCase = new ListarBarbeariasUseCase(barbeariaRepository)
const buscarBarbeariaPorIdUseCase = new BuscarBarbeariaPorIdUseCase(barbeariaRepository)
const atualizarBarbeariaUseCase = new AtualizarBarbeariaUseCase(barbeariaRepository)
const barbeariaController = new BarbeariaController(
  criarBarbeariaUseCase,
  listarBarbeariasUseCase,
  buscarBarbeariaPorIdUseCase,
  atualizarBarbeariaUseCase
)

const businessHoursRepository = new SupabaseBusinessHoursRepository()
const criarHorarioFuncionamentoUseCase = new CriarHorarioFuncionamentoUseCase(businessHoursRepository, barbeariaRepository)
const listarHorariosFuncionamentoUseCase = new ListarHorariosFuncionamentoUseCase(businessHoursRepository)
const businessHoursController = new BusinessHoursController(
  criarHorarioFuncionamentoUseCase,
  listarHorariosFuncionamentoUseCase
)

const cadastrarProfissionalUseCase = new CadastrarProfissionalUseCase(
  profissionalRepository,
  usuarioRepository,
  barbeariaRepository
)
const listarProfissionaisUseCase = new ListarProfissionaisUseCase(profissionalRepository, barbeariaRepository)
const buscarProfissionalUseCase = new BuscarProfissionalUseCase(profissionalRepository, barbeariaRepository)
const atualizarProfissionalUseCase = new AtualizarProfissionalUseCase(
  profissionalRepository,
  usuarioRepository,
  barbeariaRepository
)
const removerProfissionalUseCase = new RemoverProfissionalUseCase(profissionalRepository, barbeariaRepository)
const tornarSeProfissionalUseCase = new TornarSeProfissionalUseCase(
  profissionalRepository,
  usuarioRepository,
  barbeariaRepository
)
const buscarMeuProfissionalUseCase = new BuscarMeuProfissionalUseCase(profissionalRepository)
const profissionalController = new ProfissionalController(
  cadastrarProfissionalUseCase,
  listarProfissionaisUseCase,
  buscarProfissionalUseCase,
  atualizarProfissionalUseCase,
  removerProfissionalUseCase,
  tornarSeProfissionalUseCase,
  buscarMeuProfissionalUseCase
)

const servicoRepository = new SupabaseServicoRepository()
const cadastrarServicoUseCase = new CadastrarServicoUseCase(servicoRepository, barbeariaRepository)
const atualizarServicoUseCase = new AtualizarServicoUseCase(servicoRepository, barbeariaRepository)
const listarServicosUseCase = new ListarServicosUseCase(servicoRepository, barbeariaRepository)
const servicoController = new ServicoController(
  cadastrarServicoUseCase,
  atualizarServicoUseCase,
  listarServicosUseCase
)


const indisponibilidadeRepository = new SupabaseIndisponibilidadeRepository()
const registrarIndisponibilidadeUseCase = new RegistrarIndisponibilidadeUseCase(
  indisponibilidadeRepository,
  profissionalRepository,
  barbeariaRepository,
  businessHoursRepository
)
const removerIndisponibilidadeUseCase = new RemoverIndisponibilidadeUseCase(
  indisponibilidadeRepository,
  profissionalRepository,
  barbeariaRepository
)
const listarIndisponibilidadesUseCase = new ListarIndisponibilidadesUseCase(indisponibilidadeRepository)
const indisponibilidadeController = new IndisponibilidadeController(
  registrarIndisponibilidadeUseCase,
  removerIndisponibilidadeUseCase,
  listarIndisponibilidadesUseCase
)

const indisponibilidadeRecorrenteRepository = new SupabaseIndisponibilidadeRecorrenteRepository()
const registrarIndisponibilidadeRecorrenteUseCase = new RegistrarIndisponibilidadeRecorrenteUseCase(
  indisponibilidadeRecorrenteRepository,
  profissionalRepository,
  barbeariaRepository,
  businessHoursRepository
)
const removerIndisponibilidadeRecorrenteUseCase = new RemoverIndisponibilidadeRecorrenteUseCase(
  indisponibilidadeRecorrenteRepository,
  profissionalRepository,
  barbeariaRepository
)
const listarIndisponibilidadesRecorrentesUseCase = new ListarIndisponibilidadesRecorrentesUseCase(
  indisponibilidadeRecorrenteRepository
)
const indisponibilidadeRecorrenteController = new IndisponibilidadeRecorrenteController(
  registrarIndisponibilidadeRecorrenteUseCase,
  removerIndisponibilidadeRecorrenteUseCase,
  listarIndisponibilidadesRecorrentesUseCase
)

const verificarBloqueioUseCase = new VerificarBloqueioUseCase(
  indisponibilidadeRepository,
  indisponibilidadeRecorrenteRepository
)

const agendamentoRepository = new SupabaseAgendamentoRepository()
const listarAgendaProfissionalUseCase = new ListarAgendaProfissionalUseCase(agendamentoRepository)
const listarAgendamentosClienteUseCase = new ListarAgendamentosClienteUseCase(
  agendamentoRepository,
  profissionalRepository,
  servicoRepository,
  usuarioRepository
)
const criarAgendamentoUseCase = new CriarAgendamentoUseCase(
  agendamentoRepository,
  profissionalRepository,
  servicoRepository,
  usuarioRepository,
  businessHoursRepository,
  verificarBloqueioUseCase,
  notificationService
)
const cancelarAgendamentoUseCase = new CancelarAgendamentoUseCase(
  agendamentoRepository,
  profissionalRepository,
  barbeariaRepository,
  usuarioRepository,
  servicoRepository,
  notificationService
)
const concluirAgendamentoUseCase = new ConcluirAgendamentoUseCase(
  agendamentoRepository,
  profissionalRepository,
  barbeariaRepository
)
const reagendarAgendamentoUseCase = new ReagendarAgendamentoUseCase(
  agendamentoRepository,
  profissionalRepository,
  servicoRepository,
  usuarioRepository,
  businessHoursRepository,
  verificarBloqueioUseCase
)
const agendamentoController = new AgendamentoController(
  listarAgendaProfissionalUseCase,
  listarAgendamentosClienteUseCase,
  profissionalRepository,
  criarAgendamentoUseCase,
  cancelarAgendamentoUseCase,
  concluirAgendamentoUseCase,
  reagendarAgendamentoUseCase
)

const listarHorariosDisponiveisUseCase = new ListarHorariosDisponiveisUseCase(
  profissionalRepository,
  servicoRepository,
  businessHoursRepository,
  agendamentoRepository,
  indisponibilidadeRepository,
  indisponibilidadeRecorrenteRepository
)
const horariosDisponiveisController = new HorariosDisponiveisController(listarHorariosDisponiveisUseCase)

// Rotas — versionadas sob /api/v1 (endpoints.md)
const apiV1 = Router()
apiV1.use('/auth', authLimiter, routerAuth(usuarioController))
apiV1.use('/users', routerUsers(usuarioController))
apiV1.use('/barbershops', routerBarbershop(barbeariaController, businessHoursController))
apiV1.use('/barbershops/:barbershopId/professionals', routerProfissional(profissionalController))
apiV1.use('/professionals', routerProfissionalMe(profissionalController))
apiV1.use('/barbershops/:barbershopId/services', routerServico(servicoController))
apiV1.use('/agendamentos', routerAgendamento(agendamentoController))
// /appointments é o nome documentado em endpoints.md — mantido como alias
// do /agendamentos já usado pelo RF021, mesmo padrão do /redefinir-senha
// vs /reset-password no frontend.
apiV1.use('/appointments', routerAgendamento(agendamentoController))
apiV1.use(
  '/barbershops/:barbershopId/professionals/:professionalId/unavailability',
  routerIndisponibilidade(indisponibilidadeController)
)
apiV1.use(
  '/barbershops/:barbershopId/professionals/:professionalId/recurring-unavailability',
  routerIndisponibilidadeRecorrente(indisponibilidadeRecorrenteController)
)
apiV1.use(
  '/barbershops/:barbershopId/professionals/:professionalId/available-slots',
  routerHorariosDisponiveis(horariosDisponiveisController)
)
apiV1.use('/storage', routerStorage())

app.use('/api/v1', apiV1)

// Fallback 404 em JSON (evita que o Express retorne HTML default)
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Rota ${req.method} ${req.originalUrl} não encontrada.`,
  })
})

app.use(errorHandler)

export default app
