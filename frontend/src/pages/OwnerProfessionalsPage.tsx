import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Users,
  Scissors,
  Clock,
  Building2,
  ShieldAlert,
  UserPlus,
  UserCheck,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../features/auth/model/useAuth'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useActiveBarbershop } from '../features/barbershop/model/ActiveBarbershopContext'
import { CreateProfessionalForm } from '../features/professional/ui/CreateProfessionalForm'
import { EditProfessionalForm } from '../features/professional/ui/EditProfessionalForm'
import { Card } from '../shared/ui/Card'
import { Button } from '../shared/ui/Button'
import { Avatar } from '../shared/ui/Avatar'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import type { Professional } from '../entities/professional/types'

export function OwnerProfessionalsPage() {
  const { id } = useParams<{ id: string }>()
  const barbershopId = id as string
  const { user, refreshUser } = useAuth()
  const {
    barbearia,
    profissionais,
    loading,
    error,
    buscarBarbearia,
    listarProfissionais,
    criarProfissional,
    atualizarProfissional,
    removerProfissional,
    tornarSeProfissional,
  } = useBarbeiro()
  const { selecionarBarbearia } = useActiveBarbershop()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [profissionalParaRemover, setProfissionalParaRemover] = useState<Professional | null>(null)
  const [removendo, setRemovendo] = useState(false)
  const [tornandoProfissional, setTornandoProfissional] = useState(false)

  useEffect(() => {
    buscarBarbearia(barbershopId)
    listarProfissionais(barbershopId)
    selecionarBarbearia(barbershopId)
  }, [barbershopId, buscarBarbearia, listarProfissionais, selecionarBarbearia])

  async function handleConfirmarRemover() {
    if (!profissionalParaRemover) return

    setRemovendo(true)
    try {
      await removerProfissional(barbershopId, profissionalParaRemover.id)
      await refreshUser()
      await listarProfissionais(barbershopId)
      setProfissionalParaRemover(null)
    } finally {
      setRemovendo(false)
    }
  }

  async function handleTornarSeProfissional() {
    setTornandoProfissional(true)
    try {
      await tornarSeProfissional(barbershopId, {})
      await refreshUser()
      await listarProfissionais(barbershopId)
    } finally {
      setTornandoProfissional(false)
    }
  }

  const ehDono = !!barbearia && !!user && barbearia.ownerId === user.id
  const jaEhProfissional = !!user?.roles.includes('profissional')

  return (
    <div className="min-h-screen bg-primary">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        {/* Navegação de retorno */}
        <div>
          <Link
            to={`/owner/barbershops/${barbershopId}`}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar para {barbearia?.name ?? 'a barbearia'}</span>
          </Link>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-text-secondary">Carregando equipe da barbearia...</p>
          </div>
        )}

        {error && (
          <div className="max-w-xl">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}

        {barbearia && !ehDono && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4 max-w-xl">
            <ShieldAlert size={24} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-red-900">Acesso Restrito</h3>
              <p className="text-sm text-red-700 leading-relaxed">
                Você não possui permissão para gerenciar os profissionais desta barbearia.
              </p>
            </div>
          </div>
        )}

        {barbearia && ehDono && (
          <>
            {/* Card Hero da Barbearia */}
            <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
              <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20 shadow-xs">
                  <Store size={28} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight truncate">
                      {barbearia.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/30">
                      👑 Sua Unidade
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-selected shrink-0" />
                      <span className="truncate max-w-xs">{barbearia.address}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-selected shrink-0" />
                      <span>{barbearia.phone}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-menu de navegação da barbearia ativa */}
            <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
              <Link
                to={`/owner/barbershops/${barbearia.id}`}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-border whitespace-nowrap transition-colors"
              >
                <Building2 size={17} />
                Dados Gerais
              </Link>
              <Link
                to={`/owner/barbershops/${barbearia.id}/professionals`}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 border-selected text-selected whitespace-nowrap"
              >
                <Users size={17} />
                Profissionais
              </Link>
              <Link
                to={`/owner/barbershops/${barbearia.id}/services`}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-border whitespace-nowrap transition-colors"
              >
                <Scissors size={17} />
                Serviços
              </Link>
              <Link
                to={`/owner/barbershops/${barbearia.id}/hours`}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-border whitespace-nowrap transition-colors"
              >
                <Clock size={17} />
                Horários de Atendimento
              </Link>
            </div>

            {/* Barra de Ações e Título da Equipe */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                  Equipe de Profissionais
                </h2>
                <p className="text-sm text-text-secondary mt-0.5">
                  Cadastre novos barbeiros ou gerencie os profissionais vinculados a esta barbearia.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {!jaEhProfissional && (
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={tornandoProfissional}
                    onClick={handleTornarSeProfissional}
                    className="shadow-2xs"
                  >
                    <UserCheck size={16} />
                    Também sou profissional aqui
                  </Button>
                )}

                {!mostrarFormulario && (
                  <Button
                    size="sm"
                    onClick={() => setMostrarFormulario(true)}
                    className="shadow-sm"
                  >
                    <UserPlus size={16} />
                    Adicionar profissional
                  </Button>
                )}
              </div>
            </div>

            {/* Painel / Card de Adicionar Novo Profissional */}
            {mostrarFormulario && (
              <Card className="rounded-2xl p-6 sm:p-8 border-selected/30 bg-secondary shadow-sm">
                <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                      <UserPlus size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">Cadastrar Novo Profissional</h3>
                      <p className="text-xs text-text-secondary">
                        Crie os dados de acesso para que o barbeiro possa acompanhar seus próprios agendamentos.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white transition-colors cursor-pointer"
                    title="Fechar formulário"
                  >
                    <X size={18} />
                  </button>
                </div>

                <CreateProfessionalForm
                  onCreate={(dados) => criarProfissional(barbershopId, dados)}
                  onSuccess={() => {
                    setMostrarFormulario(false)
                    listarProfissionais(barbershopId)
                  }}
                  onCancel={() => setMostrarFormulario(false)}
                />
              </Card>
            )}

            {/* Estado Vazio */}
            {profissionais.length === 0 && !mostrarFormulario && (
              <div className="bg-secondary border border-border rounded-2xl p-12 flex flex-col items-center text-center gap-4 shadow-2xs">
                <div className="w-16 h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center">
                  <Users size={32} strokeWidth={1.75} />
                </div>
                <div className="max-w-md flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-text-primary">Nenhum profissional cadastrado</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Adicione os barbeiros da sua equipe para que os clientes possam agendar horários diretamente com eles.
                  </p>
                </div>
                <Button onClick={() => setMostrarFormulario(true)} className="mt-2">
                  <UserPlus size={18} />
                  Adicionar primeiro profissional
                </Button>
              </div>
            )}

            {/* Grade de Profissionais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {profissionais.map((profissional) => (
                <Card
                  key={profissional.id}
                  className="rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-zinc-300 shadow-2xs"
                >
                  {editandoId === profissional.id ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border text-sm font-semibold text-text-primary">
                        <Pencil size={16} className="text-selected" />
                        <span>Editar Profissional</span>
                      </div>
                      <EditProfessionalForm
                        professional={profissional}
                        onUpdate={(dados) => atualizarProfissional(barbershopId, profissional.id, dados)}
                        onSuccess={() => {
                          setEditandoId(null)
                          listarProfissionais(barbershopId)
                        }}
                        onCancel={() => setEditandoId(null)}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-start gap-3.5">
                        <Avatar
                          name={profissional.name}
                          size="md"
                          className="ring-2 ring-white shadow-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-text-primary text-base truncate">
                            {profissional.name}
                          </p>

                          {profissional.specialty ? (
                            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-selected/10 text-selected border border-selected/20">
                              <Scissors size={12} />
                              <span className="truncate">{profissional.specialty}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-text-secondary block mt-0.5">
                              Barbeiro geral
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Ativo na unidade
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditandoId(profissional.id)}
                            className="px-3 py-1.5 text-xs"
                          >
                            <Pencil size={13} />
                            Editar
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setProfissionalParaRemover(profissional)}
                            className="px-3 py-1.5 text-xs"
                          >
                            <Trash2 size={13} />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Modal de Confirmação de Remoção de Profissional */}
        {profissionalParaRemover && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Remover Profissional</h3>
              </div>

              <div className="bg-secondary p-3.5 rounded-xl border border-border flex items-center gap-3">
                <Avatar name={profissionalParaRemover.name} size="md" />
                <div className="min-w-0">
                  <p className="font-semibold text-text-primary text-sm truncate">
                    {profissionalParaRemover.name}
                  </p>
                  {profissionalParaRemover.specialty && (
                    <p className="text-xs text-text-secondary truncate">
                      {profissionalParaRemover.specialty}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed">
                Tem certeza que deseja remover este profissional desta barbearia? Ele deixará de aparecer na lista de agendamentos para clientes.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <Button
                  variant="secondary"
                  disabled={removendo}
                  onClick={() => setProfissionalParaRemover(null)}
                  className="px-4 py-2 border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  loading={removendo}
                  onClick={handleConfirmarRemover}
                  className="px-4 py-2 text-sm"
                >
                  Confirmar remoção
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
