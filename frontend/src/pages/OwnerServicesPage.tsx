import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Building2,
  Users,
  Scissors,
  Clock,
  Plus,
  Pencil,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import { useAuth } from '../features/auth/model/useAuth'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useActiveBarbershop } from '../features/barbershop/model/ActiveBarbershopContext'
import { CreateServiceForm } from '../features/service/ui/CreateServiceForm'
import { EditServiceForm } from '../features/service/ui/EditServiceForm'
import { Card } from '../shared/ui/Card'
import { Button } from '../shared/ui/Button'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function OwnerServicesPage() {
  const { id } = useParams<{ id: string }>()
  const barbershopId = id as string
  const { user } = useAuth()
  const {
    barbearia,
    servicos,
    loading,
    error,
    buscarBarbearia,
    listarServicos,
    criarServico,
    atualizarServico,
  } = useBarbeiro()
  const { selecionarBarbearia } = useActiveBarbershop()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  useEffect(() => {
    buscarBarbearia(barbershopId)
    listarServicos(barbershopId)
    selecionarBarbearia(barbershopId)
  }, [barbershopId, buscarBarbearia, listarServicos, selecionarBarbearia])

  const ehDono = !!barbearia && !!user && barbearia.ownerId === user.id

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
            <p className="text-sm text-text-secondary">Carregando catálogo de serviços...</p>
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
                Você não possui permissão para gerenciar os serviços desta barbearia.
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
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-border whitespace-nowrap transition-colors"
              >
                <Users size={17} />
                Profissionais
              </Link>
              <Link
                to={`/owner/barbershops/${barbearia.id}/services`}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 border-selected text-selected whitespace-nowrap"
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

            {/* Barra de Ações e Título dos Serviços */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                  Catálogo de Serviços
                </h2>
                <p className="text-sm text-text-secondary mt-0.5">
                  Cadastre cortes, barbas, tratamentos, preços e tempo médio de cada procedimento.
                </p>
              </div>

              {!mostrarFormulario && (
                <Button
                  size="sm"
                  onClick={() => setMostrarFormulario(true)}
                  className="shadow-sm"
                >
                  <Plus size={16} />
                  Adicionar serviço
                </Button>
              )}
            </div>

            {/* Painel / Card de Adicionar Novo Serviço */}
            {mostrarFormulario && (
              <Card className="rounded-2xl p-6 sm:p-8 border-selected/30 bg-secondary shadow-sm">
                <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                      <Scissors size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-text-primary">Cadastrar Novo Serviço</h3>
                      <p className="text-xs text-text-secondary">
                        Defina o nome, valor cobrado e a duração estimada em minutos.
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

                <CreateServiceForm
                  onCreate={(dados) => criarServico(barbershopId, dados)}
                  onSuccess={() => {
                    setMostrarFormulario(false)
                    listarServicos(barbershopId)
                  }}
                  onCancel={() => setMostrarFormulario(false)}
                />
              </Card>
            )}

            {/* Estado Vazio */}
            {servicos.length === 0 && !mostrarFormulario && (
              <div className="bg-secondary border border-border rounded-2xl p-12 flex flex-col items-center text-center gap-4 shadow-2xs">
                <div className="w-16 h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center">
                  <Sparkles size={32} strokeWidth={1.75} />
                </div>
                <div className="max-w-md flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-text-primary">Nenhum serviço cadastrado</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Crie as opções de atendimento (como Corte Tradicional, Barba Alinhada ou Combo) para disponibilizar o agendamento aos clientes.
                  </p>
                </div>
                <Button onClick={() => setMostrarFormulario(true)} className="mt-2">
                  <Plus size={18} />
                  Adicionar primeiro serviço
                </Button>
              </div>
            )}

            {/* Grade de Serviços */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {servicos.map((servico) => {
                const fotoServico = servico.imageUrl || servico.avatarUrl
                return (
                  <Card
                    key={servico.id}
                    className="rounded-2xl p-0 overflow-hidden flex flex-col justify-between transition-all hover:border-zinc-300 shadow-2xs bg-secondary"
                  >
                    {editandoId === servico.id ? (
                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border text-sm font-semibold text-text-primary">
                          <Pencil size={16} className="text-selected" />
                          <span>Editar Serviço</span>
                        </div>
                        <EditServiceForm
                          service={servico}
                          onUpdate={(dados) => atualizarServico(barbershopId, servico.id, dados)}
                          onSuccess={() => {
                            setEditandoId(null)
                            listarServicos(barbershopId)
                          }}
                          onCancel={() => setEditandoId(null)}
                        />
                      </div>
                    ) : (
                      <>
                        {/* Foto do serviço */}
                        <div className="relative w-full aspect-[5/3] bg-gradient-to-br from-accent/15 via-selected/10 to-secondary overflow-hidden border-b border-border/70">
                          {fotoServico ? (
                            <img
                              src={fotoServico}
                              alt={servico.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Scissors size={34} strokeWidth={1.75} className="text-accent/50" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 font-bold text-sm text-white bg-accent/90 backdrop-blur-sm px-3 py-1 rounded-xl border border-accent/30 shrink-0 shadow-sm">
                            {formatPrice(servico.price)}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col gap-4 flex-1">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20">
                              <Scissors size={17} strokeWidth={2} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-base text-text-primary truncate leading-snug">
                                {servico.name}
                              </h3>
                              <span className="inline-flex items-center gap-1 text-xs text-text-secondary mt-0.5">
                                <Clock size={12} />
                                {servico.durationMinutes} min de duração
                              </span>
                            </div>
                          </div>

                          {servico.description && (
                            <p className="text-text-secondary text-xs leading-relaxed line-clamp-2 bg-white p-2.5 rounded-lg border border-border/60">
                              {servico.description}
                            </p>
                          )}

                          <div className="flex items-center justify-end pt-2 mt-auto border-t border-border">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditandoId(servico.id)}
                              className="px-3.5 py-1.5 text-xs"
                            >
                              <Pencil size={13} />
                              Editar serviço
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
