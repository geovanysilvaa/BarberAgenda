import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Store,
  Plus,
  Search,
  Building2,
  MapPin,
  Phone,
  ExternalLink,
  Scissors,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Pencil,
  X,
  Check,
} from 'lucide-react'
import { useAuth } from '../features/auth/model/useAuth'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useActiveBarbershop } from '../features/barbershop/model/ActiveBarbershopContext'
import { CreateBarbershopForm } from '../features/barbershop/ui/CreateBarbershopForm'
import { Card } from '../shared/ui/Card'
import { Button } from '../shared/ui/Button'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import type { Barbershop } from '../entities/barbershop/types'

/**
 * Lista as barbearias do usuário autenticado (owner), permite alternar
 * a barbearia ativa do menu e cadastrar novas unidades da rede.
 */
export function OwnerBarbershopsPage() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const { barbearias, loading, error, listarBarbearias, criarBarbearia } = useBarbeiro()
  const { activeBarbershopId, selecionarBarbearia } = useActiveBarbershop()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    listarBarbearias()
  }, [listarBarbearias])

  const minhasBarbearias = useMemo(() => {
    return barbearias.filter((b) => b.ownerId === user?.id)
  }, [barbearias, user?.id])

  const barbeariasFiltradas = useMemo(() => {
    if (!busca.trim()) return minhasBarbearias
    const termo = busca.toLowerCase()
    return minhasBarbearias.filter(
      (b) =>
        b.name.toLowerCase().includes(termo) ||
        b.address.toLowerCase().includes(termo) ||
        b.phone.includes(termo)
    )
  }, [minhasBarbearias, busca])

  const barbeariaAtiva = useMemo(() => {
    return minhasBarbearias.find((b) => b.id === activeBarbershopId)
  }, [minhasBarbearias, activeBarbershopId])

  async function handleBarbeariaCriada(barbershop: Barbershop) {
    await refreshUser()
    selecionarBarbearia(barbershop.id)
    setMostrarFormulario(false)
    navigate(`/owner/barbershops/${barbershop.id}`)
  }

  function handleSelecionarEGerenciar(id: string) {
    selecionarBarbearia(id)
    navigate(`/owner/barbershops/${id}`)
  }

  return (
    <div className="min-h-screen bg-primary">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        {/* Header / Hero */}
        <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20 shadow-xs">
              <Store size={28} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  Minhas Barbearias
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-selected/10 text-selected border border-selected/30">
                  <Sparkles size={12} />
                  {minhasBarbearias.length} {minhasBarbearias.length === 1 ? 'unidade' : 'unidades'}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                Alterne entre suas unidades ou cadastre novas filiais para gerenciar profissionais, serviços e horários.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!mostrarFormulario && (
              <Button
                onClick={() => setMostrarFormulario(true)}
                className="gap-2 shadow-sm"
              >
                <Plus size={18} />
                Nova Barbearia
              </Button>
            )}
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {error && (
          <div className="max-w-xl">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}

        {/* Formulário de Nova Barbearia Expandido */}
        {mostrarFormulario && (
          <Card className="rounded-2xl p-6 sm:p-8 border-selected/40 shadow-md">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center">
                  <Building2 size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Cadastrar Nova Barbearia</h2>
                  <p className="text-xs text-text-secondary">
                    Preencha as informações básicas para adicionar uma nova filial à sua rede.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-zinc-100 transition-colors"
                title="Fechar formulário"
              >
                <X size={20} />
              </button>
            </div>

            <CreateBarbershopForm
              onCreate={criarBarbearia}
              onSuccess={handleBarbeariaCriada}
              onCancel={() => setMostrarFormulario(false)}
              submitLabel="Criar e Gerenciar"
            />
          </Card>
        )}

        {/* Unidade Ativa no Momento (Destaque Informativo) */}
        {barbeariaAtiva && !mostrarFormulario && (
          <div className="bg-gradient-to-r from-selected/10 via-selected/5 to-transparent border border-selected/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-selected text-white flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-selected">
                    Unidade Ativa no Menu Lateral
                  </span>
                </div>
                <h3 className="text-base font-bold text-text-primary">{barbeariaAtiva.name}</h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/owner/barbershops/${barbeariaAtiva.id}`}>
                <Button variant="secondary" size="sm" className="text-xs gap-1.5 py-1.5">
                  <Pencil size={14} />
                  Editar
                </Button>
              </Link>
              <Link to={`/owner/barbershops/${barbeariaAtiva.id}/professionals`}>
                <Button variant="secondary" size="sm" className="text-xs gap-1.5 py-1.5">
                  <Users size={14} />
                  Profissionais
                </Button>
              </Link>
              <Link to={`/owner/barbershops/${barbeariaAtiva.id}/services`}>
                <Button variant="secondary" size="sm" className="text-xs gap-1.5 py-1.5">
                  <Scissors size={14} />
                  Serviços
                </Button>
              </Link>
              <Link to={`/owner/barbershops/${barbeariaAtiva.id}/hours`}>
                <Button variant="secondary" size="sm" className="text-xs gap-1.5 py-1.5">
                  <Clock size={14} />
                  Horários
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Barra de Busca quando houver mais de 2 barbearias */}
        {minhasBarbearias.length > 2 && (
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
            />
            <input
              type="text"
              placeholder="Buscar unidade por nome, endereço ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/60 outline-none transition-all focus:border-selected focus:ring-2 focus:ring-selected/20"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
              >
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-text-secondary">Carregando suas barbearias...</p>
          </div>
        )}

        {/* Empty State: Nenhuma barbearia */}
        {!loading && minhasBarbearias.length === 0 && !mostrarFormulario && (
          <Card className="rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center">
              <Building2 size={32} />
            </div>
            <div className="max-w-md flex flex-col gap-1">
              <h3 className="text-lg font-bold text-text-primary">Nenhuma barbearia cadastrada</h3>
              <p className="text-sm text-text-secondary">
                Você ainda não cadastrou nenhuma unidade. Crie a sua primeira barbearia para começar a gerenciar sua agenda.
              </p>
            </div>
            <Button onClick={() => setMostrarFormulario(true)} className="gap-2 mt-2">
              <Plus size={18} />
              Cadastrar Primeira Barbearia
            </Button>
          </Card>
        )}

        {/* Empty State: Busca sem resultados */}
        {!loading && minhasBarbearias.length > 0 && barbeariasFiltradas.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            <p className="text-base font-medium">Nenhuma barbearia encontrada para "{busca}"</p>
            <button
              type="button"
              onClick={() => setBusca('')}
              className="text-selected font-semibold text-sm hover:underline mt-2 inline-block"
            >
              Limpar busca
            </button>
          </div>
        )}

        {/* Grid de Barbearias */}
        {!loading && barbeariasFiltradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbeariasFiltradas.map((barbearia) => {
              const isAtiva = barbearia.id === activeBarbershopId
              const fotoCapa = barbearia.avatarUrl

              return (
                <div
                  key={barbearia.id}
                  className={`bg-secondary border rounded-2xl overflow-hidden flex flex-col justify-between gap-5 transition-all duration-200 hover:shadow-md ${
                    isAtiva
                      ? 'border-selected ring-2 ring-selected/20 shadow-xs'
                      : 'border-border hover:border-selected/40'
                  }`}
                >
                  {/* Foto de capa */}
                  <div className="w-full aspect-[16/9] bg-gradient-to-br from-selected/15 via-accent/10 to-primary/80 relative overflow-hidden border-b border-border">
                    {fotoCapa ? (
                      <img
                        src={fotoCapa}
                        alt={barbearia.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Store size={40} strokeWidth={1.75} className="text-selected/40" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      {isAtiva ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-selected text-white border border-selected/30 shadow-sm">
                          <Check size={12} strokeWidth={2.5} />
                          Ativa
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selecionarBarbearia(barbearia.id)}
                          className="text-xs font-semibold text-text-secondary hover:text-selected transition-colors px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border border-border shadow-sm"
                        >
                          Tornar ativa
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Topo do Card: Ícone e Info */}
                  <div className="flex flex-col gap-4 px-6 pt-1">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isAtiva
                            ? 'bg-selected text-white border-selected shadow-xs'
                            : 'bg-selected/10 text-selected border-selected/20'
                        }`}
                      >
                        <Store size={18} strokeWidth={2} />
                      </div>
                    </div>

                    {/* Informações da Barbearia */}
                    <div className="flex flex-col gap-2">
                      <h2 className="font-bold text-lg text-text-primary tracking-tight line-clamp-1">
                        {barbearia.name}
                      </h2>

                      <div className="flex flex-col gap-1 text-xs text-text-secondary">
                        <div className="flex items-start gap-1.5">
                          <MapPin size={13} className="text-selected shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{barbearia.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-selected shrink-0" />
                          <span>{barbearia.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Card: Ações e Atalhos */}
                  <div className="flex flex-col gap-3 pt-4 mx-6 mb-6 border-t border-border/80">
                    {/* Atalhos Rápidos com ícones */}
                    <div className="grid grid-cols-4 gap-1.5">
                      <Link
                        to={`/owner/barbershops/${barbearia.id}`}
                        onClick={() => selecionarBarbearia(barbearia.id)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-border hover:border-selected/40 hover:bg-selected/5 transition-all text-text-secondary hover:text-text-primary group"
                        title="Editar Informações"
                      >
                        <Pencil size={15} className="group-hover:text-selected transition-colors" />
                        <span className="text-2xs font-medium mt-1">Dados</span>
                      </Link>

                      <Link
                        to={`/owner/barbershops/${barbearia.id}/professionals`}
                        onClick={() => selecionarBarbearia(barbearia.id)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-border hover:border-selected/40 hover:bg-selected/5 transition-all text-text-secondary hover:text-text-primary group"
                        title="Profissionais"
                      >
                        <Users size={15} className="group-hover:text-selected transition-colors" />
                        <span className="text-2xs font-medium mt-1">Equipe</span>
                      </Link>

                      <Link
                        to={`/owner/barbershops/${barbearia.id}/services`}
                        onClick={() => selecionarBarbearia(barbearia.id)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-border hover:border-selected/40 hover:bg-selected/5 transition-all text-text-secondary hover:text-text-primary group"
                        title="Serviços"
                      >
                        <Scissors size={15} className="group-hover:text-selected transition-colors" />
                        <span className="text-2xs font-medium mt-1">Serviços</span>
                      </Link>

                      <Link
                        to={`/owner/barbershops/${barbearia.id}/hours`}
                        onClick={() => selecionarBarbearia(barbearia.id)}
                        className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-border hover:border-selected/40 hover:bg-selected/5 transition-all text-text-secondary hover:text-text-primary group"
                        title="Horários de Funcionamento"
                      >
                        <Clock size={15} className="group-hover:text-selected transition-colors" />
                        <span className="text-2xs font-medium mt-1">Horários</span>
                      </Link>
                    </div>

                    {/* Botão Principal: Gerenciar Unidade */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        onClick={() => handleSelecionarEGerenciar(barbearia.id)}
                        className="flex-1 justify-center text-sm py-2 shadow-xs"
                      >
                        <span>Gerenciar Unidade</span>
                        <ArrowRight size={15} />
                      </Button>

                      <Link
                        to={`/barbershops/${barbearia.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white border border-border text-text-secondary hover:text-text-primary hover:border-zinc-300 transition-colors"
                        title="Ver página pública da barbearia"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

