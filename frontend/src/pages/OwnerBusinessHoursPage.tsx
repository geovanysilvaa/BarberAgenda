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
  Calendar,
  Save,
  Check,
  ShieldAlert,
  Info,
} from 'lucide-react'
import { useAuth } from '../features/auth/model/useAuth'
import { useBarbeiro } from '../features/barbershop/model/useBarbeiro'
import { useActiveBarbershop } from '../features/barbershop/model/ActiveBarbershopContext'
import { Card } from '../shared/ui/Card'
import { Button } from '../shared/ui/Button'
import { Input } from '../shared/ui/Input'
import { LoadingSpinner } from '../shared/ui/LoadingSpinner'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { SuccessMessage } from '../shared/ui/SuccessMessage'
import { ApiError } from '../shared/lib/api'

// Segunda a sexta vira um único grupo — o horário definido se repete
// automaticamente nos 5 dias, já que a imensa maioria das barbearias
// funciona igual de segunda a sexta. Sábado e domingo continuam à parte
// porque costumam ter horário diferente (ou fechado, no caso de domingo).
const GRUPOS: { chave: string; label: string; badge: string; dias: number[] }[] = [
  { chave: 'seg-sex', label: 'Segunda a sexta-feira', badge: 'Dias úteis', dias: [1, 2, 3, 4, 5] },
  { chave: 'sabado', label: 'Sábado', badge: 'Fim de semana', dias: [6] },
  { chave: 'domingo', label: 'Domingo', badge: 'Fim de semana', dias: [0] },
]

