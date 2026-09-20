import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Store,
  MapPin,
  Phone,
  Search,
  X,
  ArrowRight,
  Scissors,
  Sparkles,
  Building2,
  RefreshCw,
} from 'lucide-react'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { Card } from '../shared/ui/Card'
import { Button } from '../shared/ui/Button'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'

export function BarbershopsPage() {
  const { barbearias, loading, error, listarBarbearias } = useBarbeiro()
  const [busca, setBusca] = useState('')

  useEffect(() => {
    listarBarbearias()
  }, [listarBarbearias])

  const barbeariasFiltradas = useMemo(() => {
    if (!busca.trim()) return barbearias
    const termo = busca.toLowerCase().trim()
    return barbearias.filter(
      (b) =>
        b.name.toLowerCase().includes(termo) ||
        b.address.toLowerCase().includes(termo) ||
        b.phone.includes(termo)
    )
  }, [barbearias, busca])

  return (
    <div className="min-h-screen bg-primary">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-selected/10 text-selected border border-selected/20 mb-3">
              <Sparkles size={14} />
              <span>Agendamento Online</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                <Store size={22} strokeWidth={2} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Barbearias
              </h1>
            </div>
            <p className="text-sm text-text-secondary mt-1 ml-0 sm:ml-13 max-w-xl">
              Escolha uma unidade para conferir a equipe de profissionais, catálogo de serviços e agendar seu horário com praticidade.
            </p>
          </div>

          {/* Contador de unidades */}
          {!loading && barbearias.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-medium text-text-secondary bg-secondary px-3.5 py-2 rounded-xl border border-border shrink-0 self-start md:self-auto">
              <Building2 size={15} className="text-selected" />
              <span>
                <strong>{barbearias.length}</strong> {barbearias.length === 1 ? 'unidade cadastrada' : 'unidades cadastradas'}
              </span>
            </div>
          )}
        </div>

        {/* Barra de Busca */}
        {!loading && barbearias.length > 0 && (
          <div className="bg-secondary border border-border rounded-2xl p-3 sm:p-4 shadow-2xs">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-3.5 text-text-secondary pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar barbearia por nome, endereço ou telefone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-selected focus:ring-2 focus:ring-selected/20 transition-all"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  aria-label="Limpar busca"
                  className="absolute right-3 p-1 text-text-secondary hover:text-text-primary transition-colors rounded-md"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {busca && (
              <div className="mt-2.5 px-1 flex items-center justify-between text-xs text-text-secondary">
                <span>
                  Resultados encontrados: <strong>{barbeariasFiltradas.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  className="text-selected hover:underline font-medium"
                >
                  Limpar filtro
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-text-secondary">Buscando barbearias disponíveis...</p>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="flex flex-col gap-3">
            <ErrorMessage>{error}</ErrorMessage>
            <div className="flex">
              <Button variant="secondary" size="sm" onClick={listarBarbearias} className="gap-2">
                <RefreshCw size={14} />
                Tentar novamente
              </Button>
            </div>
          </div>
        )}

        {/* Estado Vazio Geral: nenhuma barbearia no banco */}
        {!loading && !error && barbearias.length === 0 && (
          <div className="bg-secondary border border-border rounded-2xl p-10 sm:p-16 flex flex-col items-center text-center gap-4 shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center">
              <Store size={32} strokeWidth={1.75} />
            </div>
            <div className="max-w-md flex flex-col gap-1">
              <h3 className="text-lg font-bold text-text-primary">Nenhuma barbearia cadastrada</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Ainda não há estabelecimentos disponíveis no sistema. Em breve novas barbearias parceiras estarão prontas para atendê-lo.
              </p>
            </div>
          </div>
        )}

        {/* Estado Vazio de Busca: nenhum resultado para o filtro */}
        {!loading && !error && barbearias.length > 0 && barbeariasFiltradas.length === 0 && (
          <div className="bg-secondary border border-border rounded-2xl p-10 flex flex-col items-center text-center gap-3 shadow-2xs">
            <div className="w-14 h-14 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center">
              <Search size={24} strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-bold text-text-primary">Nenhuma barbearia encontrada</h3>
            <p className="text-sm text-text-secondary max-w-sm">
              Não encontramos nenhuma unidade correspondente a "{busca}". Verifique a ortografia ou busque por outro termo.
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setBusca('')}
              className="mt-2"
            >
              Limpar busca
            </Button>
          </div>
        )}

        {/* Grade de Barbearias */}
        {!loading && !error && barbeariasFiltradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbeariasFiltradas.map((barbearia) => {
              const fotoCapa = barbearia.avatarUrl
              return (
                <Link
                  key={barbearia.id}
                  to={`/barbershops/${barbearia.id}`}
                  className="group flex flex-col"
                >
                  <Card className="flex-1 flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-selected/40 group-hover:border-selected/40 border-border bg-secondary p-0">
                    {/* Foto de Capa */}
                    <div className="w-full aspect-[16/9] bg-gradient-to-br from-selected/15 via-accent/10 to-primary/80 relative overflow-hidden border-b border-border">
                      {fotoCapa ? (
                        <img
                          src={fotoCapa}
                          alt={`Fachada da ${barbearia.name}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Store size={46} strokeWidth={1.75} className="text-selected/40" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border border-border text-text-secondary shadow-sm">
                        <Scissors size={11} className="text-selected" />
                        Atendimento
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 group-hover:bg-selected group-hover:text-white transition-colors duration-200 border border-selected/20">
                          <Store size={18} strokeWidth={1.75} />
                        </div>
                      </div>

                      <div>
                        <h2 className="font-bold text-lg text-text-primary group-hover:text-selected transition-colors line-clamp-1">
                          {barbearia.name}
                        </h2>
                        <div className="mt-2.5 flex flex-col gap-1.5 text-xs text-text-secondary">
                          <p className="flex items-start gap-1.5">
                            <MapPin size={14} strokeWidth={1.75} className="shrink-0 text-selected mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed">{barbearia.address}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone size={14} strokeWidth={1.75} className="shrink-0 text-selected" />
                            <span>{barbearia.phone}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé do Card com CTA */}
                    <div className="mx-6 mb-6 mt-auto pt-4 border-t border-border/80 flex items-center justify-between text-xs font-semibold text-selected group-hover:text-selected">
                      <span>Ver profissionais e serviços</span>
                      <div className="w-7 h-7 rounded-lg bg-selected/10 flex items-center justify-center text-selected group-hover:bg-selected group-hover:text-white group-hover:translate-x-1 transition-all">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
