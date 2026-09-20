import { Link } from 'react-router-dom'
import {
  LogIn,
  Sparkles,
  ArrowLeft,
  CalendarCheck,
  Scissors,
  BellRing,
  CheckCircle2,
  UserRound,
  KeyRound,
} from 'lucide-react'
import { Card } from '../shared/ui/Card'
import { Logo } from '../shared/ui/Logo'
import { Button } from '../shared/ui/Button'
import { LoginForm } from '../features/auth/ui/LoginForm'

export function LoginPage() {
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
              <Button variant="primary" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="sm">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        {/* Navegação de retorno */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar para a página inicial</span>
          </Link>
        </div>

        {/* Hero + Formulário */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Lado Esquerdo: Painel de Destaque / Hero */}
          <div className="lg:col-span-3 bg-secondary border border-border rounded-2xl p-6 sm:p-8 lg:p-10 flex flex-col gap-8 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-selected/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

            <div className="relative flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-selected/10 text-selected border border-selected/20 w-fit">
                <Sparkles size={14} />
                Área do Cliente e Profissional
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20 shadow-xs">
                  <LogIn size={24} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    Acessar sua conta
                  </h1>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Entre para agendar, gerenciar seus atendimentos e acompanhar tudo em tempo real.
                  </p>
                </div>
              </div>
            </div>

            {/* Cards de Benefícios */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20">
                  <Scissors size={18} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Agendamentos
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Marque, reagende ou cancele horários em qualquer barbearia parceira.
                  </p>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                  <CalendarCheck size={18} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Minha Agenda
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Profissionais acompanham seus horários do dia com praticidade.
                  </p>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20">
                  <BellRing size={18} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Notificações
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Receba lembretes e confirmações por e-mail automaticamente.
                  </p>
                </div>
              </Card>
            </div>

            {/* Selo de Segurança */}
            <div className="relative mt-auto flex flex-wrap items-center gap-3 pt-3 border-t border-border/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">100% seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">Sem pegadinhas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">Acesso em qualquer dispositivo</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Formulário */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <Card className="rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs bg-secondary border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

              <div className="relative flex items-center gap-3 pb-1">
                <div className="w-11 h-11 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20">
                  <UserRound size={20} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">
                    Entrar
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Informe seus dados para acessar a plataforma
                  </p>
                </div>
              </div>

              <div className="relative">
                <LoginForm />
              </div>

              <div className="relative pt-3 border-t border-border/80 flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2">
                  <KeyRound size={13} className="text-text-secondary" />
                  <Link
                    to="/recover-password"
                    className="text-xs font-medium text-selected hover:underline"
                  >
                    Esqueceu sua senha? Recupere aqui
                  </Link>
                </div>

                <div className="rounded-xl bg-selected/5 border border-selected/15 p-4 flex flex-col items-center gap-2 text-center">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Ainda não tem uma conta na plataforma?
                  </p>
                  <Link to="/register" className="w-full">
                    <Button variant="primary" size="sm" className="w-full justify-center gap-1.5">
                      Criar minha conta
                      <Sparkles size={14} />
                    </Button>
                  </Link>
                  <Link
                    to="/register-barbershop"
                    className="text-[11px] font-medium text-text-secondary hover:text-selected hover:underline -mt-1"
                  >
                    Sou dono de barbearia → quero cadastrar minha unidade
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-4 pb-8 border-t border-border mt-4">
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