export function OwnerBusinessHoursPage() {
  const { id } = useParams<{ id: string }>()
  const barbershopId = id as string
  const { user } = useAuth()
  const { barbearia, horarios, loading, error, buscarBarbearia, listarHorarios, salvarHorario } = useBarbeiro()
  const { selecionarBarbearia } = useActiveBarbershop()

  const [valores, setValores] = useState<Record<string, { openTime: string; closeTime: string }>>({})
  const [salvandoGrupo, setSalvandoGrupo] = useState<string | null>(null)
  const [grupoSucesso, setGrupoSucesso] = useState<Record<string, boolean>>({})
  const [grupoError, setGrupoError] = useState<Record<string, string>>({})

  useEffect(() => {
    buscarBarbearia(barbershopId)
    listarHorarios(barbershopId)
    selecionarBarbearia(barbershopId)
  }, [barbershopId, buscarBarbearia, listarHorarios, selecionarBarbearia])

  useEffect(() => {
    const porDia: Record<number, { openTime: string; closeTime: string }> = {}
    for (const horario of horarios) {
      porDia[horario.dayOfWeek] = { openTime: horario.openTime.slice(0, 5), closeTime: horario.closeTime.slice(0, 5) }
    }
    // Representa o grupo pelo horário do primeiro dia (ex.: segunda, pro grupo seg-sex)
    const iniciais: Record<string, { openTime: string; closeTime: string }> = {}
    for (const grupo of GRUPOS) {
      const doPrimeiroDia = porDia[grupo.dias[0]]
      if (doPrimeiroDia) iniciais[grupo.chave] = doPrimeiroDia
    }
    setValores((atual) => ({ ...iniciais, ...atual }))
  }, [horarios])

  function handleChange(chave: string, campo: 'openTime' | 'closeTime', valor: string) {
    setValores((atual) => ({
      ...atual,
      [chave]: { ...atual[chave], [campo]: valor },
    }))
  }

  async function handleSalvar(grupo: (typeof GRUPOS)[number]) {
    const valor = valores[grupo.chave]
    if (!valor?.openTime || !valor?.closeTime) return

    setSalvandoGrupo(grupo.chave)
    setGrupoError((atual) => ({ ...atual, [grupo.chave]: '' }))
    setGrupoSucesso((atual) => ({ ...atual, [grupo.chave]: false }))

    try {
      await Promise.all(
        grupo.dias.map((dayOfWeek) =>
          salvarHorario(barbershopId, { dayOfWeek, openTime: valor.openTime, closeTime: valor.closeTime })
        )
      )
      await listarHorarios(barbershopId)
      setGrupoSucesso((atual) => ({ ...atual, [grupo.chave]: true }))
      setTimeout(() => {
        setGrupoSucesso((atual) => ({ ...atual, [grupo.chave]: false }))
      }, 4000)
    } catch (err) {
      setGrupoError((atual) => ({
        ...atual,
        [grupo.chave]: err instanceof ApiError ? err.message : 'Não foi possível salvar. Tente novamente.',
      }))
    } finally {
      setSalvandoGrupo(null)
    }
  }

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
            <p className="text-sm text-text-secondary">Carregando horários de funcionamento...</p>
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
                Você não possui permissão para gerenciar os horários desta barbearia.
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
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-border whitespace-nowrap transition-colors"
              >
                <Scissors size={17} />
                Serviços
              </Link>
              <Link
                to={`/owner/barbershops/${barbearia.id}/hours`}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 border-selected text-selected whitespace-nowrap"
              >
                <Clock size={17} />
                Horários de Atendimento
              </Link>
            </div>

            {/* Cabeçalho da Seção */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Horário de Funcionamento
              </h2>
              <p className="text-sm text-text-secondary mt-1 max-w-3xl leading-relaxed">
                Configure os horários de abertura e fechamento para cada dia da semana. Os agendamentos são disponibilizados automaticamente dentro dos períodos definidos. Dias sem horário ficam fechados.
              </p>
            </div>

            {/* Lista dos Grupos de Horários */}
            <div className="grid grid-cols-1 gap-5">
              {GRUPOS.map((grupo) => {
                const estaSalvando = salvandoGrupo === grupo.chave
                const deuSucesso = grupoSucesso[grupo.chave]
                const valorAtual = valores[grupo.chave]
                const preenchido = !!valorAtual?.openTime && !!valorAtual?.closeTime

                return (
                  <Card key={grupo.chave} className="rounded-2xl p-6 flex flex-col gap-5 border border-border shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                          <Calendar size={20} strokeWidth={2} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-text-primary">{grupo.label}</h3>
                            <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                              {grupo.badge}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {grupo.chave === 'seg-sex'
                              ? 'Aplica o mesmo horário de segunda a sexta-feira simultaneamente'
                              : `Configuração específica para ${grupo.label.toLowerCase()}`}
                          </p>
                        </div>
                      </div>

                      {preenchido && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Aberto das {valorAtual.openTime} às {valorAtual.closeTime}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                      <Input
                        label="Horário de Abertura"
                        type="time"
                        icon={Clock}
                        value={valorAtual?.openTime ?? ''}
                        onChange={(e) => handleChange(grupo.chave, 'openTime', e.target.value)}
                      />

                      <Input
                        label="Horário de Fechamento"
                        type="time"
                        icon={Clock}
                        value={valorAtual?.closeTime ?? ''}
                        onChange={(e) => handleChange(grupo.chave, 'closeTime', e.target.value)}
                      />

                      <div className="flex items-center gap-3">
                        <Button
                          size="md"
                          loading={estaSalvando}
                          disabled={!preenchido}
                          onClick={() => handleSalvar(grupo)}
                          className="w-full sm:w-auto px-6 py-2.5 shadow-2xs"
                        >
                          {deuSucesso ? <Check size={18} /> : <Save size={18} />}
                          {deuSucesso ? 'Salvo!' : 'Salvar horário'}
                        </Button>
                      </div>
                    </div>

                    {grupoError[grupo.chave] && <ErrorMessage>{grupoError[grupo.chave]}</ErrorMessage>}
                    {deuSucesso && <SuccessMessage>Horários de {grupo.label.toLowerCase()} atualizados com sucesso!</SuccessMessage>}
                  </Card>
                )
              })}
            </div>

            {/* Card Informativo de Funcionamento */}
            <div className="bg-selected/5 border border-selected/20 rounded-2xl p-5 flex items-start gap-3.5">
              <Info size={20} className="text-selected shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-xs text-text-secondary leading-relaxed">
                <span className="font-semibold text-text-primary text-sm">Como funcionam os intervalos de atendimento?</span>
                <p>
                  O Barber Agenda cruza o horário de funcionamento definido aqui com a duração cadastrada nos serviços e as agendas dos barbeiros. Intervalos indisponíveis são bloqueados automaticamente, garantindo que não haja agendamentos duplicados.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
