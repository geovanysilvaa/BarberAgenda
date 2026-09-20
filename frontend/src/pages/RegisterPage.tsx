import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserPlus,
  Sparkles,
  ArrowLeft,
  Scissors,
  CalendarCheck,
  Users,
  CheckCircle2,
  UserRound,
  Store,
  Crown,
} from 'lucide-react'
import { Card } from '../shared/ui/Card'
import { Logo } from '../shared/ui/Logo'
import { Button } from '../shared/ui/Button'
import { RegisterForm } from '../features/auth/ui/RegisterForm'

type TipoConta = 'cliente' | 'barbeiro'

export function RegisterPage() {
  const [tipoConta, setTipoConta] = useState<TipoConta>('cliente')
  const navigate = useNavigate()

  function handleTipoConta(tipo: TipoConta) {
    setTipoConta(tipo)
    if (tipo === 'barbeiro') {
      navigate('/register-barbershop')
    }
  }

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
            <div className="absolute top-0 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-selected/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

            <div className="relative flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 w-fit">
                <Sparkles size={14} />
                Criação de Conta Gratuita
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20 shadow-xs">
                  <UserPlus size={24} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    Criar minha conta
                  </h1>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Cadastre-se em menos de 1 minuto e comece a agendar seus atendimentos agora.
                  </p>
                </div>
              </div>
            </div>

            {/* Cards de Benefícios */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20">
                  <CalendarCheck size={18} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Agendamento Fácil
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Marque horários em qualquer barbearia parceira sem precisar ligar.
                  </p>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                  <Users size={18} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Perfil Personalizado
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Guarde seus barbeiros e serviços favoritos para agendar mais rápido.
                  </p>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20">
                  <Scissors size={18} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Seja Profissional
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Também é barbeiro? Cadastre-se como profissional na sua unidade.
                  </p>
                </div>
              </Card>
            </div>

            {/* Selo de Benefícios */}
            <div className="relative mt-auto flex flex-wrap items-center gap-3 pt-3 border-t border-border/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">100% gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">Sem mensalidade</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">Cancele quando quiser</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Formulário */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <Card className="rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs bg-secondary border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-selected/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

              <div className="relative flex items-center gap-3 pb-1">
                <div className="w-11 h-11 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20">
                  <UserRound size={20} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">
                    Criar conta
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Preencha abaixo para começar a usar
                  </p>
                </div>
              </div>

              {/* Seletor Tipo de Conta */}
              <div className="relative grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1.5 border border-border/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleTipoConta('cliente')}
                  className={`relative rounded-xl py-2.5 px-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    tipoConta === 'cliente'
                      ? 'bg-gradient-to-b from-selected to-indigo-700 text-white shadow-sm shadow-selected/25'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <UserRound size={15} />
                  Sou cliente
                </button>
                <button
                  type="button"
                  onClick={() => handleTipoConta('barbeiro')}
                  className={`relative rounded-xl py-2.5 px-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    tipoConta === 'barbeiro'
                      ? 'bg-gradient-to-b from-selected to-indigo-700 text-white shadow-sm shadow-selected/25'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Crown size={15} />
                  Sou dono
                </button>
              </div>

              {tipoConta === 'barbeiro' ? (
                <div className="relative rounded-2xl p-5 border border-amber-400/30 bg-amber-500/5 flex flex-col gap-3 items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-400/30">
                    <Store size={22} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-base text-text-primary tracking-tight">
                      Cadastrar Barbearia
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Para donos de estabelecimento, criamos uma página exclusiva de cadastro da unidade com todas as configurações necessárias.
                    </p>
                  </div>
                  <Link to="/register-barbershop" className="w-full">
                    <Button variant="primary" size="sm" className="w-full justify-center gap-1.5">
                      Ir para Cadastro de Unidade
                      <Sparkles size={14} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <RegisterForm />
                </div>
              )}

              <div className="relative pt-3 border-t border-border/80">
                <div className="rounded-xl bg-accent/5 border border-accent/15 p-4 flex flex-col items-center gap-2 text-center">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Já possui uma conta criada?
                  </p>
                  <Link to="/login" className="w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-center gap-1.5">
                      Fazer login na minha conta
                      <CheckCircle2 size={14} />
                    </Button>
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
