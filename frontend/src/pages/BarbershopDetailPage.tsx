import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Store,
  Scissors,
  Check,
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  User,
  Search,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  CalendarCheck,
} from 'lucide-react'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useAgendamento } from '../features/agendamento/model/useAgendamento'
import { useAuth } from '../features/auth/model/useAuth'
import { Button } from '../shared/ui/Button'
import { Avatar } from '../shared/ui/Avatar'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import type { BusinessHours } from '../entities/barbershop/types'

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

// Aberto/fechado agora, comparando com o horário de funcionamento do dia
// da semana atual (hora local do navegador).
function estaAbertoAgora(horarios: BusinessHours[]): boolean {
  const agora = new Date()
  const horarioDeHoje = horarios.find((h) => h.dayOfWeek === agora.getDay())
  if (!horarioDeHoje) return false

  const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
  return horaAtual >= horarioDeHoje.openTime.slice(0, 5) && horaAtual < horarioDeHoje.closeTime.slice(0, 5)
}

export function BarbershopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    barbearia,
    profissionais,
    servicos,
    horarios,
    loading,
    error,
    buscarBarbearia,
    listarProfissionais,
    listarServicos,
    listarHorarios,
  } = useBarbeiro()
  const { buscarMeuProfissional } = useAgendamento()
  const { user } = useAuth()

  const [professionalId, setProfessionalId] = useState<string | null>(null)
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [meuProfissionalId, setMeuProfissionalId] = useState<string | null>(null)
  const [mostrarHorarios, setMostrarHorarios] = useState(false)
  const [buscaServico, setBuscaServico] = useState('')
  const [copiadoEndereco, setCopiadoEndereco] = useState(false)

  const ehProfissional = !!user?.roles.includes('profissional')
  const hojeDiaSemana = new Date().getDay()

  useEffect(() => {
    if (!id) return
    buscarBarbearia(id)
    listarProfissionais(id)
    listarServicos(id)
    listarHorarios(id)
  }, [id, buscarBarbearia, listarProfissionais, listarServicos, listarHorarios])

  useEffect(() => {
    if (!id || !ehProfissional) return
    buscarMeuProfissional().then((meuProfissional) => {
      if (meuProfissional?.barbershopId === id) {
        setMeuProfissionalId(meuProfissional.id)
      }
    })
  }, [id, ehProfissional, buscarMeuProfissional])

  // Barbeiro não pode agendar um horário com ele mesmo
  const profissionaisSelecionaveis = useMemo(() => {
    return profissionais.filter((p) => p.id !== meuProfissionalId)
  }, [profissionais, meuProfissionalId])

  const servicosFiltrados = useMemo(() => {
    if (!buscaServico.trim()) return servicos
    const termo = buscaServico.toLowerCase().trim()
    return servicos.filter(
      (s) =>
        s.name.toLowerCase().includes(termo) ||
        (s.description && s.description.toLowerCase().includes(termo))
    )
  }, [servicos, buscaServico])

  function handleCopiarEndereco() {
    if (!barbearia?.address) return
    navigator.clipboard.writeText(barbearia.address)
    setCopiadoEndereco(true)
    setTimeout(() => setCopiadoEndereco(false), 2500)
  }

  function handleContinuar() {
    if (!professionalId || !serviceId) return
    navigate(`/appointments/new?barbershopId=${id}&professionalId=${professionalId}&serviceId=${serviceId}`)
  }

  const profissionalSelecionado = profissionais.find((p) => p.id === professionalId)
  const servicoSelecionado = servicos.find((s) => s.id === serviceId)
  const temSelecao = !!professionalId || !!serviceId
  const selecaoCompleta = !!professionalId && !!serviceId
  const aberto = estaAbertoAgora(horarios)

  return (
    <div className="min-h-screen bg-primary">
      <main className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 ${temSelecao ? 'pb-36 sm:pb-32' : ''}`}>
        {/* Navegação de retorno */}
        <div>
          <Link
            to="/barbershops"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para todas as barbearias</span>
          </Link>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-text-secondary">Carregando informações da barbearia...</p>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="max-w-xl">
            <ErrorMessage>{error}</ErrorMessage>
          </div>
        )}

        {barbearia && (
          <>
            {/* HERO BANNER DA BARBEARIA */}
            <div className="relative overflow-hidden rounded-3xl shadow-xl border border-white/10 text-white">
              {/* Foto de capa em background */}
              {barbearia.avatarUrl ? (
                <>
                  <img
                    src={barbearia.avatarUrl}
                    alt={barbearia.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-dark/95 via-slate-900/85 to-indigo-950/90" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-dark via-slate-900 to-indigo-950" />
              )}

              <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-accent/20 backdrop-blur-sm border border-accent/30 text-white flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                    {barbearia.avatarUrl ? (
                      <img
                        src={barbearia.avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <Store size={32} strokeWidth={1.75} className="text-accent" />
                    )}
                  </div>

                  <div className="min-w-0 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
                        {barbearia.name}
                      </h1>

                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                          aberto
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-white/10 text-white/70 border border-white/20'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${aberto ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'}`}
                        />
                        {aberto ? 'Aberto agora' : 'Fechado no momento'}
                      </span>
                    </div>

                    {/* Endereço e Contato */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-white/80">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={15} className="text-accent shrink-0" />
                        <span className="truncate max-w-xs sm:max-w-md">{barbearia.address}</span>
                      </div>

                      <a
                        href={`tel:${barbearia.phone}`}
                        className="flex items-center gap-1.5 hover:text-white transition-colors underline-offset-2 hover:underline"
                      >
                        <Phone size={15} className="text-accent shrink-0" />
                        <span>{barbearia.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Ações de Informação Rápida */}
                <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopiarEndereco}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15 cursor-pointer"
                  >
                    <Copy size={14} />
                    {copiadoEndereco ? 'Endereço copiado!' : 'Copiar endereço'}
                  </button>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(barbearia.name + ' ' + barbearia.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
                  >
                    <ExternalLink size={14} />
                    Ver no Maps
                  </a>

                  <button
                    type="button"
                    onClick={() => setMostrarHorarios((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-accent/30 hover:bg-accent/40 text-white transition-colors border border-accent/50 cursor-pointer"
                  >
                    <Clock size={14} />
                    <span>Horários da semana</span>
                    {mostrarHorarios ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* CARD EXPANSÍVEL DE HORÁRIOS DE ATENDIMENTO */}
              {mostrarHorarios && (
                <div className="mt-6 pt-6 border-t border-white/15 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock size={16} className="text-accent" />
                      Horário de Funcionamento Semanal
                    </h3>
                    <span className="text-2xs text-white/60">Fuso horário local</span>
                  </div>

                  {horarios.length === 0 ? (
                    <p className="text-xs text-white/60 italic">
                      Os horários de funcionamento desta barbearia ainda não foram configurados.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {DIAS_SEMANA.map((diaNome, diaIndex) => {
                        const horarioDoDia = horarios.find((h) => h.dayOfWeek === diaIndex)
                        const ehHoje = diaIndex === hojeDiaSemana

                        return (
                          <div
                            key={diaIndex}
                            className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                              ehHoje
                                ? 'bg-white/20 border-accent text-white font-semibold shadow-xs'
                                : 'bg-white/5 border-white/10 text-white/70'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{diaNome}</span>
                              {ehHoje && (
                                <span className="text-3xs bg-accent px-1.5 py-0.5 rounded-full text-white font-bold uppercase">
                                  Hoje
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-medium">
                              {horarioDoDia
                                ? `${horarioDoDia.openTime.slice(0, 5)} - ${horarioDoDia.closeTime.slice(0, 5)}`
                                : 'Fechado'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Aviso para barbeiro logado se houver */}
            {ehProfissional && meuProfissionalId && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-800">
                <Info size={18} className="text-amber-600 shrink-0" />
                <span>
                  Você faz parte da equipe desta barbearia. Por regras do sistema, não é possível agendar horários consigo mesmo.
                </span>
              </div>
            )}

            {/* ETAPA 1: ESCOLHA DO PROFISSIONAL */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-selected text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    1
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                      Escolha o Profissional
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary">
                      Selecione quem irá realizar o seu atendimento
                    </p>
                  </div>
                </div>

                {profissionalSelecionado && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-selected bg-selected/10 px-3 py-1 rounded-full border border-selected/20">
                    <Check size={14} />
                    {profissionalSelecionado.name} selecionado
                  </span>
                )}
              </div>

              {profissionaisSelecionaveis.length === 0 ? (
                <div className="bg-secondary border border-border rounded-2xl p-8 text-center flex flex-col items-center gap-2">
                  <User size={24} className="text-text-secondary" />
                  <p className="text-sm text-text-secondary">
                    Nenhum profissional disponível para agendamento no momento.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {profissionaisSelecionaveis.map((profissional) => {
                    const selecionado = professionalId === profissional.id
                    return (
                      <button
                        key={profissional.id}
                        type="button"
                        onClick={() => setProfessionalId(profissional.id)}
                        className="text-left w-full cursor-pointer focus:outline-none"
                      >
                        <div
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
                            selecionado
                              ? 'border-selected bg-selected/5 shadow-sm ring-2 ring-selected/20'
                              : 'border-border bg-secondary hover:border-selected/40 hover:bg-white'
                          }`}
                        >
                          <Avatar name={profissional.name} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-text-primary text-sm sm:text-base truncate">
                              {profissional.name}
                            </p>
                            <p className="text-text-secondary text-xs truncate mt-0.5">
                              {profissional.specialty || 'Especialista em cortes & barbas'}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                              selecionado
                                ? 'bg-selected text-white'
                                : 'border border-border text-text-secondary bg-white'
                            }`}
                          >
                            {selecionado ? <Check size={16} strokeWidth={2.5} /> : <User size={16} />}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>

            {/* ETAPA 2: ESCOLHA DO SERVIÇO */}
            <section className="flex flex-col gap-4 pt-4 border-t border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-selected text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    2
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                      Escolha o Serviço
                    </h2>
                    <p className="text-xs sm:text-sm text-text-secondary">
                      Selecione o procedimento ou combo desejado
                    </p>
                  </div>
                </div>

                {/* Barra de busca de serviços */}
                {servicos.length > 4 && (
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar serviço..."
                      value={buscaServico}
                      onChange={(e) => setBuscaServico(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-secondary border border-border rounded-xl text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-selected"
                    />
                  </div>
                )}
              </div>

              {servicosFiltrados.length === 0 ? (
                <div className="bg-secondary border border-border rounded-2xl p-8 text-center flex flex-col items-center gap-2">
                  <Scissors size={24} className="text-text-secondary" />
                  <p className="text-sm text-text-secondary">
                    {buscaServico ? 'Nenhum serviço correspondente à busca.' : 'Nenhum serviço cadastrado nesta barbearia.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servicosFiltrados.map((servico) => {
                    const selecionado = serviceId === servico.id
                    const fotoServico = servico.imageUrl || servico.avatarUrl
                    return (
                      <button
                        key={servico.id}
                        type="button"
                        onClick={() => setServiceId(servico.id)}
                        className="text-left h-full cursor-pointer focus:outline-none"
                      >
                        <div
                          className={`flex flex-col justify-between h-full rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
                            selecionado
                              ? 'border-selected bg-selected/5 shadow-sm ring-2 ring-selected/20'
                              : 'border-border bg-secondary hover:border-selected/40 hover:bg-white'
                          }`}
                        >
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
                            <div className="absolute top-3 right-3">
                              <span
                                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors shadow-sm backdrop-blur-sm ${
                                  selecionado
                                    ? 'bg-selected text-white'
                                    : 'bg-white/90 text-text-secondary border border-border/70'
                                }`}
                              >
                                {selecionado && <Check size={12} strokeWidth={2.5} />}
                                {selecionado ? 'Selecionado' : 'Selecionar'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 p-5">
                            <div className="flex-1">
                              <h3 className="font-bold text-text-primary text-base leading-snug line-clamp-1">
                                {servico.name}
                              </h3>
                              {servico.description && (
                                <p className="text-text-secondary text-xs mt-1.5 line-clamp-2 leading-relaxed">
                                  {servico.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border/70 text-xs">
                              <span className="flex items-center gap-1 text-text-secondary font-medium">
                                <Clock size={14} className="text-text-secondary" />
                                {servico.durationMinutes} min
                              </span>
                              <span className="font-extrabold text-base text-accent">
                                {formatPrice(servico.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* BARRA FIXA DE RESUMO INFERIOR (STICKY BOTTOM DOCK) */}
      {barbearia && temSelecao && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-dark/95 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 py-4 shadow-2xl">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Informações da Seleção */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-white w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-white/60">Profissional:</span>
                {profissionalSelecionado ? (
                  <span className="font-semibold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                    {profissionalSelecionado.name}
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium italic">Selecione um profissional</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-white/60">Serviço:</span>
                {servicoSelecionado ? (
                  <span className="font-semibold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                    {servicoSelecionado.name}{' '}
                    <strong className="text-accent ml-1">{formatPrice(servicoSelecionado.price)}</strong>
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium italic">Selecione um serviço</span>
                )}
              </div>
            </div>

            {/* Botão de Prosseguir */}
            <div className="w-full sm:w-auto flex items-center justify-end">
              <Button
                disabled={!selecaoCompleta}
                onClick={handleContinuar}
                size="md"
                className="w-full sm:w-auto justify-center shadow-lg gap-2 font-bold"
              >
                <CalendarCheck size={18} />
                Continuar para agendamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
