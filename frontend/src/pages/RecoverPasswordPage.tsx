import { Link } from 'react-router-dom'
import {
  KeyRound,
  Sparkles,
  ArrowLeft,
  Mail,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { Card } from '../shared/ui/Card'
import { Logo } from '../shared/ui/Logo'
import { Button } from '../shared/ui/Button'
import { RecoverPasswordForm } from '../features/auth/ui/RecoverPasswordForm'

export function RecoverPasswordPage() {
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
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-medium group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar para o login</span>
          </Link>
        </div>

        {/* Hero + Formulário */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Lado Esquerdo: Painel de Destaque / Hero */}
          <div className="lg:col-span-3 bg-secondary border border-border rounded-2xl p-6 sm:p-8 lg:p-10 flex flex-col gap-8 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-selected/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

            <div className="relative flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 w-fit">
                <Sparkles size={14} />
                Recuperação de Senha
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20 shadow-xs">
                  <KeyRound size={24} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    Esqueceu sua senha?
                  </h1>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Sem problemas! Enviaremos um link de recuperação para o seu e-mail cadastrado.
                  </p>
                </div>
              </div>
            </div>

            {/* Cards de Passos */}
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20 relative">
                  <Mail size={18} strokeWidth={2} />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-selected text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    1
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Informe seu e-mail
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Digite o e-mail usado no momento do cadastro da sua conta.
                  </p>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20 relative">
                  <Send size={18} strokeWidth={2} />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    2
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Receba o link
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Enviamos um e-mail com um link exclusivo para redefinir sua senha.
                  </p>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20 relative">
                  <KeyRound size={18} strokeWidth={2} />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-selected text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    3
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Crie uma nova senha
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Acesse o link, escolha uma nova senha segura e volte a usar sua conta.
                  </p>
                </div>
              </Card>
            </div>

            {/* Selo de Segurança */}
            <div className="relative mt-auto flex flex-wrap items-center gap-3 pt-3 border-t border-border/80">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">Link seguro e temporário</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">Expira em 1 hora</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">Sem compartilhamento de dados</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Formulário */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <Card className="rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs bg-secondary border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

              <div className="relative flex items-center gap-3 pb-1">
                <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                  <Mail size={20} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">
                    Recuperar senha
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Informe seu e-mail para receber o link
                  </p>
                </div>
              </div>

              <div className="relative">
                <RecoverPasswordForm />
              </div>

              <div className="relative pt-3 border-t border-border/80 flex flex-col gap-3">
                <div className="rounded-xl bg-selected/5 border border-selected/15 p-4 flex flex-col items-center gap-2 text-center">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Lembrou da sua senha? Volte para acessar sua conta.
                  </p>
                  <Link to="/login" className="w-full">
                    <Button variant="primary" size="sm" className="w-full justify-center gap-1.5">
                      Fazer login
                      <CheckCircle2 size={14} />
                    </Button>
                  </Link>
                </div>

                <p className="text-[11px] text-text-secondary leading-relaxed text-center px-1">
                  Não recebeu o e-mail? Verifique sua caixa de spam ou lixo eletrônico. O link de recuperação é enviado automaticamente após a solicitação.
                </p>
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
