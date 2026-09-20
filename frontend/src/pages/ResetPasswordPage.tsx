import { Link, useSearchParams } from 'react-router-dom'
import {
  KeyRound,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
} from 'lucide-react'
import { Card } from '../shared/ui/Card'
import { ErrorMessage } from '../shared/ui/ErrorMessage'
import { Logo } from '../shared/ui/Logo'
import { Button } from '../shared/ui/Button'
import { ResetPasswordForm } from '../features/auth/ui/ResetPasswordForm'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-selected/10 text-selected border border-selected/20 w-fit">
                <Sparkles size={14} />
                Criar Nova Senha
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20 shadow-xs">
                  <Unlock size={24} strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    Redefinir sua senha
                  </h1>
                  <p className="text-sm text-text-secondary mt-0.5">
                    Escolha uma senha forte e segura para voltar a acessar sua conta Barber Agenda.
                  </p>
                </div>
              </div>
            </div>

            {/* Dicas de Segurança */}
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20">
                  <ShieldCheck size={18} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Mínimo de 8 caracteres
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Quanto maior a senha, mais difícil ela será de ser descoberta.
                  </p>
                </div>
              </Card>

              <Card className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 bg-secondary/60 hover:border-selected/30 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                  <Lock size={18} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-text-primary tracking-tight">
                    Misture tipos de caractere
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Use letras maiúsculas, minúsculas, números e símbolos especiais.
                  </p>
                </div>
              </Card>
            </div>

            {/* Selo de Segurança */}
            <div className="relative mt-auto flex flex-wrap items-center gap-3 pt-3 border-t border-border/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">Link validado</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">Senha criptografada</span>
              </div>
              <div className="flex items-center gap-2">
                <KeyRound size={15} className="text-selected" />
                <span className="text-xs font-medium text-text-secondary">Sessão única e segura</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Formulário */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <Card className="rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs bg-secondary border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-selected/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

              <div className="relative flex items-center gap-3 pb-1">
                <div className="w-11 h-11 rounded-xl bg-selected/10 text-selected flex items-center justify-center shrink-0 border border-selected/20">
                  <KeyRound size={20} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-xl font-bold text-text-primary tracking-tight">
                    Nova senha
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Digite e confirme sua nova senha abaixo
                  </p>
                </div>
              </div>

              {token ? (
                <div className="relative">
                  <ResetPasswordForm token={token} />
                </div>
              ) : (
                <div className="relative flex flex-col gap-3">
                  <ErrorMessage>
                    Link inválido ou incompleto. Solicite uma nova recuperação de senha para gerar um link válido.
                  </ErrorMessage>
                  <Link to="/recover-password" className="w-full">
                    <Button variant="primary" size="sm" className="w-full justify-center gap-1.5">
                      Solicitar nova recuperação
                      <Sparkles size={14} />
                    </Button>
                  </Link>
                </div>
              )}

              <div className="relative pt-3 border-t border-border/80 flex flex-col gap-3">
                <div className="rounded-xl bg-accent/5 border border-accent/15 p-4 flex flex-col items-center gap-2 text-center">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Tudo certo com a nova senha?
                  </p>
                  <Link to="/login" className="w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-center gap-1.5">
                      Ir para a tela de login
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
