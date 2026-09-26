import { Link } from 'react-router-dom'
import { Scissors } from 'lucide-react'
import { LoginForm } from '../features/auth/ui/LoginForm'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fef7ff] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-sm flex flex-col items-center gap-10">
          {/* Logo e Título */}
          <div className="flex flex-col items-center gap-5 text-center w-full">
            <div className="w-24 h-24 rounded-full bg-[#e9e3ff] flex items-center justify-center">
              <Scissors size={44} strokeWidth={2} className="text-[#6d5bd9]" />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <h1
                className="font-bold text-[#6d5bd9] tracking-tight"
                style={{ fontSize: '2.75rem', lineHeight: 1.1 }}
              >
                barberAgenda
              </h1>
              <p className="text-[#6b6778] text-lg font-medium">
                Seu estilo no horário certo
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="w-full">
            <LoginForm />
          </div>
        </div>
      </main>

      {/* Link de cadastro no rodapé */}
      <footer className="pb-10 pt-4 text-center">
        <p className="text-base text-[#6b6778]">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-[#6d5bd9] font-semibold hover:underline">
            Criar conta
          </Link>
        </p>
      </footer>
    </div>
  )
}
