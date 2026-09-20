import { Link } from 'react-router-dom'
import {
  Scissors,
  CalendarCheck,
  BellRing,
  UserPlus,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Store,
} from 'lucide-react'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { Logo } from '../shared/ui/Logo'

const FEATURES = [
  {
    icon: Scissors,
    title: 'Escolha o profissional',
    description:
      'Veja os barbeiros disponíveis em cada barbearia, suas especialidades e escolha o de sua preferência.',
    tom: 'selected' as const,
  },
  {
    icon: CalendarCheck,
    title: 'Agende na hora',
    description:
      'Visualize os horários livres em tempo real e marque seu atendimento em poucos segundos.',
    tom: 'accent' as const,
  },
  {
    icon: BellRing,
    title: 'Fique por dentro',
    description:
      'Acompanhe seus agendamentos e receba confirmação e lembretes por e-mail automaticamente.',
    tom: 'selected' as const,
  },
] as const

const PASSOS = [
  {
    icon: UserPlus,
    title: 'Crie sua conta',
    description:
      'Cadastro rápido e sem burocracia. Basta nome, e-mail e senha para começar a usar.',
    tom: 'selected' as const,
  },
  {
    icon: Search,
    title: 'Encontre uma barbearia',
    description:
      'Navegue pelas unidades parceiras, veja a equipe de profissionais, serviços e preços.',
    tom: 'accent' as const,
  },
  {
    icon: CheckCircle2,
    title: 'Confirme seu horário',
    description:
      'Escolha o melhor horário disponível, finalize o agendamento e compareça no dia.',
    tom: 'selected' as const,
  },
] as const

const TOM_BADGE = {
  accent: 'bg-accent/10 text-accent border-accent/20',
  selected: 'bg-selected/10 text-selected border-selected/20',
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-primary">
      {/* Header Público */}
      <header className="bg-secondary border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Logo size="sm" />
            <span className="font-bold text-lg text-text-primary tracking-tight group-hover:text-selected transition-colors">
              Barber Agenda
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <Button variant="secondary" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16 flex flex-col gap-16">
        {/* Hero Principal */}
        <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-12 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-selected/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

          <div className="relative flex-1 flex flex-col gap-5 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-selected/10 text-selected border border-selected/20 w-fit">
              <Sparkles size={14} />
              Agendamento Online
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary tracking-tight leading-tight max-w-2xl">
                Agende seu horário na barbearia{' '}
                <span className="bg-gradient-to-r from-selected via-selected to-accent bg-clip-text text-transparent">
                  sem complicação
                </span>
              </h1>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl leading-relaxed">
                Escolha o profissional, o serviço e o melhor horário disponível — tudo em poucos
                cliques, direto do seu celular ou computador.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/register">
                <Button size="lg" className="shadow-md shadow-accent/20">
                  Começar agora
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Já tenho conta
                </Button>
              </Link>
            </div>

            <Link
              to="/register-barbershop"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-selected hover:underline pt-1 w-fit"
            >
              É dono de uma barbearia? Cadastre sua unidade aqui
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="relative lg:w-80 shrink-0">
            <div className="w-full aspect-square max-w-sm mx-auto">
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-selected via-selected/90 to-accent p-[2px] shadow-lg shadow-selected/20">
                <div className="w-full h-full rounded-3xl bg-secondary flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.12),transparent_55%)]" />
                  <div className="relative flex flex-col items-center gap-6">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-selected/10 text-selected flex items-center justify-center border border-selected/20 shadow-xs">
                      <Scissors size={48} strokeWidth={1.75} />
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center px-4">
                      <p className="font-bold text-xl text-text-primary tracking-tight">
                        Corte + Barba
                      </p>
                      <p className="text-xs text-text-secondary">
                        A partir de 30 minutos
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <CheckCircle2
                            key={i}
                            size={16}
                            className="text-selected fill-selected/10"
                          />
                        ))}
                      </div>
                      <p className="text-2xs text-text-secondary mt-1">
                        + 50 unidades parceiras
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Recursos */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 w-fit">
              <Sparkles size={13} />
              Tudo o que você precisa
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0">
                  <Scissors size={22} strokeWidth={2} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  Tudo o que você precisa
                </h2>
              </div>
              <p className="text-sm text-text-secondary max-w-md">
                Da escolha do profissional à confirmação do atendimento, tudo centralizado em um só lugar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 hover:border-selected/40 transition-all duration-200 bg-secondary"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${TOM_BADGE[feature.tom]}`}
                  >
                    <feature.icon size={22} strokeWidth={2} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2.5 py-1 rounded-full bg-white border border-border text-text-secondary">
                    <Sparkles size={10} className={feature.tom === 'selected' ? 'text-selected' : 'text-accent'} />
                    Destaque
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-lg text-text-primary tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border mt-auto">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary font-medium">100% online</span>
                    <div className="flex items-center gap-1 text-selected font-semibold group cursor-pointer">
                      <span>Saiba mais</span>
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Seção Como Funciona */}
        <section className="flex flex-col gap-8">
          <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20 shadow-xs">
                <Store size={28} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    Como funciona
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-selected/10 text-selected border border-selected/30">
                    <Sparkles size={12} />
                    3 passos simples
                  </span>
                </div>
                <p className="text-sm text-text-secondary">
                  Do cadastro ao primeiro atendimento, sem complicação e sem burocracia.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {PASSOS.map((passo, index) => (
              <Card
                key={passo.title}
                className="rounded-2xl p-6 flex flex-col gap-5 relative hover:shadow-md hover:border-selected/30 transition-all duration-200 bg-secondary"
              >
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-gradient-to-br from-selected to-accent text-white text-sm font-bold flex items-center justify-center shadow-md shadow-selected/25 border-2 border-primary">
                  {index + 1}
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${TOM_BADGE[passo.tom]}`}
                  >
                    <passo.icon size={22} strokeWidth={2} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-lg text-text-primary tracking-tight">
                    {passo.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {passo.description}
                  </p>
                </div>

                <div className="pt-3 mt-auto border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-selected font-semibold">
                    <span>Passo {index + 1} de 3</span>
                    <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden border border-border">
                      <div
                        className="h-full bg-gradient-to-r from-selected to-accent rounded-full"
                        style={{ width: `${((index + 1) / PASSOS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-secondary border border-border rounded-2xl p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-xs relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-selected/8 via-transparent to-accent/8" />

          <div className="relative flex flex-col gap-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-selected/10 text-selected border border-selected/20 w-fit">
              <CheckCircle2 size={14} />
              Pronto para começar?
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary tracking-tight leading-tight">
              Agende seu próximo corte em menos de 2 minutos
            </h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mt-1">
              Crie sua conta gratuitamente e comece a agendar seus atendimentos agora mesmo. Sem taxas, sem pegadinhas.
            </p>
          </div>

          <div className="relative flex flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto justify-center shadow-lg shadow-accent/25 gap-2">
                Criar conta grátis
                <ArrowRight size={18} />
              </Button>
            </Link>
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 text-xs text-text-secondary pt-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-selected" />
                <span>Cadastro rápido</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-selected" />
                <span>Sem mensalidade</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-selected" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-sm font-semibold text-text-primary tracking-tight">
                Barber Agenda
              </span>
            </div>
            <p className="text-xs text-text-secondary text-center sm:text-right">
              © {new Date().getFullYear()} Barber Agenda. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
