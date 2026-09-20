import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  ExternalLink,
  Users,
  Scissors,
  Clock,
  Building2,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../features/auth/model/useAuth'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useActiveBarbershop } from '../features/barbershop/model/ActiveBarbershopContext'
import { EditBarbershopForm } from '../features/barbershop/ui/EditBarbershopForm'
import { Card } from '../shared/ui/Card'
import { Button } from '../shared/ui/Button'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'

/**
 * Editar dados da barbearia.
 * Centro de gestão da unidade com atalhos para profissionais, serviços e horários.
 */
export function OwnerBarbershopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { barbearia, loading, error, buscarBarbearia, atualizarBarbearia } = useBarbeiro()
  const { selecionarBarbearia } = useActiveBarbershop()

  useEffect(() => {
    if (id) {
      buscarBarbearia(id)
      selecionarBarbearia(id)
    }
  }, [id, buscarBarbearia, selecionarBarbearia])

  const ehDono = !!barbearia && !!user && barbearia.ownerId === user.id

  return (
    <div className="min-h-screen bg-primary">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        {/* Navegação de retorno */}
        <div>
          <Link
            to="/owner/barbershops"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar para minhas barbearias</span>
          </Link>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-text-secondary">Carregando dados da barbearia...</p>
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
                Você não possui permissão de proprietário para gerenciar esta barbearia.
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

              <div className="flex items-center gap-3 shrink-0">
                <Link to={`/barbershops/${barbearia.id}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" className="gap-1.5 shadow-2xs">
                    <ExternalLink size={15} />
                    Ver página pública
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sub-menu de navegação da barbearia ativa */}
            <div className="flex items-center gap-2 border-b border-border overflow-x-auto">
              <Link
                to={`/owner/barbershops/${barbearia.id}`}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 border-selected text-selected whitespace-nowrap"
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

            {/* Layout em 2 Colunas: Formulário Principal e Acessos Rápidos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Coluna Principal: Formulário */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Card className="flex flex-col gap-6 rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/80">
                    <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                      <Building2 size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">Editar Informações</h2>
                      <p className="text-sm text-text-secondary">
                        Mantenha o nome, telefone comercial e endereço atualizados para seus clientes.
                      </p>
                    </div>
                  </div>

                  <EditBarbershopForm
                    barbershop={barbearia}
                    onUpdate={(dados) => atualizarBarbearia(barbearia.id, dados)}
                  />
                </Card>
              </div>

              {/* Coluna Lateral: Gestão e Dicas */}
              <div className="flex flex-col gap-6">
                {/* Atalhos Rápidos */}
                <Card className="flex flex-col gap-4 rounded-2xl p-6">
                  <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
                    <Sparkles size={16} className="text-selected" />
                    Gerenciamento da Unidade
                  </h3>

                  <div className="flex flex-col gap-2.5">
                    <Link
                      to={`/owner/barbershops/${barbearia.id}/professionals`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-border hover:border-selected/40 hover:bg-selected/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-selected/10 text-selected flex items-center justify-center">
                          <Users size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">Equipe & Barbeiros</span>
                          <span className="text-2xs text-text-secondary">Vincular profissionais</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-text-secondary group-hover:text-selected transition-colors" />
                    </Link>

                    <Link
                      to={`/owner/barbershops/${barbearia.id}/services`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-border hover:border-selected/40 hover:bg-selected/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-selected/10 text-selected flex items-center justify-center">
                          <Scissors size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">Catálogo de Serviços</span>
                          <span className="text-2xs text-text-secondary">Cortes, barbas e preços</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-text-secondary group-hover:text-selected transition-colors" />
                    </Link>

                    <Link
                      to={`/owner/barbershops/${barbearia.id}/hours`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-border hover:border-selected/40 hover:bg-selected/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-selected/10 text-selected flex items-center justify-center">
                          <Clock size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">Horário de Funcionamento</span>
                          <span className="text-2xs text-text-secondary">Dias e horários de abertura</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-text-secondary group-hover:text-selected transition-colors" />
                    </Link>
                  </div>
                </Card>

                {/* Dica para o proprietário */}
                <Card className="flex flex-col gap-3 rounded-2xl p-6">
                  <h4 className="font-semibold text-xs text-text-primary uppercase tracking-wide">
                    Dica de Visibilidade
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Certifique-se de preencher o endereço completo com número e referências. Os clientes utilizam essa informação para chegar até o seu estabelecimento.
                  </p>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
